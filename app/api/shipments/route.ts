/**
 * GET /api/shipments - List shipments
 * POST /api/shipments - Create shipment
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { checkGeneralRateLimit, createRateLimitHeaders } from "@/lib/rate-limit/rate-limiter"
import { logger } from "@/lib/monitoring/logger"
import { createShipmentSchema, getShipmentsSchema } from "@/lib/validators/api-schemas"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const params = getShipmentsSchema.parse({
      status: searchParams.get("status"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
      originCity: searchParams.get("originCity"),
      destinationCity: searchParams.get("destinationCity"),
      cargoType: searchParams.get("cargoType"),
    })

    const where: any = {}

    // Filter by role
    if (auth.role === "shipper") {
      where.shipperId = auth.userId
    } else if (auth.role === "transporter") {
      where.status = "posted" // Only show available shipments
    }

    if (params.status) {
      where.status = params.status
    }
    if (params.originCity) {
      where.originCity = params.originCity
    }
    if (params.destinationCity) {
      where.destinationCity = params.destinationCity
    }
    if (params.cargoType) {
      where.cargoType = params.cargoType
    }

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        shipper: {
          select: {
            id: true,
            name: true,
            phone: true,
            rating: true,
            verified: true,
          },
        },
        matches: {
          where: { transporterId: auth.userId },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: params.limit,
      skip: params.offset,
    })

    const total = await prisma.shipment.count({ where })

    return NextResponse.json({
      shipments,
      pagination: {
        total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < total,
      },
    })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Get shipments error", { 
      error: error instanceof Error ? error : undefined,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Require shipper role
    const auth = await requireAuth(request)
    if (auth.role !== "shipper") {
      return NextResponse.json({ error: "Only shippers can create shipments" }, { status: 403 })
    }

    // Parse and validate
    const body = await request.json()
    const validated = createShipmentSchema.parse(body)

    // Generate reference
    const reference = `ML${Date.now().toString().slice(-6)}`

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        shipperId: auth.userId,
        reference,
        ...validated,
        pickupDate: new Date(validated.pickupDate),
        status: "posted",
      },
      include: {
        shipper: {
          select: {
            id: true,
            name: true,
            phone: true,
            rating: true,
          },
        },
      },
    })

    logger.info("Shipment created", { requestId, shipmentId: shipment.id, shipperId: auth.userId })

    // Trigger matching in background
    const { matchingQueue } = await import("@/lib/queue/queue")
    await matchingQueue.add(
      "match-shipment",
      {
        shipmentId: shipment.id,
        priority: "normal",
      },
      {
        jobId: `match-${shipment.id}`,
        attempts: 3,
      },
    )

    return NextResponse.json(
      { success: true, shipment },
      { status: 201, headers: createRateLimitHeaders(rateLimit) },
    )
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Create shipment error", {
      requestId,
      error: error instanceof Error ? error : undefined,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
