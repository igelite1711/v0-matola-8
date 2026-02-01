/**
 * Leaderboard API
 * GET /api/leaderboard - Get leaderboard rankings
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { getLeaderboardSchema } from "@/lib/validators/api-schemas"
import { logger } from "@/lib/monitoring/logger"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = getLeaderboardSchema.parse({
      period: searchParams.get("period"),
      region: searchParams.get("region"),
      limit: searchParams.get("limit"),
    })

    const now = new Date()
    const year = now.getFullYear()
    let week: number | undefined
    let month: number | undefined

    if (params.period === "weekly") {
      week = Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
    } else if (params.period === "monthly") {
      month = now.getMonth() + 1
    }

    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        period: params.period,
        year,
        week: week || undefined,
        month: month || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            rating: true,
            totalRatings: true,
          },
        },
      },
      orderBy: { rank: "asc" },
      take: params.limit,
    })

    return NextResponse.json({
      period: params.period,
      region: params.region,
      entries: entries.map((entry) => ({
        rank: entry.rank,
        user: entry.user,
        score: entry.score,
        trips: entry.trips,
        earnings: entry.earnings,
        distance: entry.distance,
      })),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request parameters", details: error.errors }, { status: 400 })
    }
    logger.error("Error fetching leaderboard", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
