/**
 * Notifications API
 * GET /api/notifications - List user notifications
 * POST /api/notifications - Create notification (admin/internal)
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { rateLimiter } from "@/lib/rate-limit/rate-limiter"
import { logger } from "@/lib/monitoring/logger"

const getNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z.coerce.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const rateLimit = await rateLimiter.checkLimit(auth.userId, "notifications:read")

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const searchParams = request.nextUrl.searchParams
    const params = getNotificationsSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      unreadOnly: searchParams.get("unreadOnly"),
    })

    const where: any = {
      userId: auth.userId,
    }

    if (params.unreadOnly) {
      where.read = false
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.notification.count({ where }),
    ])

    return NextResponse.json({
      notifications,
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
    logger.error("Error fetching notifications", {
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
