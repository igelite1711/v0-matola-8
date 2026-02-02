/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request)

    const result = await prisma.notification.updateMany({
      where: {
        userId: auth.userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ updated: result.count })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error marking all notifications as read", {
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

