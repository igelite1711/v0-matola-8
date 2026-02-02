/**
 * Disputes API
 * POST /api/disputes - Create a dispute
 * GET /api/disputes - List disputes
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { rateLimiter } from "@/lib/rate-limit/rate-limiter"
import { createDisputeSchema, getDisputesSchema } from "@/lib/validators/api-schemas"
import { notificationQueue } from "@/lib/queue/queue"
import { logger } from "@/lib/monitoring/logger"

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const rateLimit = await rateLimiter.checkLimit(auth.userId, "disputes:create")

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const body = await request.json()
    const data = createDisputeSchema.parse(body)

    // Verify shipment exists and user is authorized
    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId },
      include: {
        user: true,
        matches: {
          where: {
            status: "accepted",
          },
          take: 1,
        },
      },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    // Determine user role and against user
    const isShipper = shipment.userId === auth.userId
    const isTransporter = shipment.matches.some((m) => m.transporterId === auth.userId)

    if (!isShipper && !isTransporter) {
      return NextResponse.json({ error: "Unauthorized to create dispute for this shipment" }, { status: 403 })
    }

    const againstUserId = isShipper ? shipment.matches[0]?.transporterId : shipment.userId
    if (!againstUserId) {
      return NextResponse.json({ error: "No matching party found" }, { status: 400 })
    }

    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        shipmentId: data.shipmentId,
        reportedBy: auth.userId,
        reportedByRole: isShipper ? "shipper" : "transporter",
        againstUser: againstUserId,
        againstUserRole: isShipper ? "transporter" : "shipper",
        type: data.type,
        description: data.description,
        images: data.images || [],
        voiceNoteUrl: data.voiceNoteUrl,
        status: "open",
      },
    })

    // Notify admin and other party
    await notificationQueue.add("dispute-opened", {
      disputeId: dispute.id,
      shipmentId: data.shipmentId,
      reportedBy: auth.userId,
      againstUser: againstUserId,
      type: data.type,
    })

    return NextResponse.json({ dispute }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error creating dispute", {
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const rateLimit = await rateLimiter.checkLimit(auth.userId, "disputes:read")

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const searchParams = request.nextUrl.searchParams
    const params = getDisputesSchema.parse({
      shipmentId: searchParams.get("shipmentId"),
      status: searchParams.get("status"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    })

    const where: any = {}

    // Regular users can only see their own disputes
    if (auth.userRole !== "admin") {
      where.OR = [{ reportedBy: auth.userId }, { againstUser: auth.userId }]
    }

    if (params.shipmentId) {
      where.shipmentId = params.shipmentId
    }

    if (params.status) {
      where.status = params.status
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        include: {
          shipment: {
            select: {
              id: true,
              reference: true,
              originCity: true,
              destinationCity: true,
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
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.dispute.count({ where }),
    ])

    return NextResponse.json({
      disputes,
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
    logger.error("Error fetching disputes", {
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

