/**
 * Achievement Engine
 * Calculates and unlocks achievements for users
 */

import { prisma } from "@/lib/db/prisma"
import { notificationQueue } from "@/lib/queue/queue"

interface AchievementCheck {
  userId: string
  type: "trip_completed" | "earnings_milestone" | "streak" | "route_expert" | "rating_received"
  data?: any
}

/**
 * Check and unlock achievements for a user
 */
export async function checkAchievements(check: AchievementCheck): Promise<string[]> {
  const { userId, type, data } = check
  const unlocked: string[] = []

  try {
    switch (type) {
      case "trip_completed": {
        // Get user's completed trips
        const completedTrips = await prisma.shipment.count({
          where: {
            OR: [
              { shipperId: userId, status: "completed" },
              {
                matches: {
                  some: {
                    transporterId: userId,
                    status: "accepted",
                  },
                },
                status: "completed",
              },
            ],
          },
        })

        // Check milestone achievements
        const milestones = [1, 5, 10, 25, 50, 100, 250, 500]
        for (const milestone of milestones) {
          if (completedTrips === milestone) {
            const achievementCode = `trips_${milestone}`
            const unlockedId = await unlockAchievement(userId, achievementCode)
            if (unlockedId) unlocked.push(unlockedId)
          }
        }

        break
      }

      case "earnings_milestone": {
        // Get user's total earnings
        const earnings = await prisma.walletTransaction.aggregate({
          where: {
            userId,
            type: "payout",
            status: "completed",
          },
          _sum: {
            amount: true,
          },
        })

        const totalEarnings = earnings._sum.amount || 0

        // Check earnings milestones (in MWK)
        const milestones = [
          { amount: 10000, code: "earnings_10k" },
          { amount: 50000, code: "earnings_50k" },
          { amount: 100000, code: "earnings_100k" },
          { amount: 500000, code: "earnings_500k" },
          { amount: 1000000, code: "earnings_1m" },
        ]

        for (const milestone of milestones) {
          if (totalEarnings >= milestone.amount) {
            const unlockedId = await unlockAchievement(userId, milestone.code)
            if (unlockedId) unlocked.push(unlockedId)
          }
        }

        break
      }

      case "streak": {
        // Check daily login streak
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { createdAt: true },
        })

        if (!user) break

        // Calculate streak (simplified - in production, track daily logins)
        const daysSinceJoined = Math.floor(
          (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        )

        if (daysSinceJoined >= 7) {
          const unlockedId = await unlockAchievement(userId, "streak_7")
          if (unlockedId) unlocked.push(unlockedId)
        }
        if (daysSinceJoined >= 30) {
          const unlockedId = await unlockAchievement(userId, "streak_30")
          if (unlockedId) unlocked.push(unlockedId)
        }

        break
      }

      case "route_expert": {
        // Check if user has completed 10+ trips on a specific route
        if (!data?.route) break

        const routeTrips = await prisma.shipment.count({
          where: {
            OR: [
              {
                shipperId: userId,
                originCity: data.route.origin,
                destinationCity: data.route.destination,
                status: "completed",
              },
              {
                matches: {
                  some: {
                    transporterId: userId,
                    status: "accepted",
                  },
                },
                originCity: data.route.origin,
                destinationCity: data.route.destination,
                status: "completed",
              },
            ],
          },
        })

        if (routeTrips >= 10) {
          const routeCode = `${data.route.origin}_${data.route.destination}`.toLowerCase().replace(/\s+/g, "_")
          const unlockedId = await unlockAchievement(userId, `route_expert_${routeCode}`)
          if (unlockedId) unlocked.push(unlockedId)
        }

        break
      }

      case "rating_received": {
        // Check if user received their first 5-star rating
        if (data?.rating === 5) {
          const ratingCount = await prisma.rating.count({
            where: {
              toUserId: userId,
              overallRating: 5,
            },
          })

          if (ratingCount === 1) {
            const unlockedId = await unlockAchievement(userId, "first_5star")
            if (unlockedId) unlocked.push(unlockedId)
          }
        }

        break
      }
    }

    // Notify user of unlocked achievements
    for (const achievementId of unlocked) {
      await notificationQueue.add("achievement-unlocked", {
        userId,
        achievementId,
      })
    }

    return unlocked
  } catch (error) {
    console.error("Error checking achievements:", error)
    return []
  }
}

/**
 * Unlock an achievement for a user
 */
async function unlockAchievement(userId: string, achievementCode: string): Promise<string | null> {
  try {
    // Get achievement
    const achievement = await prisma.achievement.findUnique({
      where: { code: achievementCode },
    })

    if (!achievement) {
      console.warn(`Achievement not found: ${achievementCode}`)
      return null
    }

    // Check if already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    })

    if (existing) {
      return null // Already unlocked
    }

    // Unlock achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        progress: 100,
      },
    })

    return userAchievement.id
  } catch (error) {
    console.error(`Error unlocking achievement ${achievementCode}:`, error)
    return null
  }
}

/**
 * Calculate leaderboard scores
 */
export async function calculateLeaderboard(
  period: "weekly" | "monthly" | "all_time",
  region?: "Northern" | "Central" | "Southern",
): Promise<void> {
  const now = new Date()
  let startDate: Date
  let week: number | undefined
  let month: number | undefined
  const year = now.getFullYear()

  if (period === "weekly") {
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    startDate = weekStart
    week = Math.ceil((now.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
  } else if (period === "monthly") {
    startDate = new Date(year, now.getMonth(), 1)
    month = now.getMonth() + 1
  } else {
    startDate = new Date(0) // All time
  }

  // Get all users with their stats
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["transporter", "shipper"] },
      ...(region && {
        OR: [
          { transporterProfile: { currentRegion: region } },
          { shipments: { some: { originRegion: region } } },
        ],
      }),
    },
    include: {
      shipments: {
        where: {
          status: "completed",
          updatedAt: { gte: startDate },
        },
      },
      matches: {
        where: {
          status: "accepted",
          shipment: {
            status: "completed",
            updatedAt: { gte: startDate },
          },
        },
      },
      transactions: {
        where: {
          type: "payout",
          status: "completed",
          completedAt: { gte: startDate },
        },
      },
    },
  })

  // Calculate scores
  const entries = users.map((user) => {
    const trips = user.shipments.length + user.matches.length
    const earnings = user.transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
    const distance = 0 // Would calculate from shipments

    // Score formula: (trips * 10) + (earnings / 1000) + (distance * 0.1)
    const score = trips * 10 + earnings / 1000 + distance * 0.1

    return {
      userId: user.id,
      trips,
      earnings,
      distance,
      score,
    }
  })

  // Sort by score
  entries.sort((a, b) => b.score - a.score)

  // Create/update leaderboard entries
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]

    await prisma.leaderboardEntry.upsert({
      where: {
        userId_period_week_month_year: {
          userId: entry.userId,
          period,
          week: week || 0,
          month: month || 0,
          year,
        },
      },
      create: {
        userId: entry.userId,
        period,
        rank: i + 1,
        score: entry.score,
        trips: entry.trips,
        earnings: entry.earnings,
        distance: entry.distance,
        week,
        month,
        year,
      },
      update: {
        rank: i + 1,
        score: entry.score,
        trips: entry.trips,
        earnings: entry.earnings,
        distance: entry.distance,
      },
    })
  }
}
