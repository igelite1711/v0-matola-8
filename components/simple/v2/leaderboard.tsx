"use client"

import { useState } from "react"
import { Trophy, Medal, Crown, TrendingUp, Shield, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"
import { formatMWK } from "@/lib/payments/mobile-money"
import { getTrustLevel } from "@/lib/trust/trust-system"

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  avatar?: string
  trustScore: number
  weeklyTrips: number
  weeklyEarnings: number
  badges: string[]
  isYou?: boolean
  trend?: "up" | "down" | "same"
  rankChange?: number
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "1",
    name: "Chisomo Banda",
    trustScore: 95,
    weeklyTrips: 28,
    weeklyEarnings: 485000,
    badges: ["👑", "⚡", "🔥"],
    trend: "same",
  },
  {
    rank: 2,
    userId: "2",
    name: "Kondwani Phiri",
    trustScore: 92,
    weeklyTrips: 25,
    weeklyEarnings: 420000,
    badges: ["⭐", "🚛"],
    trend: "up",
    rankChange: 2,
  },
  {
    rank: 3,
    userId: "3",
    name: "Yamikani Mwale",
    trustScore: 88,
    weeklyTrips: 22,
    weeklyEarnings: 380000,
    badges: ["🌾", "🤝"],
    trend: "down",
    rankChange: 1,
  },
  {
    rank: 4,
    userId: "4",
    name: "Blessings Kamanga",
    trustScore: 85,
    weeklyTrips: 20,
    weeklyEarnings: 345000,
    badges: ["⏰"],
    trend: "up",
    rankChange: 3,
  },
  {
    rank: 5,
    userId: "current",
    name: "You",
    trustScore: 78,
    weeklyTrips: 18,
    weeklyEarnings: 310000,
    badges: ["🔄", "⭐"],
    isYou: true,
    trend: "up",
    rankChange: 2,
  },
  {
    rank: 6,
    userId: "6",
    name: "Tawonga Chirwa",
    trustScore: 75,
    weeklyTrips: 16,
    weeklyEarnings: 275000,
    badges: ["🛤️"],
    trend: "down",
    rankChange: 2,
  },
  {
    rank: 7,
    userId: "7",
    name: "Limbani Mkandawire",
    trustScore: 72,
    weeklyTrips: 15,
    weeklyEarnings: 258000,
    badges: [],
    trend: "same",
  },
]

export function Leaderboard() {
  const { language } = useTranslation()
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly")
  const [region, setRegion] = useState<"all" | "central" | "southern" | "northern">("all")

  const periodOptions = [
    { id: "weekly", label: language === "ny" ? "Sabata" : "Week" },
    { id: "monthly", label: language === "ny" ? "Mwezi" : "Month" },
    { id: "allTime", label: language === "ny" ? "Nthawi Yonse" : "All Time" },
  ]

  const regionOptions = [
    { id: "all", label: language === "ny" ? "Malawi Onse" : "All Malawi" },
    { id: "central", label: language === "ny" ? "Chapakati" : "Central" },
    { id: "southern", label: language === "ny" ? "Chakumwera" : "Southern" },
    { id: "northern", label: language === "ny" ? "Chakumpoto" : "Northern" },
  ]

  // Find current user's rank
  const currentUser = MOCK_LEADERBOARD.find((e) => e.isYou)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">{language === "ny" ? "Oyamba" : "Leaderboard"}</h1>
              <p className="text-sm text-muted-foreground">
                {language === "ny" ? "Oyendetsa abwino kwambiri" : "Top performing transporters"}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
              <Trophy className="h-6 w-6 text-warning" />
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mb-3">
            {periodOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPeriod(opt.id as typeof period)}
                className={cn(
                  "flex-1 rounded-xl py-2.5 text-sm font-medium transition-all",
                  period === opt.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Region Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {regionOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRegion(opt.id as typeof region)}
                className={cn(
                  "flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all border",
                  region === opt.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Your Rank Summary */}
        {currentUser && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 border-2 border-primary">
                  <span className="text-xl font-bold text-primary">#{currentUser.rank}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{language === "ny" ? "Malo Anu" : "Your Rank"}</p>
                  <div className="flex items-center gap-2">
                    {currentUser.trend === "up" && (
                      <span className="flex items-center gap-0.5 text-success text-sm">
                        <TrendingUp className="h-3 w-3" />+{currentUser.rankChange}
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {currentUser.weeklyTrips} {language === "ny" ? "maulendo" : "trips"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{formatMWK(currentUser.weeklyEarnings)}</p>
                <p className="text-xs text-muted-foreground">{language === "ny" ? "sabata ino" : "this week"}</p>
              </div>
            </div>

            {/* Progress to next rank */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>#{currentUser.rank}</span>
                <span>#{currentUser.rank - 1}</span>
              </div>
              <div className="h-2 rounded-full bg-background overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-success rounded-full w-3/4" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {language === "ny" ? "Maulendo 2 kuti mukwere" : "2 more trips to rank up"}
              </p>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        <div className="mb-6 flex items-end justify-center gap-3">
          {/* 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary border-2 border-muted">
                <span className="text-xl font-bold text-muted-foreground">
                  {MOCK_LEADERBOARD[1].name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-secondary border-2 border-background">
                <Medal className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <div className="h-20 w-20 rounded-t-xl bg-secondary/50 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">2</span>
              <span className="text-xs text-muted-foreground">{MOCK_LEADERBOARD[1].weeklyTrips}</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 border-2 border-warning">
                <span className="text-2xl font-bold text-warning">
                  {MOCK_LEADERBOARD[0].name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-warning border-2 border-background">
                <Crown className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="h-28 w-24 rounded-t-xl bg-warning/10 flex flex-col items-center justify-center border-2 border-warning/30">
              <span className="text-3xl font-bold text-warning">1</span>
              <span className="text-xs text-warning">{MOCK_LEADERBOARD[0].weeklyTrips}</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 border-2 border-orange-500/50">
                <span className="text-xl font-bold text-orange-500">
                  {MOCK_LEADERBOARD[2].name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 border-2 border-background">
                <Medal className="h-3.5 w-3.5 text-orange-500" />
              </div>
            </div>
            <div className="h-16 w-20 rounded-t-xl bg-orange-500/10 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-orange-500">3</span>
              <span className="text-xs text-orange-500">{MOCK_LEADERBOARD[2].weeklyTrips}</span>
            </div>
          </div>
        </div>

        {/* Full Leaderboard List */}
        <div className="space-y-3">
          {MOCK_LEADERBOARD.slice(3).map((entry) => (
            <LeaderboardCard key={entry.userId} entry={entry} language={language} />
          ))}
        </div>

        {/* Community Stats */}
        <div className="mt-8 rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              {language === "ny" ? "Umuzi wa Sabata Ino" : "Community This Week"}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">847</p>
              <p className="text-xs text-muted-foreground">{language === "ny" ? "Maulendo" : "Total Trips"}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{formatMWK(12500000)}</p>
              <p className="text-xs text-muted-foreground">{language === "ny" ? "Ndalama" : "Total Earnings"}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-xs text-muted-foreground">{language === "ny" ? "Oyendetsa" : "Active Drivers"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LeaderboardCard({ entry, language }: { entry: LeaderboardEntry; language: "en" | "ny" }) {
  const trustLevel = getTrustLevel(entry.trustScore)

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all",
        entry.isYou ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:border-primary/30",
      )}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full font-bold",
            entry.isYou ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
          )}
        >
          {entry.rank}
        </div>

        {/* Avatar & Name */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={cn("font-semibold", entry.isYou ? "text-primary" : "text-foreground")}>
              {entry.isYou ? (language === "ny" ? "Inu" : "You") : entry.name}
            </p>
            {entry.badges.slice(0, 3).map((badge, i) => (
              <span key={i}>{badge}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Shield
                className={cn("h-3 w-3", trustLevel.level === "highly_trusted" ? "text-success" : "text-primary")}
              />
              <span className="text-xs text-muted-foreground">{entry.trustScore}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              • {entry.weeklyTrips} {language === "ny" ? "maulendo" : "trips"}
            </span>
          </div>
        </div>

        {/* Earnings & Trend */}
        <div className="text-right">
          <p className="font-semibold text-foreground">{formatMWK(entry.weeklyEarnings)}</p>
          {entry.trend && entry.rankChange && (
            <span
              className={cn(
                "text-xs flex items-center justify-end gap-0.5",
                entry.trend === "up"
                  ? "text-success"
                  : entry.trend === "down"
                    ? "text-destructive"
                    : "text-muted-foreground",
              )}
            >
              {entry.trend === "up" && <TrendingUp className="h-3 w-3" />}
              {entry.trend === "up" ? "+" : entry.trend === "down" ? "-" : ""}
              {entry.rankChange}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
