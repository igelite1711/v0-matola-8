"use client"

import { useState } from "react"
import { Trophy, Lock, Sparkles, Star, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"
import {
  ACHIEVEMENTS,
  type Achievement,
  getUserLevel,
  getRarityColor,
  getRarityBgColor,
} from "@/lib/gamification/celebration-system"

// Mock user data
const MOCK_USER_ACHIEVEMENTS = [
  "first_delivery",
  "first_payment",
  "trips_5",
  "streak_7",
  "backhaul_5",
  "community_vouched",
]
const MOCK_TOTAL_POINTS = 1150

export function AchievementsPage() {
  const { language } = useTranslation()
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all")
  const [category, setCategory] = useState<"all" | "milestone" | "streak" | "community" | "seasonal">("all")

  const level = getUserLevel(MOCK_TOTAL_POINTS)
  const allAchievements = Object.values(ACHIEVEMENTS)

  const filteredAchievements = allAchievements.filter((a) => {
    const isEarned = MOCK_USER_ACHIEVEMENTS.includes(a.id)
    if (filter === "earned" && !isEarned) return false
    if (filter === "locked" && isEarned) return false
    if (category !== "all" && a.type !== category) return false
    return true
  })

  const earnedCount = MOCK_USER_ACHIEVEMENTS.length
  const totalCount = allAchievements.length

  const categories = [
    { id: "all", label: language === "ny" ? "Zonse" : "All", icon: Trophy },
    { id: "milestone", label: language === "ny" ? "Zolinga" : "Milestones", icon: Star },
    { id: "streak", label: language === "ny" ? "Streak" : "Streaks", icon: Zap },
    { id: "community", label: language === "ny" ? "Gulu" : "Community", icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Level Progress */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{language === "ny" ? "Zopezedwa" : "Achievements"}</h1>
              <p className="text-sm text-muted-foreground">
                {earnedCount} / {totalCount} {language === "ny" ? "zopezedwa" : "unlocked"}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10">
              <Trophy className="h-7 w-7 text-warning" />
            </div>
          </div>

          {/* Level Card */}
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  {level.level}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{language === "ny" ? level.titleNy : level.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {MOCK_TOTAL_POINTS.toLocaleString()} {language === "ny" ? "mfundo" : "points"}
                  </p>
                </div>
              </div>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>

            <div className="h-3 rounded-full bg-background overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all"
                style={{ width: `${level.progress}%` }}
              />
            </div>
            {level.pointsToNext > 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {level.pointsToNext} {language === "ny" ? "mfundo kuti mulingo wotsatira" : "points to next level"}
              </p>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id as typeof category)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  category === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Filter Toggle */}
        <div className="flex gap-2 mb-6">
          {(["all", "earned", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
                filter === f ? "bg-card border border-border text-foreground" : "text-muted-foreground",
              )}
            >
              {f === "all"
                ? language === "ny"
                  ? "Zonse"
                  : "All"
                : f === "earned"
                  ? language === "ny"
                    ? "Zopezedwa"
                    : "Earned"
                  : language === "ny"
                    ? "Zotsekera"
                    : "Locked"}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => {
            const isEarned = MOCK_USER_ACHIEVEMENTS.includes(achievement.id)
            return (
              <AchievementCard key={achievement.id} achievement={achievement} isEarned={isEarned} language={language} />
            )
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{language === "ny" ? "Palibe zopezedwa" : "No achievements found"}</p>
          </div>
        )}

        {/* Next Achievement Hint */}
        <div className="mt-8 rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">{language === "ny" ? "Chotsatira" : "Next Up"}</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <span className="text-2xl">{ACHIEVEMENTS.trips_25.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {language === "ny" ? ACHIEVEMENTS.trips_25.nameNy : ACHIEVEMENTS.trips_25.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "ny" ? ACHIEVEMENTS.trips_25.descriptionNy : ACHIEVEMENTS.trips_25.description}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary rounded-full w-1/2" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">12 / 25 {language === "ny" ? "maulendo" : "trips"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AchievementCard({
  achievement,
  isEarned,
  language,
}: {
  achievement: Achievement
  isEarned: boolean
  language: "en" | "ny"
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all",
        isEarned
          ? cn("bg-card border-border", getRarityBgColor(achievement.rarity))
          : "bg-secondary/30 border-border/50 opacity-60",
      )}
    >
      <div className="relative mb-3">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-xl mx-auto",
            isEarned ? getRarityBgColor(achievement.rarity) : "bg-muted",
          )}
        >
          {isEarned ? (
            <span className="text-3xl">{achievement.icon}</span>
          ) : (
            <Lock className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        {isEarned && (
          <div
            className={cn(
              "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full",
              achievement.rarity === "legendary"
                ? "bg-warning"
                : achievement.rarity === "epic"
                  ? "bg-purple-500"
                  : achievement.rarity === "rare"
                    ? "bg-primary"
                    : "bg-success",
            )}
          >
            <Star className="h-3 w-3 text-white fill-white" />
          </div>
        )}
      </div>

      <div className="text-center">
        <p className={cn("font-semibold text-sm mb-1", isEarned ? "text-foreground" : "text-muted-foreground")}>
          {language === "ny" ? achievement.nameNy : achievement.name}
        </p>
        <p
          className={cn("text-xs capitalize", isEarned ? getRarityColor(achievement.rarity) : "text-muted-foreground")}
        >
          {achievement.rarity}
        </p>
        {isEarned && (
          <p className="text-xs text-muted-foreground mt-1">
            +{achievement.points} {language === "ny" ? "mfundo" : "pts"}
          </p>
        )}
      </div>
    </div>
  )
}
