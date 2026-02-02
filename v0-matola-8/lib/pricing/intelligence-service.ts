/**
 * Pricing Intelligence Service
 * Provides historical price analysis and recommendations
 */

import { prisma } from "@/lib/db/prisma"

interface PriceSuggestion {
  recommended: number
  min: number
  max: number
  marketData: {
    avgPrice: number | null
    sampleSize: number
    confidence: "high" | "medium" | "low"
  }
  message: string
}

/**
 * Suggest price based on historical data
 */
export async function suggestPrice(
  origin: string,
  destination: string,
  weight: number,
  cargoType: string,
): Promise<PriceSuggestion> {
  // Get historical prices for this route
  const historical = await prisma.shipment.findMany({
    where: {
      originCity: origin,
      destinationCity: destination,
      cargoType: cargoType as any,
      status: { in: ["completed", "delivered"] },
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      },
    },
    select: {
      price: true,
      weight: true,
    },
    take: 100,
  })

  if (historical.length < 3) {
    // Not enough data - use baseline calculation
    return calculateBaselinePrice(origin, destination, weight, cargoType)
  }

  // Calculate average price per kg
  const pricePerKg = historical.reduce((sum, s) => sum + s.price / s.weight, 0) / historical.length
  const avgPrice = historical.reduce((sum, s) => sum + s.price, 0) / historical.length

  // Apply seasonal adjustments
  const seasonalMultiplier = getSeasonalMultiplier()
  const estimatedPrice = pricePerKg * weight * seasonalMultiplier

  // Calculate confidence
  const confidence = historical.length >= 10 ? "high" : historical.length >= 5 ? "medium" : "low"

  return {
    recommended: Math.round(estimatedPrice),
    min: Math.round(estimatedPrice * 0.85),
    max: Math.round(estimatedPrice * 1.15),
    marketData: {
      avgPrice,
      sampleSize: historical.length,
      confidence,
    },
    message: `Based on ${historical.length} similar shipments in the last 90 days`,
  }
}

/**
 * Baseline price calculation when no historical data
 */
function calculateBaselinePrice(
  origin: string,
  destination: string,
  weight: number,
  cargoType: string,
): PriceSuggestion {
  // Distance matrix (simplified)
  const distances: Record<string, number> = {
    "Lilongwe-Blantyre": 320,
    "Blantyre-Lilongwe": 320,
    "Lilongwe-Mzuzu": 350,
    "Mzuzu-Lilongwe": 350,
  }

  const routeKey = `${origin}-${destination}`
  const distance = distances[routeKey] || 500 // Default if unknown

  // Base rates (MWK)
  const baseRate = 5000
  const ratePerKm = 80
  const ratePerKg = 15

  // Cargo type multipliers
  const cargoMultipliers: Record<string, number> = {
    food: 1.0,
    building_materials: 1.1,
    furniture: 1.15,
    livestock: 1.2,
    electronics: 1.3,
    general: 1.0,
  }

  const multiplier = cargoMultipliers[cargoType] || 1.0
  const basePrice = (baseRate + distance * ratePerKm + weight * ratePerKg) * multiplier

  return {
    recommended: Math.round(basePrice),
    min: Math.round(basePrice * 0.8),
    max: Math.round(basePrice * 1.2),
    marketData: {
      avgPrice: null,
      sampleSize: 0,
      confidence: "low",
    },
    message: "Estimated price (no historical data available)",
  }
}

/**
 * Seasonal price adjustments
 */
function getSeasonalMultiplier(): number {
  const month = new Date().getMonth() + 1 // 1-12

  // Harvest season (April-June): Lower prices
  if (month >= 4 && month <= 6) {
    return 0.9
  }

  // Planting season (November-December): Higher prices
  if (month === 11 || month === 12) {
    return 1.1
  }

  // Rainy season (December-March): Higher prices
  if (month === 12 || month <= 3) {
    return 1.15
  }

  return 1.0 // Normal season
}

/**
 * Get price trends for a route
 */
export async function getPriceTrends(
  origin: string,
  destination: string,
  cargoType: string,
  days: number = 90,
): Promise<Array<{ date: string; avgPrice: number; count: number }>> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const shipments = await prisma.shipment.findMany({
    where: {
      originCity: origin,
      destinationCity: destination,
      cargoType: cargoType as any,
      status: { in: ["completed", "delivered"] },
      createdAt: { gte: startDate },
    },
    select: {
      price: true,
      createdAt: true,
    },
  })

  // Group by week
  const weeklyData: Record<string, { prices: number[]; count: number }> = {}

  for (const shipment of shipments) {
    const week = getWeekKey(shipment.createdAt)
    if (!weeklyData[week]) {
      weeklyData[week] = { prices: [], count: 0 }
    }
    weeklyData[week].prices.push(shipment.price)
    weeklyData[week].count++
  }

  return Object.entries(weeklyData)
    .map(([date, data]) => ({
      date,
      avgPrice: data.prices.reduce((a, b) => a + b, 0) / data.prices.length,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const week = Math.ceil((d.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
  return `${year}-W${week.toString().padStart(2, "0")}`
}

