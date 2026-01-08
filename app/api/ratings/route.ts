/**
 * Ratings API
 * POST /api/ratings - Create a rating
 * GET /api/ratings - List ratings (with filters)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { rateLimiter } from "@/lib/rate-limit/rate-limiter"
import { createRatingSchema, getRatingsSchema } from "@/lib/validators/api-schemas"
import { logger } from "@/lib/monitoring/logger"

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const rateLimit = await rateLimiter.checkLimit(auth.userId, "ratings:create")

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const body = await request.json()
    const data = createRatingSchema.parse(body)

    // Verify shipment exists and user is authorized
    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId },
      include: {
        user: true,
        matches: {
          where: {
            status: "accepted",
            transporterId: data.toUserId,
          },
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    // Verify user is part of this shipment
    const isShipper = shipment.userId === auth.userId
    const isTransporter = shipment.matches.some((m) => m.transporterId === auth.userId)

    if (!isShipper && !isTransporter) {
      return NextResponse.json({ error: "Unauthorized to rate this shipment" }, { status: 403 })
    }

    // Verify toUserId is the other party
    const expectedToUserId = isShipper ? shipment.matches[0]?.transporterId : shipment.userId
    if (data.toUserId !== expectedToUserId) {
      return NextResponse.json({ error: "Invalid rating target" }, { status: 400 })
    }

    // Check if rating already exists
    const existingRating = await prisma.rating.findFirst({
      where: {
        shipmentId: data.shipmentId,
        fromUserId: auth.userId,
        toUserId: data.toUserId,
      },
    })

    if (existingRating) {
      return NextResponse.json({ error: "Rating already exists" }, { status: 409 })
    }

    // Create rating
    const rating = await prisma.rating.create({
      data: {
        shipmentId: data.shipmentId,
        fromUserId: auth.userId,
        toUserId: data.toUserId,
        fromRole: isShipper ? "shipper" : "transporter",
        toRole: isShipper ? "transporter" : "shipper",
        overallRating: data.overallRating,
        categoryRatings: data.categoryRatings,
        tags: data.tags || [],
        review: data.review,
      },
    })

    // Update user's average rating
    const userRatings = await prisma.rating.findMany({
      where: { toUserId: data.toUserId },
      select: { overallRating: true },
    })

    const averageRating = userRatings.reduce((sum, r) => sum + r.overallRating, 0) / userRatings.length

    await prisma.user.update({
      where: { id: data.toUserId },
      data: {
        rating: averageRating,
        totalRatings: userRatings.length,
      },
    })

    return NextResponse.json({ rating }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error creating rating", {
      userId: auth?.userId,
      shipmentId: data?.shipmentId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const rateLimit = await rateLimiter.checkLimit(auth.userId, "ratings:read")

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const searchParams = request.nextUrl.searchParams
    const params = getRatingsSchema.parse({
      userId: searchParams.get("userId"),
      shipmentId: searchParams.get("shipmentId"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    })

    const where: any = {}

    if (params.userId) {
      where.toUserId = params.userId
    }

    if (params.shipmentId) {
      where.shipmentId = params.shipmentId
    }

    const [ratings, total] = await Promise.all([
      prisma.rating.findMany({
        where,
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          shipment: {
            select: {
              id: true,
              reference: true,
              originCity: true,
              destinationCity: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.rating.count({ where }),
    ])

    return NextResponse.json({
      ratings,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request parameters", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error fetching ratings", {
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

