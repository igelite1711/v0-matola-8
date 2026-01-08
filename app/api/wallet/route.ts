/**
 * GET /api/wallet - Get wallet balance and info
 * POST /api/wallet/transactions - Get transaction history
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)

    // Get balance from transactions
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
      },
    })

    // Calculate balance
    let balance = 0
    let held = 0

    transactions.forEach((tx) => {
      if (tx.status === "completed") {
        if (["payment", "payout"].includes(tx.type)) {
          balance += tx.amount
        } else if (tx.type === "refund") {
          balance += tx.amount
        }
      } else if (tx.status === "held") {
        held += tx.amount
      }
    })

    return NextResponse.json({
      wallet: {
        userId: auth.userId,
        balance: Math.max(0, balance),
        held,
        available: Math.max(0, balance - held),
        totalTransactions: transactions.length,
        lastTransaction: transactions[0]?.createdAt || null,
      },
    })
  } catch (error: any) {
    logger.error("Error fetching wallet", { error })
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 })
  }
}
