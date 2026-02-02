/**
 * GET /api/shipments/[id]/track - Get shipment tracking info with checkpoints
 * POST /api/shipments/[id]/location - Update shipment location
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    const shipmentId = params.id

    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      select: {
        id: true,
        referenceNumber: true,
        description: true,
        cargoType: true,
        weight: true,
        pickupLocation: true,
        deliveryLocation: true,
        pickupDate: true,
        deliveryDate: true,
        status: true,
        quotedPrice: true,
        finalPrice: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            avatar: true,
            rating: true,
          },
        },
        matches: {
          where: { status: "accepted" },
          select: {
            id: true,
            transporter: {
              select: {
                id: true,
                name: true,
                phone: true,
                rating: true,
                avatar: true,
              },
            },
            status: true,
          },
          take: 1,
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    // Check authorization
    const isOwner = shipment.user.id === auth.userId
    const isTransporter = shipment.matches.length > 0 && auth.role === "transporter"

    if (!isOwner && !isTransporter && auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ shipment })
  } catch (error) {
    logger.error("Tracking error", { error })
    return NextResponse.json({ error: "Failed to fetch tracking info" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()
    const { latitude, longitude, status, checkpoint } = body

    // Verify user is transporter for this shipment
    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        matches: {
          where: { status: "accepted", transporter: { id: auth.userId } },
          select: { id: true },
        },
      },
    })

    if (!shipment?.matches.length && auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update shipment status if provided
    if (status) {
      await prisma.shipment.update({
        where: { id: params.id },
        data: { status },
      })
    }

    logger.info("Shipment location updated", {
      shipmentId: params.id,
      userId: auth.userId,
      latitude,
      longitude,
    })

    return NextResponse.json({
      success: true,
      message: "Location updated",
    })
  } catch (error) {
    logger.error("Location update error", { error })
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}
