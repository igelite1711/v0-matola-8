/**
 * Update Checkpoint
 * PUT /api/shipments/[id]/checkpoints/[checkpointId]
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { updateCheckpointSchema } from "@/lib/validators/api-schemas"
import { logger } from "@/lib/monitoring/logger"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; checkpointId: string }> },
) {
  try {
    const auth = await requireAuth(request)
    const { id: shipmentId, checkpointId } = await params
    const body = await request.json()
    const data = updateCheckpointSchema.parse(body)

    // Verify checkpoint exists
    const checkpoint = await prisma.checkpoint.findUnique({
      where: { id: checkpointId },
      include: {
        shipment: {
          include: {
            matches: {
              where: {
                status: "accepted",
              },
            },
          },
        },
      },
    })

    if (!checkpoint || checkpoint.shipmentId !== shipmentId) {
      return NextResponse.json({ error: "Checkpoint not found" }, { status: 404 })
    }

    // Check authorization
    const isShipper = checkpoint.shipment.shipperId === auth.userId
    const isTransporter = checkpoint.shipment.matches.some((m) => m.transporterId === auth.userId)

    if (!isShipper && !isTransporter && auth.userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updated = await prisma.checkpoint.update({
      where: { id: checkpointId },
      data: {
        arrivedAt: data.arrivedAt ? new Date(data.arrivedAt) : undefined,
        departedAt: data.departedAt ? new Date(data.departedAt) : undefined,
        notes: data.notes,
        confirmedBy: data.confirmedBy || (isTransporter ? "driver" : "shipper"),
      },
    })

    return NextResponse.json({ checkpoint: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error updating checkpoint", {
      shipmentId,
      checkpointId,
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
