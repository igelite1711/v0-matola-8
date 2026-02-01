/**
 * Checkpoints API
 * POST /api/shipments/[id]/checkpoints - Add checkpoint
 * GET /api/shipments/[id]/checkpoints - List checkpoints
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { createCheckpointSchema } from "@/lib/validators/api-schemas"
import { notificationQueue } from "@/lib/queue/queue"
import { logger } from "@/lib/monitoring/logger"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request)
    const { id: shipmentId } = await params
    const body = await request.json()
    const data = createCheckpointSchema.parse(body)

    // Verify shipment exists and user is authorized
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        shipper: true,
        matches: {
          where: {
            status: "accepted",
          },
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    // Check authorization (shipper or transporter)
    const isShipper = shipment.shipperId === auth.userId
    const isTransporter = shipment.matches.some((m) => m.transporterId === auth.userId)

    if (!isShipper && !isTransporter) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Create checkpoint
    const checkpoint = await prisma.checkpoint.create({
      data: {
        shipmentId,
        name: data.name,
        city: data.city,
        district: data.district,
        region: data.region,
        lat: data.lat,
        lng: data.lng,
        notes: data.notes,
        confirmedBy: isTransporter ? "driver" : "shipper",
        arrivedAt: new Date(),
      },
    })

    // Notify other party
    const notifyUserId = isShipper ? shipment.matches[0]?.transporterId : shipment.shipperId
    if (notifyUserId) {
      await notificationQueue.add("checkpoint-update", {
        shipmentId,
        checkpointId: checkpoint.id,
        checkpointName: data.name,
        userId: notifyUserId,
      })
    }

    return NextResponse.json({ checkpoint }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error creating checkpoint", {
      shipmentId,
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request)
    const { id: shipmentId } = await params

    // Verify shipment exists and user is authorized
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        matches: {
          where: {
            status: "accepted",
          },
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    const isShipper = shipment.shipperId === auth.userId
    const isTransporter = shipment.matches.some((m) => m.transporterId === auth.userId)

    if (!isShipper && !isTransporter && auth.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const checkpoints = await prisma.checkpoint.findMany({
      where: { shipmentId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ checkpoints })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error fetching checkpoints", {
      shipmentId,
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
