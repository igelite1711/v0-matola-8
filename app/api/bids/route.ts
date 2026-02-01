/**
 * POST /api/bids - Submit a bid on a shipment
 * GET /api/bids - List bids (with optional filters)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { checkGeneralRateLimit, createRateLimitHeaders } from "@/lib/rate-limit/rate-limiter"
import { logger } from "@/lib/monitoring/logger"
import { submitBidSchema, getBidsSchema } from "@/lib/validators/api-schemas"

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("X-Request-ID") || `req_${Date.now()}`
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"

  try {
    // Rate limiting
    const rateLimit = await checkGeneralRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: createRateLimitHeaders(rateLimit) },
      )
    }

    // Require transporter role
    const auth = await requireAuth(request)
    if (auth.role !== "transporter") {
      return NextResponse.json({ error: "Only transporters can submit bids" }, { status: 403 })
    }

    // Parse and validate
    const body = await request.json()
    const validated = submitBidSchema.parse(body)

    // Verify shipment exists and is available for bidding
    const shipment = await prisma.shipment.findUnique({
      where: { id: validated.shipmentId },
      include: {
        bids: {
          where: { transporterId: auth.userId },
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    if (shipment.status !== "posted") {
      return NextResponse.json(
        { error: "Shipment is not available for bidding" },
        { status: 400 },
      )
    }

    // Check if transporter already has a bid on this shipment
    if (shipment.bids.length > 0) {
      return NextResponse.json(
        { error: "You have already submitted a bid on this shipment" },
        { status: 409 },
      )
    }

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        shipmentId: validated.shipmentId,
        transporterId: auth.userId,
        amount: validated.amount,
        message: validated.message || validated.messageNy || undefined, // Store message (Chichewa if provided, otherwise English)
        status: "pending",
      },
      include: {
        transporter: {
          select: {
            id: true,
            name: true,
            phone: true,
            rating: true,
          },
        },
        shipment: {
          select: {
            id: true,
            shipperId: true,
            shipper: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    logger.info("Bid submitted", {
      requestId,
      bidId: bid.id,
      shipmentId: validated.shipmentId,
      transporterId: auth.userId,
    })

    // Create notification for shipper (async, don't await)
    prisma.notification
      .create({
        data: {
          userId: bid.shipment.shipperId,
          type: "bid",
          title: "New Bid Received",
          message: `${bid.transporter.name} submitted a bid of MWK ${validated.amount.toLocaleString()}`,
          link: `/dashboard/shipments/${validated.shipmentId}`,
          read: false,
        },
      })
      .catch((error) => {
        logger.error("Failed to create bid notification", { error, bidId: bid.id })
      })

    return NextResponse.json(
      {
        success: true,
        bid: {
          id: bid.id,
          shipmentId: bid.shipmentId,
          transporterId: bid.transporterId,
          transporterName: bid.transporter.name,
          transporterRating: bid.transporter.rating,
          amount: bid.amount,
          proposedPrice: bid.amount, // Alias for compatibility
          message: bid.message,
          status: bid.status,
          estimatedPickup: validated.estimatedPickup ? new Date(validated.estimatedPickup) : new Date(),
          createdAt: bid.createdAt,
        },
      },
      { status: 201, headers: createRateLimitHeaders(rateLimit) },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Submit bid error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const params = getBidsSchema.parse({
      shipmentId: searchParams.get("shipmentId"),
      transporterId: searchParams.get("transporterId"),
      status: searchParams.get("status"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    })

    const where: any = {}

    // Filter by role
    if (auth.role === "shipper") {
      // Shippers can only see bids on their shipments
      where.shipment = {
        shipperId: auth.userId,
      }
    } else if (auth.role === "transporter") {
      // Transporters can only see their own bids
      where.transporterId = auth.userId
    }

    if (params.shipmentId) {
      where.shipmentId = params.shipmentId
    }
    if (params.transporterId && auth.role === "admin") {
      where.transporterId = params.transporterId
    }
    if (params.status) {
      where.status = params.status
    }

    const bids = await prisma.bid.findMany({
      where,
      include: {
        transporter: {
          select: {
            id: true,
            name: true,
            phone: true,
            rating: true,
            verified: true,
          },
        },
        shipment: {
          select: {
            id: true,
            referenceNumber: true,
            originCity: true,
            destinationCity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: params.limit,
      skip: params.offset,
    })

    const total = await prisma.bid.count({ where })

    return NextResponse.json({
      bids: bids.map((bid) => ({
        id: bid.id,
        shipmentId: bid.shipmentId,
        transporterId: bid.transporterId,
        transporterName: bid.transporter.name,
        transporterRating: bid.transporter.rating,
        amount: bid.amount,
        proposedPrice: bid.amount, // Alias for compatibility
        message: bid.message,
        status: bid.status,
        estimatedPickup: new Date(), // Default to now since schema doesn't store this
        createdAt: bid.createdAt,
      })),
      pagination: {
        total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < total,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Get bids error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
