/**
 * GET /api/wallet/transactions - Get transaction history
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
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const where: any = { userId: auth.userId }

    if (type) {
      where.type = type
    }
    if (status) {
      where.status = status
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          description: true,
          shipmentId: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.walletTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error: any) {
    logger.error("Error fetching transactions", { error })
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
