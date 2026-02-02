/**
 * GET /api/notifications - Get user notifications
 * PATCH /api/notifications/[id]/read - Mark notification as read
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")
    const unreadOnly = searchParams.get("unread") === "true"

    const where: any = { userId: auth.userId }
    if (unreadOnly) {
      where.read = false
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          data: true,
          read: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where: { userId: auth.userId, read: false } }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
      },
    })
  } catch (error) {
    logger.error("Notifications fetch error", { error })
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
