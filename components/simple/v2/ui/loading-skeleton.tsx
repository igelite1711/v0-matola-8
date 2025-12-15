"use client"

import { cn } from "@/lib/utils"

// Base skeleton shimmer component
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

// Card skeleton for shipments/loads
export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      {/* Header badges */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-20" />
        <div className="flex-1 border-t-2 border-dashed border-border mx-2" />
        <Skeleton className="h-5 w-20" />
      </div>

      {/* Details */}
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-14" />
      </div>

      {/* Shipper info */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Skeleton className="flex-1 h-12 rounded-xl" />
        <Skeleton className="flex-1 h-12 rounded-xl" />
      </div>
    </div>
  )
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 text-center">
      <Skeleton className="h-5 w-5 mx-auto mb-2 rounded" />
      <Skeleton className="h-6 w-12 mx-auto mb-1" />
      <Skeleton className="h-3 w-10 mx-auto" />
    </div>
  )
}

// Dashboard header skeleton
export function DashboardHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-10 w-20 rounded-full" />
        </div>
      </div>
    </header>
  )
}

// Leaderboard entry skeleton
export function LeaderboardSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          {/* Period tabs */}
          <div className="flex gap-2 mb-3">
            <Skeleton className="flex-1 h-10 rounded-xl" />
            <Skeleton className="flex-1 h-10 rounded-xl" />
            <Skeleton className="flex-1 h-10 rounded-xl" />
          </div>
          {/* Region tabs */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Your rank card */}
        <div className="mb-6 rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        {/* Podium skeleton */}
        <div className="mb-6 flex items-end justify-center gap-3">
          <div className="flex flex-col items-center">
            <Skeleton className="h-16 w-16 rounded-full mb-2" />
            <Skeleton className="h-20 w-20 rounded-t-xl" />
          </div>
          <div className="flex flex-col items-center">
            <Skeleton className="h-20 w-20 rounded-full mb-2" />
            <Skeleton className="h-28 w-24 rounded-t-xl" />
          </div>
          <div className="flex flex-col items-center">
            <Skeleton className="h-16 w-16 rounded-full mb-2" />
            <Skeleton className="h-16 w-20 rounded-t-xl" />
          </div>
        </div>

        {/* List entries */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AchievementsSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-14 w-14 rounded-2xl" />
          </div>

          {/* Level card */}
          <div className="rounded-2xl bg-card border border-border p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-40 mx-auto mt-2" />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Filter toggle */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="flex-1 h-10 rounded-xl" />
          <Skeleton className="flex-1 h-10 rounded-xl" />
          <Skeleton className="flex-1 h-10 rounded-xl" />
        </div>

        {/* Achievements grid */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-card border border-border p-4">
              <Skeleton className="h-14 w-14 rounded-xl mx-auto mb-3" />
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-20 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-b from-primary/20 to-background pb-20 pt-8">
        <div className="mx-auto max-w-2xl px-4">
          {/* Nav buttons */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>

          {/* Avatar */}
          <div className="flex justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>

          {/* Name */}
          <div className="mt-4 text-center space-y-2">
            <Skeleton className="h-6 w-36 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-3 text-center">
                <Skeleton className="h-5 w-10 mx-auto mb-2" />
                <Skeleton className="h-3 w-14 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 -mt-10">
        {/* Level card */}
        <div className="rounded-2xl bg-card border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-12 rounded-lg" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-3 w-48 mt-2" />
        </div>

        {/* Badges */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Contact info */}
        <div className="rounded-2xl bg-card border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-6 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-36" />
              </div>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="rounded-2xl bg-card border border-border overflow-hidden mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="flex-1 h-4 w-28" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
          ))}
        </div>

        {/* Logout */}
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </div>
  )
}

// Full page loading skeleton
export function FullPageSkeleton({ type = "default" }: { type?: "shipper" | "transporter" | "default" }) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardHeaderSkeleton />
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>

        {/* Cards */}
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  )
}
