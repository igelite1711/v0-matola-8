import type { Shipment, Transporter, Match, Location, VehicleType, CargoType } from "./types"
import { invariantEngine } from "./safety/invariant-engine"

// Matching algorithm weights
const WEIGHTS = {
  distance: 0.2,
  rating: 0.15,
  vehicleMatch: 0.25, // Increased - critical for safety/efficiency
  availability: 0.1,
  backhaul: 0.1,
  onTimeRate: 0.1,
  routePreference: 0.05,
  cargoExperience: 0.05,
}

const VEHICLE_CAPACITIES: Record<VehicleType, number> = {
  pickup: 1000,
  canter: 3500,
  small_truck: 5000,
  medium_truck: 10000,
  large_truck: 20000,
  flatbed: 25000,
  refrigerated: 15000,
  tanker: 30000,
}

const CARGO_VEHICLE_COMPATIBILITY: Record<CargoType, VehicleType[]> = {
  general: ["pickup", "canter", "small_truck", "medium_truck", "large_truck", "flatbed"],
  agricultural: ["canter", "small_truck", "medium_truck", "large_truck", "flatbed"],
  maize: ["canter", "small_truck", "medium_truck", "large_truck", "flatbed"],
  tobacco: ["medium_truck", "large_truck", "flatbed"],
  tea: ["medium_truck", "large_truck", "refrigerated"],
  sugar: ["medium_truck", "large_truck", "flatbed"],
  fertilizer: ["medium_truck", "large_truck", "flatbed"],
  construction: ["medium_truck", "large_truck", "flatbed"],
  cement: ["medium_truck", "large_truck", "flatbed"],
  fuel: ["tanker"],
  fragile: ["small_truck", "medium_truck", "refrigerated"],
  perishable: ["refrigerated"],
  hazardous: ["large_truck", "tanker"],
  livestock: ["large_truck", "flatbed"],
}

// Calculate distance between two locations (simplified Haversine)
function calculateDistance(origin: Location, destination: Location): number {
  if (!origin.coordinates || !destination.coordinates) {
    // Fallback to city-based estimates (km)
    const cityDistances: Record<string, Record<string, number>> = {
      Lilongwe: { Blantyre: 310, Mzuzu: 360, Zomba: 280, Kasungu: 130, Mangochi: 200, Karonga: 480 },
      Blantyre: { Lilongwe: 310, Mzuzu: 670, Zomba: 65, Kasungu: 440, Mangochi: 180, Karonga: 790 },
      Mzuzu: { Lilongwe: 360, Blantyre: 670, Zomba: 620, Kasungu: 230, Mangochi: 520, Karonga: 120 },
      Zomba: { Lilongwe: 280, Blantyre: 65, Mzuzu: 620, Kasungu: 410, Mangochi: 130, Karonga: 740 },
      Kasungu: { Lilongwe: 130, Blantyre: 440, Mzuzu: 230, Zomba: 410, Mangochi: 330, Karonga: 350 },
      Mangochi: { Lilongwe: 200, Blantyre: 180, Mzuzu: 520, Zomba: 130, Kasungu: 330, Karonga: 640 },
      Karonga: { Lilongwe: 480, Blantyre: 790, Mzuzu: 120, Zomba: 740, Kasungu: 350, Mangochi: 640 },
    }
    return cityDistances[origin.city]?.[destination.city] ?? 200
  }

  const R = 6371 // Earth's radius in km
  const dLat = toRad(destination.coordinates.lat - origin.coordinates.lat)
  const dLng = toRad(destination.coordinates.lng - origin.coordinates.lng)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.coordinates.lat)) *
    Math.cos(toRad(destination.coordinates.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

async function vehicleCapacityMatch(
  vehicleType: VehicleType,
  requiredType: VehicleType,
  vehicleCapacity: number,
  shipmentWeight: number,
  cargoType: CargoType,
): Promise<{ score: number; eligible: boolean; reason?: string }> {
  try {
    return await invariantEngine.execute(
      ["INV-SHIP-WEIGHT", "INV-SHIP-CARGO"],
      {
        weightKg: shipmentWeight,
        vehicleMaxCapacityKg: VEHICLE_CAPACITIES[vehicleType],
        cargoType,
        vehicleType
      },
      async () => {
        // Calculate efficiency score (prefer right-sized vehicles)
        const utilizationRatio = shipmentWeight / VEHICLE_CAPACITIES[vehicleType]
        let score = 0

        if (vehicleType === requiredType) {
          score = 1.0
        } else if (utilizationRatio >= 0.7) {
          score = 0.95 // Great fit
        } else if (utilizationRatio >= 0.5) {
          score = 0.8 // Good fit
        } else if (utilizationRatio >= 0.3) {
          score = 0.6 // Acceptable but wasteful
        } else {
          score = 0.4 // Very oversized
        }

        return { score, eligible: true }
      },
      { silent: true } // Performance optimization for matching loops
    )
  } catch (error) {
    return {
      score: 0,
      eligible: false,
      reason: error instanceof Error ? error.message : "Constraint violation"
    }
  }
}

function routePreferenceMatch(transporter: Transporter, shipment: Shipment): number {
  if (!transporter.preferredRoutes || transporter.preferredRoutes.length === 0) {
    return 0.5 // Neutral if no preferences set
  }

  const routeKey1 = `${shipment.origin.city}-${shipment.destination.city}`
  const routeKey2 = `${shipment.destination.city}-${shipment.origin.city}`

  for (const route of transporter.preferredRoutes) {
    if (route.includes(shipment.origin.city) && route.includes(shipment.destination.city)) {
      return 1.0
    }
    if (route === routeKey1 || route === routeKey2) {
      return 1.0
    }
  }

  return 0.3 // Route not in preferences
}

// Calculate match score for a transporter
export async function calculateMatchScore(
  shipment: Shipment,
  transporter: Transporter,
  isBackhaulOpportunity = false,
): Promise<{ score: number; eligible: boolean; reason?: string }> {
  const vehicleMatch = await vehicleCapacityMatch(
    transporter.vehicleType,
    shipment.requiredVehicleType,
    transporter.vehicleCapacity,
    shipment.weight,
    shipment.cargoType,
  )

  if (!vehicleMatch.eligible) {
    return { score: 0, eligible: false, reason: vehicleMatch.reason }
  }

  let score = 0

  // Distance score (closer is better)
  if (transporter.currentLocation) {
    const distanceToPickup = calculateDistance(transporter.currentLocation, shipment.origin)
    const distanceScore = Math.max(0, 1 - distanceToPickup / 500) // Normalize to 500km max
    score += distanceScore * WEIGHTS.distance
  } else {
    score += 0.5 * WEIGHTS.distance // Default middle score
  }

  // Rating score
  const ratingScore = transporter.rating / 5
  score += ratingScore * WEIGHTS.rating

  // Vehicle match score
  score += vehicleMatch.score * WEIGHTS.vehicleMatch

  // Availability score
  score += (transporter.isAvailable ? 1 : 0) * WEIGHTS.availability

  // Backhaul bonus
  if (isBackhaulOpportunity) {
    score += 1.0 * WEIGHTS.backhaul
  }

  // On-time rate score
  score += transporter.onTimeRate * WEIGHTS.onTimeRate

  // Route preference score
  score += routePreferenceMatch(transporter, shipment) * WEIGHTS.routePreference

  // Cargo experience (bonus for specialized cargo)
  if (shipment.cargoType === "perishable" && transporter.hasRefrigeration) {
    score += 1.0 * WEIGHTS.cargoExperience
  } else {
    score += 0.5 * WEIGHTS.cargoExperience
  }

  // Enforce Match Score Threshold Invariant
  await invariantEngine.execute(
    ["INV-MATCH-SCORE"],
    { score: Math.round(score * 100) },
    async () => { }
  ).catch(error => {
    // If score is too low, mark as ineligible rather than crashing the loop
    eligible = false
    reason = error.message
  })

  return { score: Math.round(score * 100), eligible }
}

export async function findMatches(shipment: Shipment, transporters: Transporter[], limit = 10): Promise<Match[]> {
  const matches: Match[] = []
  const rejections: { transporterId: string; reason: string }[] = []

  for (const transporter of transporters) {
    // Check if this is a backhaul opportunity
    const isBackhaul = transporter.currentLocation?.city === shipment.destination.city

    const matchResult = await calculateMatchScore(shipment, transporter, isBackhaul)

    if (!matchResult.eligible) {
      rejections.push({ transporterId: transporter.id, reason: matchResult.reason || "Not eligible" })
      continue
    }

    if (!transporter.isAvailable) {
      rejections.push({ transporterId: transporter.id, reason: "Transporter not available" })
      continue
    }

    matches.push({
      id: `match-${shipment.id}-${transporter.id}`,
      shipmentId: shipment.id,
      transporterId: transporter.id,
      transporterName: transporter.name,
      transporterRating: transporter.rating,
      transporterPhone: transporter.phone,
      vehicleType: transporter.vehicleType,
      vehiclePlate: transporter.vehiclePlate,
      matchScore: matchResult.score,
      isBackhaul,
      estimatedPickup: new Date(shipment.pickupDate),
      status: "pending" as const,
      createdAt: new Date(),
    })
  }

  // Sort by match score and return top matches
  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
}

export async function canTransporterHandleShipment(
  transporter: Transporter,
  shipment: Shipment,
): Promise<{ canHandle: boolean; reason?: string }> {
  const vehicleMatch = await vehicleCapacityMatch(
    transporter.vehicleType,
    shipment.requiredVehicleType,
    transporter.vehicleCapacity,
    shipment.weight,
    shipment.cargoType,
  )

  if (!vehicleMatch.eligible) {
    return { canHandle: false, reason: vehicleMatch.reason }
  }

  if (!transporter.isAvailable) {
    return { canHandle: false, reason: "You are currently offline or unavailable" }
  }

  // Check for refrigeration requirement
  if (shipment.cargoType === "perishable" && !transporter.hasRefrigeration) {
    return { canHandle: false, reason: "This load requires refrigerated transport" }
  }

  return { canHandle: true }
}

export async function getRecommendedLoads(
  transporter: Transporter,
  shipments: Shipment[],
  limit = 5,
): Promise<Array<{ shipment: Shipment; matchScore: number; isBackhaul: boolean }>> {
  const recommendations: Array<{ shipment: Shipment; matchScore: number; isBackhaul: boolean }> = []

  for (const shipment of shipments) {
    if (shipment.status !== "posted") continue

    const isBackhaul = transporter.currentLocation?.city === shipment.destination.city
    const matchResult = await calculateMatchScore(shipment, transporter, isBackhaul)

    if (matchResult.eligible && matchResult.score > 50) {
      recommendations.push({
        shipment,
        matchScore: matchResult.score,
        isBackhaul,
      })
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
}

// Calculate dynamic pricing
export function calculatePrice(
  origin: Location,
  destination: Location,
  weight: number,
  vehicleType: VehicleType,
  isBackhaul = false,
): number {
  const distance = calculateDistance(origin, destination)

  // Base rates per km (MWK)
  const baseRates: Record<VehicleType, number> = {
    pickup: 150,
    canter: 180,
    small_truck: 200,
    medium_truck: 300,
    large_truck: 450,
    flatbed: 400,
    refrigerated: 550,
    tanker: 600,
  }

  const baseRate = baseRates[vehicleType]
  let price = distance * baseRate

  // Weight surcharge (over 1000kg)
  if (weight > 1000) {
    price += (weight - 1000) * 10
  }

  // Backhaul discount (30-50%)
  if (isBackhaul) {
    price *= 0.6 // 40% discount for backhaul
  }

  // Minimum price
  const minimumPrice = 25000 // 25,000 MWK minimum
  return Math.max(minimumPrice, Math.round(price))
}

// Format price for display
export function formatPrice(amount: number, currency = "MWK"): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export { calculateDistance }
