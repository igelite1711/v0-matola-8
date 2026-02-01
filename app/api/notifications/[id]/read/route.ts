/**
 * Mark notification as read
 * PUT /api/notifications/[id]/read
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAuth(request)
    const { id } = await params

    const notification = await prisma.notification.findUnique({
      where: { id },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    if (notification.userId !== auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    })

    return NextResponse.json({ notification: updated })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error marking notification as read", {
      notificationId: id,
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
