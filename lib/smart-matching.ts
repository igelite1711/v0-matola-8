// Smart Matching Engine with Push Notifications
import type { Shipment, Transporter, LoadOffer, DriverAvailability, VehicleType, CargoType } from "./types"
import { calculateMatchScore } from "./matching-engine"
import { calculateDynamicPrice } from "./pricing-engine"

// Store for driver availability
const driverAvailability: Map<string, DriverAvailability> = new Map()
const loadOffers: LoadOffer[] = []

// Vehicle type hierarchy for capacity checking
const VEHICLE_CAPACITY_ORDER: VehicleType[] = [
  "pickup",
  "canter",
  "small_truck",
  "medium_truck",
  "large_truck",
  "flatbed",
  "refrigerated",
  "tanker",
]

const VEHICLE_MIN_CAPACITY: Record<VehicleType, number> = {
  pickup: 0,
  canter: 1000,
  small_truck: 3000,
  medium_truck: 5000,
  large_truck: 10000,
  flatbed: 10000,
  refrigerated: 5000,
  tanker: 15000,
}

// Cargo type requirements
const CARGO_REQUIREMENTS: Record<CargoType, { requiresRefrigeration?: boolean; minVehicleType?: VehicleType }> = {
  general: {},
  agricultural: { minVehicleType: "canter" },
  maize: { minVehicleType: "canter" },
  tobacco: { minVehicleType: "medium_truck" },
  tea: { minVehicleType: "medium_truck" },
  sugar: { minVehicleType: "medium_truck" },
  fertilizer: { minVehicleType: "medium_truck" },
  construction: { minVehicleType: "medium_truck" },
  cement: { minVehicleType: "medium_truck" },
  fuel: { minVehicleType: "tanker" },
  fragile: {},
  perishable: { requiresRefrigeration: true },
  hazardous: { minVehicleType: "large_truck" },
  livestock: { minVehicleType: "large_truck" },
}

// Update driver availability
export function updateDriverAvailability(
  transporterId: string,
  availability: Partial<DriverAvailability>,
): DriverAvailability {
  const current = driverAvailability.get(transporterId) || {
    isOnline: false,
    capacityPercentage: 100,
    preferredRouteRadius: 50,
    acceptingBackhaul: true,
    acceptingSharedLoads: false,
  }

  const updated = { ...current, ...availability, lastLocationUpdate: new Date() }
  driverAvailability.set(transporterId, updated)
  return updated
}

// Get driver availability
export function getDriverAvailability(transporterId: string): DriverAvailability | undefined {
  return driverAvailability.get(transporterId)
}

// Check if transporter can handle shipment (strict vehicle filtering)
export function canTransporterHandle(
  transporter: Transporter,
  shipment: Shipment,
): {
  canHandle: boolean
  reasons: string[]
} {
  const reasons: string[] = []

  // Check if online
  const availability = getDriverAvailability(transporter.id)
  if (!availability?.isOnline) {
    reasons.push("Driver is offline")
  }

  // Check capacity percentage
  if (availability && availability.capacityPercentage === 0) {
    reasons.push("Driver's truck is full")
  }

  // Check weight capacity
  if (transporter.vehicleCapacity < shipment.weight) {
    reasons.push(`Load (${shipment.weight}kg) exceeds vehicle capacity (${transporter.vehicleCapacity}kg)`)
  }

  // Check cargo requirements
  const cargoReq = CARGO_REQUIREMENTS[shipment.cargoType]

  // Refrigeration check
  if (cargoReq.requiresRefrigeration && !transporter.hasRefrigeration) {
    reasons.push(`${shipment.cargoType} cargo requires refrigerated transport`)
  }

  // Minimum vehicle type check
  if (cargoReq.minVehicleType) {
    const requiredIndex = VEHICLE_CAPACITY_ORDER.indexOf(cargoReq.minVehicleType)
    const transporterIndex = VEHICLE_CAPACITY_ORDER.indexOf(transporter.vehicleType)

    if (transporterIndex < requiredIndex && transporter.vehicleType !== cargoReq.minVehicleType) {
      reasons.push(`${shipment.cargoType} requires at least ${cargoReq.minVehicleType} vehicle`)
    }
  }

  // Vehicle type specific restrictions
  if (shipment.cargoType === "fuel" && transporter.vehicleType !== "tanker") {
    reasons.push("Fuel transport requires a tanker")
  }

  // Weight-based restrictions (hide 30-ton loads from 3-ton Canter)
  if (shipment.weight > 15000 && VEHICLE_MIN_CAPACITY[transporter.vehicleType] < 10000) {
    reasons.push("Load too heavy for this vehicle class")
  }

  return {
    canHandle: reasons.length === 0,
    reasons,
  }
}

// Find eligible transporters for a shipment
export function findEligibleTransporters(
  shipment: Shipment,
  allTransporters: Transporter[],
): Array<{ transporter: Transporter; matchScore: number; isBackhaul: boolean; reasons?: string[] }> {
  const results: Array<{ transporter: Transporter; matchScore: number; isBackhaul: boolean; reasons?: string[] }> = []

  for (const transporter of allTransporters) {
    const eligibility = canTransporterHandle(transporter, shipment)
    const isBackhaul = transporter.currentLocation?.city === shipment.destination.city

    if (eligibility.canHandle) {
      const matchResult = calculateMatchScore(shipment, transporter, isBackhaul)
      if (matchResult.eligible) {
        results.push({
          transporter,
          matchScore: matchResult.score,
          isBackhaul,
        })
      }
    } else {
      // Track rejected transporters for debugging
      results.push({
        transporter,
        matchScore: 0,
        isBackhaul,
        reasons: eligibility.reasons,
      })
    }
  }

  // Sort by match score descending, filter out ineligible
  return results.filter((r) => r.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore)
}

// Generate load offer for transporter
export function generateLoadOffer(
  shipment: Shipment,
  transporter: Transporter,
  matchScore: number,
  isBackhaul: boolean,
): LoadOffer {
  // Calculate dynamic pricing
  const pricing = calculateDynamicPrice(
    shipment.origin,
    shipment.destination,
    shipment.weight,
    transporter.vehicleType,
    shipment.cargoType,
    isBackhaul,
  )

  const offer: LoadOffer = {
    id: `offer-${Date.now()}-${transporter.id}`,
    shipmentId: shipment.id,
    transporterId: transporter.id,
    matchScore,
    isBackhaul,
    pricing: {
      grossPrice: pricing.grossPrice,
      platformFee: pricing.platformFee,
      netEarnings: pricing.netEarnings,
      surgeMultiplier: pricing.factors.seasonal?.multiplier,
    },
    status: "pending",
    expiresAt: new Date(Date.now() + 60000), // 60 seconds
    createdAt: new Date(),
  }

  loadOffers.push(offer)
  return offer
}

// Respond to load offer
export function respondToLoadOffer(offerId: string, response: "accepted" | "declined"): LoadOffer | null {
  const offer = loadOffers.find((o) => o.id === offerId)
  if (!offer || offer.status !== "pending") return null

  offer.status = response
  offer.respondedAt = new Date()

  return offer
}

// Get pending offers for transporter
export function getPendingOffers(transporterId: string): LoadOffer[] {
  const now = new Date()
  return loadOffers.filter((o) => o.transporterId === transporterId && o.status === "pending" && o.expiresAt > now)
}

// Auto-dispatch to best matching transporters
export function autoDispatchShipment(shipment: Shipment, transporters: Transporter[], maxOffers = 5): LoadOffer[] {
  const eligible = findEligibleTransporters(shipment, transporters)
  const topMatches = eligible.slice(0, maxOffers)

  const offers: LoadOffer[] = []
  for (const match of topMatches) {
    const offer = generateLoadOffer(shipment, match.transporter, match.matchScore, match.isBackhaul)
    offers.push(offer)
  }

  return offers
}

// Get recommended loads for a driver (filtered by their vehicle)
export function getSmartRecommendations(
  transporter: Transporter,
  shipments: Shipment[],
  limit = 10,
): Array<{ shipment: Shipment; matchScore: number; isBackhaul: boolean; pricing: LoadOffer["pricing"] }> {
  const recommendations: Array<{
    shipment: Shipment
    matchScore: number
    isBackhaul: boolean
    pricing: LoadOffer["pricing"]
  }> = []

  for (const shipment of shipments) {
    if (shipment.status !== "posted") continue

    const eligibility = canTransporterHandle(transporter, shipment)
    if (!eligibility.canHandle) continue

    const isBackhaul = transporter.currentLocation?.city === shipment.destination.city
    const matchResult = calculateMatchScore(shipment, transporter, isBackhaul)

    if (matchResult.eligible && matchResult.score > 50) {
      const pricing = calculateDynamicPrice(
        shipment.origin,
        shipment.destination,
        shipment.weight,
        transporter.vehicleType,
        shipment.cargoType,
        isBackhaul,
      )

      recommendations.push({
        shipment,
        matchScore: matchResult.score,
        isBackhaul,
        pricing: {
          grossPrice: pricing.grossPrice,
          platformFee: pricing.platformFee,
          netEarnings: pricing.netEarnings,
          surgeMultiplier: pricing.factors.seasonal?.multiplier,
        },
      })
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
}
