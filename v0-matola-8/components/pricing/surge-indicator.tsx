"use client"

import { Badge } from "@/components/ui/badge"
import { TrendingUp, Leaf, CloudRain, Zap } from "lucide-react"

interface SurgeIndicatorProps {
  demandLevel?: "low" | "normal" | "high" | "surge"
  seasonalFactor?: { name: string; multiplier: number }
  isRainySeason?: boolean
  compact?: boolean
}

export function SurgeIndicator({ demandLevel, seasonalFactor, isRainySeason, compact = false }: SurgeIndicatorProps) {
  const showSurge = demandLevel === "high" || demandLevel === "surge" || seasonalFactor || isRainySeason

  if (!showSurge) return null

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {demandLevel === "surge" && (
          <Badge className="bg-red-500/20 text-red-400 text-xs px-1.5">
            <Zap className="h-3 w-3 mr-0.5" />
            Surge
          </Badge>
        )}
        {demandLevel === "high" && !seasonalFactor && (
          <Badge className="bg-amber-500/20 text-amber-400 text-xs px-1.5">
            <TrendingUp className="h-3 w-3 mr-0.5" />
            High
          </Badge>
        )}
        {seasonalFactor && (
          <Badge className="bg-green-500/20 text-green-400 text-xs px-1.5">
            <Leaf className="h-3 w-3 mr-0.5" />+{Math.round((seasonalFactor.multiplier - 1) * 100)}%
          </Badge>
        )}
        {isRainySeason && !seasonalFactor && (
          <Badge className="bg-blue-500/20 text-blue-400 text-xs px-1.5">
            <CloudRain className="h-3 w-3 mr-0.5" />
            Rainy
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {demandLevel === "surge" && (
        <Badge className="bg-red-500/20 text-red-400 gap-1">
          <Zap className="h-3 w-3" />
          Surge Pricing Active
        </Badge>
      )}
      {demandLevel === "high" && (
        <Badge className="bg-amber-500/20 text-amber-400 gap-1">
          <TrendingUp className="h-3 w-3" />
          High Demand Route
        </Badge>
      )}
      {seasonalFactor && (
        <Badge className="bg-green-500/20 text-green-400 gap-1">
          <Leaf className="h-3 w-3" />
          {seasonalFactor.name} (+{Math.round((seasonalFactor.multiplier - 1) * 100)}%)
        </Badge>
      )}
      {isRainySeason && !seasonalFactor && (
        <Badge className="bg-blue-500/20 text-blue-400 gap-1">
          <CloudRain className="h-3 w-3" />
          Rainy Season Rates
        </Badge>
      )}
    </div>
  )
}
