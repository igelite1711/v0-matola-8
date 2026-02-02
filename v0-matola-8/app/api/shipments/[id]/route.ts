/**
 * GET /api/shipments/[id] - Get shipment details
 * PATCH /api/shipments/[id] - Update shipment
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"
import { updateShipmentSchema } from "@/lib/validators/api-schemas"
import { invariantEngine } from "@/lib/safety/invariant-engine"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        shipper: {
          select: {
            id: true,
            name: true,
            phone: true,
            rating: true,
            verified: true,
            verificationLevel: true,
          },
        },
        checkpoints: true,
        matches: {
          include: {
            transporter: {
              select: {
                id: true,
                name: true,
                phone: true,
                rating: true,
              },
            },
          },
        },
        bids: {
          include: {
            transporter: {
              select: {
                id: true,
                name: true,
                phone: true,
                rating: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    // Check access
    if (shipment.shipperId !== auth.userId && auth.role !== "admin") {
      // Allow transporters to view posted shipments
      if (shipment.status !== "posted") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    return NextResponse.json({ shipment })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Get shipment error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params

    const shipment = await prisma.shipment.findUnique({
      where: { id },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    // Only shipper or admin can update
    if (shipment.shipperId !== auth.userId && auth.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Enforce Auth Suspension Invariant
    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    await invariantEngine.execute(
      ["INV-AUTH-SUSPEND"],
      { userStatus: user?.status || 'active' },
      async () => { }
    )

    const body = await request.json()

    // Validate update data
    const validated = updateShipmentSchema.parse(body)

    // Enforce Shipment State Machine Invariant
    if (validated.status && validated.status !== shipment.status) {
      await invariantEngine.execute(
        ["INV-SHIP-STATE"],
        { oldStatus: shipment.status, newStatus: validated.status },
        async () => { }
      )

      // Enforce High Value Review Invariant if matching/accepting
      if (['matched', 'accepted'].includes(validated.status)) {
        await invariantEngine.execute(
          ["INV-SHIP-HIGHVAL"],
          { price: shipment.price, isReviewed: shipment.isReviewed || false },
          async () => { }
        )
      }
    }

    const updated = await prisma.shipment.update({
      where: { id },
      data: validated,
    })

    logger.info("Shipment updated", { shipmentId: id, userId: auth.userId })

    return NextResponse.json({ success: true, shipment: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Update shipment error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
