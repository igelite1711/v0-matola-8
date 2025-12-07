import type { Location, VehicleType, CargoType } from "./types"
import { calculateDistance } from "./matching-engine"

// Platform commission rate
export const PLATFORM_COMMISSION_RATE = 0.05 // 5%

// Seasonal multipliers for Malawi's agricultural calendar
interface SeasonalFactor {
  name: string
  nameNy: string
  months: number[]
  multiplier: number
  cargoTypes: CargoType[]
}

const SEASONAL_FACTORS: SeasonalFactor[] = [
  {
    name: "Maize Harvest Season",
    nameNy: "Nyengo ya Kukolola Chimanga",
    months: [4, 5, 6], // April-June
    multiplier: 1.25,
    cargoTypes: ["maize", "agricultural"],
  },
  {
    name: "Tobacco Auction Season",
    nameNy: "Nyengo ya Msika wa Fodya",
    months: [3, 4, 5, 6, 7], // March-July
    multiplier: 1.35,
    cargoTypes: ["tobacco"],
  },
  {
    name: "Tea Plucking Season",
    nameNy: "Nyengo ya Tiyi",
    months: [10, 11, 12, 1, 2, 3], // Oct-March
    multiplier: 1.15,
    cargoTypes: ["tea"],
  },
  {
    name: "Fertilizer Import Season",
    nameNy: "Nyengo ya Feteleza",
    months: [9, 10, 11], // Sept-Nov (before planting)
    multiplier: 1.3,
    cargoTypes: ["fertilizer"],
  },
  {
    name: "Rainy Season",
    nameNy: "Nyengo ya Mvula",
    months: [12, 1, 2, 3], // Dec-March
    multiplier: 1.2, // Roads are harder, slower travel
    cargoTypes: ["general", "construction", "cement", "agricultural", "maize", "fertilizer"],
  },
]

// Demand-based surge pricing by route
interface RouteDemand {
  origin: string
  destination: string
  demandLevel: "low" | "normal" | "high" | "surge"
  multiplier: number
}

const ROUTE_DEMAND: RouteDemand[] = [
  { origin: "Lilongwe", destination: "Blantyre", demandLevel: "high", multiplier: 1.1 },
  { origin: "Blantyre", destination: "Lilongwe", demandLevel: "normal", multiplier: 1.0 },
  { origin: "Lilongwe", destination: "Mzuzu", demandLevel: "normal", multiplier: 1.0 },
  { origin: "Mzuzu", destination: "Lilongwe", demandLevel: "low", multiplier: 0.9 },
  { origin: "Blantyre", destination: "Zomba", demandLevel: "high", multiplier: 1.15 },
]

// Base rates per km (MWK) by vehicle type
const BASE_RATES: Record<VehicleType, number> = {
  pickup: 150,
  canter: 180,
  small_truck: 200,
  medium_truck: 300,
  large_truck: 450,
  flatbed: 400,
  refrigerated: 550,
  tanker: 600,
}

// Cargo type surcharges
const CARGO_SURCHARGES: Partial<Record<CargoType, number>> = {
  hazardous: 0.25, // +25%
  perishable: 0.2, // +20%
  fragile: 0.15, // +15%
  livestock: 0.2, // +20%
  fuel: 0.3, // +30%
}

export interface PriceBreakdown {
  basePrice: number
  distanceCharge: number
  weightSurcharge: number
  seasonalAdjustment: number
  demandAdjustment: number
  cargoSurcharge: number
  backhaulDiscount: number
  grossPrice: number
  platformFee: number
  netEarnings: number // What the driver actually receives
  factors: {
    distance: number
    seasonal?: { name: string; multiplier: number }
    demand?: { level: string; multiplier: number }
    cargo?: { surcharge: number }
    backhaul: boolean
  }
}

// Get current seasonal factor
export function getSeasonalFactor(cargoType: CargoType): SeasonalFactor | null {
  const currentMonth = new Date().getMonth() + 1 // 1-12

  for (const factor of SEASONAL_FACTORS) {
    if (factor.months.includes(currentMonth) && factor.cargoTypes.includes(cargoType)) {
      return factor
    }
  }

  return null
}

// Get route demand
export function getRouteDemand(origin: string, destination: string): RouteDemand | null {
  return ROUTE_DEMAND.find((r) => r.origin === origin && r.destination === destination) || null
}

// Calculate dynamic price with full breakdown
export function calculateDynamicPrice(
  origin: Location,
  destination: Location,
  weight: number,
  vehicleType: VehicleType,
  cargoType: CargoType,
  isBackhaul = false,
): PriceBreakdown {
  const distance = calculateDistance(origin, destination)
  const baseRate = BASE_RATES[vehicleType]

  // Base distance charge
  const distanceCharge = distance * baseRate

  // Weight surcharge (over 1000kg)
  const weightSurcharge = weight > 1000 ? (weight - 1000) * 10 : 0

  // Seasonal adjustment
  const seasonalFactor = getSeasonalFactor(cargoType)
  const seasonalMultiplier = seasonalFactor?.multiplier || 1.0
  const seasonalAdjustment = (distanceCharge + weightSurcharge) * (seasonalMultiplier - 1)

  // Demand adjustment
  const routeDemand = getRouteDemand(origin.city, destination.city)
  const demandMultiplier = routeDemand?.multiplier || 1.0
  const demandAdjustment = (distanceCharge + weightSurcharge) * (demandMultiplier - 1)

  // Cargo type surcharge
  const cargoSurchargeRate = CARGO_SURCHARGES[cargoType] || 0
  const cargoSurcharge = (distanceCharge + weightSurcharge) * cargoSurchargeRate

  // Calculate subtotal before backhaul
  const subtotal = distanceCharge + weightSurcharge + seasonalAdjustment + demandAdjustment + cargoSurcharge

  // Backhaul discount (40%)
  const backhaulDiscount = isBackhaul ? subtotal * 0.4 : 0

  // Gross price (what shipper pays)
  const grossPrice = Math.max(25000, Math.round(subtotal - backhaulDiscount))

  // Platform fee (5%)
  const platformFee = Math.round(grossPrice * PLATFORM_COMMISSION_RATE)

  // Net earnings (what driver receives)
  const netEarnings = grossPrice - platformFee

  return {
    basePrice: Math.round(distanceCharge),
    distanceCharge: Math.round(distanceCharge),
    weightSurcharge: Math.round(weightSurcharge),
    seasonalAdjustment: Math.round(seasonalAdjustment),
    demandAdjustment: Math.round(demandAdjustment),
    cargoSurcharge: Math.round(cargoSurcharge),
    backhaulDiscount: Math.round(backhaulDiscount),
    grossPrice,
    platformFee,
    netEarnings,
    factors: {
      distance,
      seasonal: seasonalFactor ? { name: seasonalFactor.name, multiplier: seasonalFactor.multiplier } : undefined,
      demand: routeDemand ? { level: routeDemand.demandLevel, multiplier: routeDemand.multiplier } : undefined,
      cargo: cargoSurchargeRate > 0 ? { surcharge: cargoSurchargeRate } : undefined,
      backhaul: isBackhaul,
    },
  }
}

// Quick price estimate (simplified)
export function getQuickEstimate(
  origin: Location,
  destination: Location,
  vehicleType: VehicleType,
): { min: number; max: number } {
  const distance = calculateDistance(origin, destination)
  const baseRate = BASE_RATES[vehicleType]
  const basePrice = distance * baseRate

  return {
    min: Math.round(basePrice * 0.6), // Backhaul minimum
    max: Math.round(basePrice * 1.35), // Peak season maximum
  }
}

// Format price breakdown for display
export function formatPriceBreakdown(breakdown: PriceBreakdown): string[] {
  const lines: string[] = []

  lines.push(`Distance (${Math.round(breakdown.factors.distance)} km): MK ${breakdown.distanceCharge.toLocaleString()}`)

  if (breakdown.weightSurcharge > 0) {
    lines.push(`Weight surcharge: MK ${breakdown.weightSurcharge.toLocaleString()}`)
  }

  if (breakdown.seasonalAdjustment > 0) {
    lines.push(`${breakdown.factors.seasonal?.name}: +MK ${breakdown.seasonalAdjustment.toLocaleString()}`)
  }

  if (breakdown.demandAdjustment !== 0) {
    const sign = breakdown.demandAdjustment > 0 ? "+" : ""
    lines.push(`Demand (${breakdown.factors.demand?.level}): ${sign}MK ${breakdown.demandAdjustment.toLocaleString()}`)
  }

  if (breakdown.cargoSurcharge > 0) {
    lines.push(`Cargo surcharge: +MK ${breakdown.cargoSurcharge.toLocaleString()}`)
  }

  if (breakdown.backhaulDiscount > 0) {
    lines.push(`Backhaul discount: -MK ${breakdown.backhaulDiscount.toLocaleString()}`)
  }

  return lines
}
