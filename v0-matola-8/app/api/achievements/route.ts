/**
 * Achievements API
 * GET /api/achievements - List achievements
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { getAchievementsSchema } from "@/lib/validators/api-schemas"
import { logger } from "@/lib/monitoring/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const searchParams = request.nextUrl.searchParams
    const params = getAchievementsSchema.parse({
      userId: searchParams.get("userId") || auth.userId,
      category: searchParams.get("category"),
      unlocked: searchParams.get("unlocked"),
    })

    const where: any = {}

    if (params.category) {
      where.category = params.category
    }

    const achievements = await prisma.achievement.findMany({
      where,
      include: {
        userAchievements: {
          where: {
            userId: params.userId,
          },
        },
      },
    })

    // Filter by unlocked if requested
    let filtered = achievements
    if (params.unlocked !== undefined) {
      filtered = achievements.filter((a) =>
        params.unlocked ? a.userAchievements.length > 0 : a.userAchievements.length === 0,
      )
    }

    // Format response
    const formatted = filtered.map((achievement) => ({
      id: achievement.id,
      code: achievement.code,
      name: achievement.name,
      nameNy: achievement.nameNy,
      description: achievement.description,
      descriptionNy: achievement.descriptionNy,
      category: achievement.category,
      icon: achievement.icon,
      points: achievement.points,
      unlocked: achievement.userAchievements.length > 0,
      unlockedAt: achievement.userAchievements[0]?.unlockedAt || null,
      progress: achievement.userAchievements[0]?.progress || 0,
    }))

    return NextResponse.json({ achievements: formatted })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request parameters", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error fetching achievements", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

