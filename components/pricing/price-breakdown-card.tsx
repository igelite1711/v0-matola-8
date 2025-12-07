"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, TrendingDown, Leaf, Truck, Package, MapPin, Info, ArrowRight } from "lucide-react"
import { formatPrice } from "@/lib/matching-engine"
import type { PriceBreakdown } from "@/lib/pricing-engine"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceBreakdownCardProps {
  breakdown: PriceBreakdown
  showNetEarnings?: boolean // For transporters
  originCity?: string
  destinationCity?: string
}

export function PriceBreakdownCard({
  breakdown,
  showNetEarnings = false,
  originCity,
  destinationCity,
}: PriceBreakdownCardProps) {
  const demandColors = {
    low: "text-green-400",
    normal: "text-muted-foreground",
    high: "text-amber-400",
    surge: "text-red-400",
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Price Breakdown</CardTitle>
          {breakdown.factors.backhaul && <Badge className="bg-green-500/20 text-green-400">Backhaul -40%</Badge>}
        </div>
        {originCity && destinationCity && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{originCity}</span>
            <ArrowRight className="h-3 w-3" />
            <span>{destinationCity}</span>
            <span className="text-xs">({Math.round(breakdown.factors.distance)} km)</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Base Price */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span>Distance charge</span>
          </div>
          <span>{formatPrice(breakdown.distanceCharge)}</span>
        </div>

        {/* Weight Surcharge */}
        {breakdown.weightSurcharge > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span>Weight surcharge</span>
            </div>
            <span>+{formatPrice(breakdown.weightSurcharge)}</span>
          </div>
        )}

        {/* Seasonal Adjustment */}
        {breakdown.factors.seasonal && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-amber-500" />
              <span className="text-amber-400">{breakdown.factors.seasonal.name}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Seasonal demand increases prices by{" "}
                      {Math.round((breakdown.factors.seasonal.multiplier - 1) * 100)}%
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-amber-400">+{formatPrice(breakdown.seasonalAdjustment)}</span>
          </div>
        )}

        {/* Demand Adjustment */}
        {breakdown.factors.demand && breakdown.demandAdjustment !== 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {breakdown.demandAdjustment > 0 ? (
                <TrendingUp className="h-4 w-4 text-amber-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
              <span className={demandColors[breakdown.factors.demand.level as keyof typeof demandColors]}>
                {breakdown.factors.demand.level.charAt(0).toUpperCase() + breakdown.factors.demand.level.slice(1)}{" "}
                demand
              </span>
            </div>
            <span className={breakdown.demandAdjustment > 0 ? "text-amber-400" : "text-green-400"}>
              {breakdown.demandAdjustment > 0 ? "+" : ""}
              {formatPrice(breakdown.demandAdjustment)}
            </span>
          </div>
        )}

        {/* Cargo Surcharge */}
        {breakdown.cargoSurcharge > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cargo type surcharge</span>
            <span>+{formatPrice(breakdown.cargoSurcharge)}</span>
          </div>
        )}

        {/* Backhaul Discount */}
        {breakdown.backhaulDiscount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-400">Backhaul discount</span>
            <span className="text-green-400">-{formatPrice(breakdown.backhaulDiscount)}</span>
          </div>
        )}

        <Separator className="my-2" />

        {/* Total / Gross Price */}
        <div className="flex items-center justify-between font-medium">
          <span>{showNetEarnings ? "Total Price" : "Estimated Price"}</span>
          <span className="text-lg text-primary">{formatPrice(breakdown.grossPrice)}</span>
        </div>

        {/* Net Earnings (for transporters) */}
        {showNetEarnings && (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Platform fee (5%)</span>
              <span>-{formatPrice(breakdown.platformFee)}</span>
            </div>
            <div className="flex items-center justify-between font-bold">
              <span className="text-green-400">Your Earnings</span>
              <span className="text-lg text-green-400">{formatPrice(breakdown.netEarnings)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
