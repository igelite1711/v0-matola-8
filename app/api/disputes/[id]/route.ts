/**
 * Dispute API
 * GET /api/disputes/[id] - Get dispute details
 * PUT /api/disputes/[id] - Update dispute (admin only)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { updateDisputeSchema } from "@/lib/validators/api-schemas"
import { notificationQueue } from "@/lib/queue/queue"
import { logger } from "@/lib/monitoring/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        shipment: {
          include: {
            shipper: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
        reportedByUser: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        againstUser: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 })
    }

    // Check authorization
    if (
      auth.userRole !== "admin" &&
      dispute.reportedBy !== auth.userId &&
      dispute.againstUser !== auth.userId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ dispute })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error fetching dispute", {
      disputeId: id,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request)

    // Only admins can update disputes
    if (auth.userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateDisputeSchema.parse(body)

    const dispute = await prisma.dispute.findUnique({
      where: { id },
    })

    if (!dispute) {
      return NextResponse.json({ error: "Dispute not found" }, { status: 404 })
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        status: data.status,
        resolution: data.resolution,
        resolvedAt: data.status === "resolved" ? new Date() : undefined,
      },
    })

    // Notify parties if resolved
    if (data.status === "resolved" && data.resolution) {
      await notificationQueue.add("dispute-resolved", {
        disputeId: id,
        reportedBy: dispute.reportedBy,
        againstUser: dispute.againstUser,
        resolution: data.resolution,
      })
    }

    return NextResponse.json({ dispute: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error updating dispute", {
      disputeId: id,
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
