/**
 * GET /api/admin/analytics - Get platform analytics
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)

    // Check if admin
    if (auth.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const [users, shipments, transactions, disputes] = await Promise.all([
      prisma.user.count(),
      prisma.shipment.count(),
      prisma.walletTransaction.findMany({
        where: { status: "completed" },
        select: { amount: true },
      }),
      prisma.dispute.count(),
    ])

    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0)

    // Count by role
    const usersByRole = await prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    })

    // Count by shipment status
    const shipmentsByStatus = await prisma.shipment.groupBy({
      by: ["status"],
      _count: { id: true },
    })

    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: { gte: thirtyDaysAgo },
      },
    })

    return NextResponse.json({
      analytics: {
        totalUsers: users,
        activeUsers,
        totalShipments: shipments,
        totalRevenue,
        totalDisputes: disputes,
        usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count.id])),
        shipmentsByStatus: Object.fromEntries(
          shipmentsByStatus.map((s) => [s.status, s._count.id])
        ),
        timestamp: new Date(),
      },
    })
  } catch (error) {
    logger.error("Analytics error", { error })
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
