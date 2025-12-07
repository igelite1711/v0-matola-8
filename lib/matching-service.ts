/**
 * Matola Matching Service
 *
 * The heart of Matola - an intelligent system that connects cargo with transport efficiently.
 * Designed for African transport realities: trust, relationships, and practical logistics.
 *
 * Matching Philosophy:
 * 1. Proximity over perfection - Match 80% fit today beats 100% fit next week
 * 2. Return trips first - Prioritize filling empty return journeys
 * 3. Reputation matters - Verified, highly-rated users get priority
 * 4. Flexibility wins - Allow manual browsing alongside automatic matching
 * 5. Local knowledge - Optimize for well-known routes like Lilongwe-Blantyre
 */

import type { Shipment, Transporter, VehicleType, CargoType } from "./types"
import { calculateDynamicPrice } from "./pricing-engine"

// ============================================
// MATCHING ALGORITHM WEIGHTS (Per Specification)
// ============================================

/**
 * Scoring Breakdown:
 * - Route Match: 40 points (most critical - African reality)
 * - Capacity Match: 20 points
 * - Timing Match: 15 points
 * - Reputation: 15 points
 * - Experience: 10 points
 */
const MATCHING_WEIGHTS = {
  route: 0.4, // 40% - Route is king in African logistics
  capacity: 0.2, // 20% - Can the vehicle handle the load
  timing: 0.15, // 15% - Can pickup happen when needed
  reputation: 0.15, // 15% - Can we trust this transporter
  experience: 0.1, // 10% - Has the transporter proven themselves
}

// Minimum match score threshold (0-100 scale)
const MIN_MATCH_SCORE = 30
const MAX_MATCHES_PER_SHIPMENT = 10
const MATCH_EXPIRY_HOURS = 24

// ============================================
// MALAWI CITY-TO-CITY DISTANCE MATRIX
// More reliable than GPS in areas with poor connectivity
// ============================================

const CITY_DISTANCES: Record<string, number> = {
  // Lilongwe routes
  "Lilongwe-Blantyre": 320,
  "Lilongwe-Mzuzu": 350,
  "Lilongwe-Zomba": 280,
  "Lilongwe-Salima": 100,
  "Lilongwe-Kasungu": 130,
  "Lilongwe-Mangochi": 200,
  "Lilongwe-Karonga": 480,
  "Lilongwe-Dedza": 85,
  "Lilongwe-Mchinji": 110,
  "Lilongwe-Nkhotakota": 150,

  // Blantyre routes
  "Blantyre-Lilongwe": 320,
  "Blantyre-Zomba": 65,
  "Blantyre-Mangochi": 160,
  "Blantyre-Mulanje": 70,
  "Blantyre-Thyolo": 30,
  "Blantyre-Mzuzu": 670,
  "Blantyre-Mwanza": 80,
  "Blantyre-Chiradzulu": 25,

  // Mzuzu routes
  "Mzuzu-Lilongwe": 350,
  "Mzuzu-Blantyre": 670,
  "Mzuzu-Karonga": 120,
  "Mzuzu-Nkhata Bay": 50,
  "Mzuzu-Rumphi": 60,
  "Mzuzu-Chitipa": 200,

  // Zomba routes
  "Zomba-Blantyre": 65,
  "Zomba-Lilongwe": 280,
  "Zomba-Mangochi": 130,
  "Zomba-Machinga": 40,

  // Other major routes
  "Mangochi-Blantyre": 160,
  "Mangochi-Lilongwe": 200,
  "Karonga-Mzuzu": 120,
  "Salima-Lilongwe": 100,
  "Kasungu-Lilongwe": 130,
  "Nkhata Bay-Mzuzu": 50,
}

// ============================================
// VEHICLE CAPACITY LIMITS
// ============================================

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

// ============================================
// CARGO-VEHICLE COMPATIBILITY MATRIX
// ============================================

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

// ============================================
// TYPES
// ============================================

export interface MatchScoreBreakdown {
  routeScore: number
  capacityScore: number
  timingScore: number
  reputationScore: number
  experienceScore: number
  totalScore: number
  eligible: boolean
  reason?: string
}

export interface TransporterCandidate extends Transporter {
  routeExperience: number
  completedTrips: number
  lastActiveAt: Date
  vehicleId?: string
}

export interface MatchResult {
  id: string
  shipmentId: string
  transporterId: string
  transporterName: string
  transporterPhone: string
  transporterRating: number
  vehicleType: VehicleType
  vehiclePlate: string
  vehicleId?: string
  matchScore: number
  scoreBreakdown: MatchScoreBreakdown
  isBackhaul: boolean
  isKnownReturnRoute: boolean
  pricing: {
    grossPrice: number
    platformFee: number
    netEarnings: number
  }
  needsReview: boolean
  reviewReasons: string[]
  status: "pending" | "accepted" | "rejected" | "expired"
  notifiedAt?: Date
  matchedAt: Date
  expiresAt: Date
}

export interface MatchingOptions {
  maxMatches?: number
  excludeTransporters?: string[]
  requireVerified?: boolean
  minScore?: number
}

export interface TransporterHistory {
  transporterId: string
  origin: string
  destination: string
  completedTrips: number
  lastTripDate: Date
}

// ============================================
// MATCHING SERVICE CLASS
// ============================================

class MatchingService {
  // Simulated database for transporter history (in production, use real DB)
  private transporterHistory: TransporterHistory[] = []
  private scheduleConflicts: Map<string, Date[]> = new Map()

  /**
   * Main matching function - called when:
   * 1. New shipment is posted (find transporters)
   * 2. Background job runs every 15 minutes (batch matching)
   */
  async findMatches(
    shipment: Shipment,
    transporters: TransporterCandidate[],
    options: MatchingOptions = {},
  ): Promise<MatchResult[]> {
    const {
      maxMatches = MAX_MATCHES_PER_SHIPMENT,
      excludeTransporters = [],
      requireVerified = false,
      minScore = MIN_MATCH_SCORE,
    } = options

    // Filter out excluded transporters
    let candidates = transporters.filter((t) => !excludeTransporters.includes(t.id))

    // Filter by verification if required
    if (requireVerified) {
      candidates = candidates.filter((t) => t.verified)
    }

    // Score each candidate
    const scoredMatches: Array<{
      transporter: TransporterCandidate
      scoreBreakdown: MatchScoreBreakdown
      isBackhaul: boolean
      isKnownReturnRoute: boolean
    }> = []

    for (const transporter of candidates) {
      // Check if this is a backhaul opportunity
      const isBackhaul = this.isBackhaulOpportunity(transporter, shipment)

      // Check if this is a known return route for the transporter
      const isKnownReturnRoute = await this.isKnownReturnRoute(
        transporter.id,
        shipment.origin.city,
        shipment.destination.city,
      )

      const scoreBreakdown = await this.calculateMatchScore(shipment, transporter, isBackhaul, isKnownReturnRoute)

      if (scoreBreakdown.eligible && scoreBreakdown.totalScore >= minScore) {
        scoredMatches.push({
          transporter,
          scoreBreakdown,
          isBackhaul,
          isKnownReturnRoute,
        })
      }
    }

    // Sort by score (descending)
    scoredMatches.sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore)

    // Take top N matches
    const topMatches = scoredMatches.slice(0, maxMatches)

    // Create match results
    const results: MatchResult[] = topMatches.map(({ transporter, scoreBreakdown, isBackhaul, isKnownReturnRoute }) => {
      // Calculate pricing
      const pricing = calculateDynamicPrice(
        shipment.origin,
        shipment.destination,
        shipment.weight,
        transporter.vehicleType,
        shipment.cargoType,
        isBackhaul,
      )

      // Determine if manual review is needed
      const { needsReview, reviewReasons } = this.checkNeedsReview(shipment, transporter, scoreBreakdown)

      const now = new Date()
      const expiresAt = new Date(now.getTime() + MATCH_EXPIRY_HOURS * 60 * 60 * 1000)

      return {
        id: `match-${shipment.id}-${transporter.id}-${Date.now()}`,
        shipmentId: shipment.id,
        transporterId: transporter.id,
        transporterName: transporter.name,
        transporterPhone: transporter.phone,
        transporterRating: transporter.rating,
        vehicleType: transporter.vehicleType,
        vehiclePlate: transporter.vehiclePlate,
        vehicleId: transporter.vehicleId,
        matchScore: scoreBreakdown.totalScore,
        scoreBreakdown,
        isBackhaul,
        isKnownReturnRoute,
        pricing: {
          grossPrice: pricing.grossPrice,
          platformFee: pricing.platformFee,
          netEarnings: pricing.netEarnings,
        },
        needsReview,
        reviewReasons,
        status: "pending" as const,
        matchedAt: now,
        expiresAt,
      }
    })

    return results
  }

  /**
   * Calculate comprehensive match score (0-100)
   *
   * Scoring Breakdown:
   * - Route Match: 40 points
   * - Capacity Match: 20 points
   * - Timing Match: 15 points
   * - Reputation: 15 points
   * - Experience: 10 points
   */
  async calculateMatchScore(
    shipment: Shipment,
    transporter: TransporterCandidate,
    isBackhaul: boolean,
    isKnownReturnRoute: boolean,
  ): Promise<MatchScoreBreakdown> {
    // First check basic eligibility
    const eligibility = this.checkBasicEligibility(shipment, transporter)
    if (!eligibility.eligible) {
      return {
        routeScore: 0,
        capacityScore: 0,
        timingScore: 0,
        reputationScore: 0,
        experienceScore: 0,
        totalScore: 0,
        eligible: false,
        reason: eligibility.reason,
      }
    }

    // 1. ROUTE SCORE (40 points max)
    const routeScore = this.calculateRouteScore(shipment, transporter, isKnownReturnRoute)

    // 2. CAPACITY SCORE (20 points max)
    const capacityScore = this.calculateCapacityScore(shipment.weight, transporter.vehicleCapacity)

    // 3. TIMING SCORE (15 points max)
    const timingScore = await this.calculateTimingScore(shipment, transporter)

    // 4. REPUTATION SCORE (15 points max)
    const reputationScore = this.calculateReputationScore(transporter)

    // 5. EXPERIENCE SCORE (10 points max)
    const experienceScore = this.calculateExperienceScore(transporter)

    // Calculate weighted total
    const totalScore = Math.round(
      routeScore * MATCHING_WEIGHTS.route * 100 +
        capacityScore * MATCHING_WEIGHTS.capacity * 100 +
        timingScore * MATCHING_WEIGHTS.timing * 100 +
        reputationScore * MATCHING_WEIGHTS.reputation * 100 +
        experienceScore * MATCHING_WEIGHTS.experience * 100,
    )

    return {
      routeScore: Math.round(routeScore * 100),
      capacityScore: Math.round(capacityScore * 100),
      timingScore: Math.round(timingScore * 100),
      reputationScore: Math.round(reputationScore * 100),
      experienceScore: Math.round(experienceScore * 100),
      totalScore,
      eligible: true,
    }
  }

  /**
   * Check basic eligibility (vehicle capacity, cargo compatibility)
   */
  private checkBasicEligibility(
    shipment: Shipment,
    transporter: TransporterCandidate,
  ): { eligible: boolean; reason?: string } {
    // Check cargo-vehicle compatibility
    const compatibleVehicles = CARGO_VEHICLE_COMPATIBILITY[shipment.cargoType] || CARGO_VEHICLE_COMPATIBILITY.general

    if (!compatibleVehicles.includes(transporter.vehicleType)) {
      return {
        eligible: false,
        reason: `${transporter.vehicleType} cannot transport ${shipment.cargoType} cargo`,
      }
    }

    // Check weight capacity
    const maxCapacity = VEHICLE_CAPACITIES[transporter.vehicleType]
    if (shipment.weight > maxCapacity) {
      return {
        eligible: false,
        reason: `Load (${shipment.weight}kg) exceeds ${transporter.vehicleType} capacity (${maxCapacity}kg)`,
      }
    }

    // Check refrigeration requirement
    if (shipment.cargoType === "perishable" && !transporter.hasRefrigeration) {
      return {
        eligible: false,
        reason: "Perishable cargo requires refrigerated transport",
      }
    }

    // Check availability
    if (!transporter.isAvailable) {
      return {
        eligible: false,
        reason: "Transporter is not available",
      }
    }

    return { eligible: true }
  }

  /**
   * Route matching logic - The most critical factor (40 points)
   *
   * African Reality:
   * - Major routes are well-defined (M1 highway: Lilongwe-Blantyre)
   * - Transporters have regular routes (e.g., weekly Lilongwe-Blantyre-Lilongwe)
   * - Empty return trips are the primary opportunity
   * - Deviation tolerance: 50km is acceptable, 100km+ is too much
   */
  private calculateRouteScore(
    shipment: Shipment,
    transporter: TransporterCandidate,
    isKnownReturnRoute: boolean,
  ): number {
    // Perfect match - known return route (they need to go back anyway)
    if (isKnownReturnRoute) {
      return 1.0 // 100% route score
    }

    // Very good match - has experience on this route
    if (transporter.routeExperience > 0) {
      return 0.9 // 90% route score
    }

    // Check geographic proximity
    const distanceKm = this.getRouteDistance(shipment.origin.city, shipment.destination.city)

    // Check if transporter is currently near the origin
    const distanceToPickup = transporter.currentLocation
      ? this.getRouteDistance(transporter.currentLocation.city, shipment.origin.city)
      : 100 // Default assume 100km if no location

    // Combined score based on route familiarity and pickup proximity
    if (distanceToPickup < 25) {
      return 0.85 // Very close to pickup
    }

    if (distanceToPickup < 50) {
      return 0.75 // Close deviation
    }

    if (distanceToPickup < 100) {
      return 0.55 // Moderate deviation
    }

    if (distanceToPickup < 200) {
      return 0.35 // Significant deviation
    }

    return 0.15 // Poor match - but not impossible
  }

  /**
   * Capacity matching - Can the vehicle handle the load? (20 points)
   *
   * African Reality:
   * - Trucks are often overloaded (cultural norm)
   * - Vehicle capacity ratings may be outdated
   * - Safety margin needed for poor road conditions
   */
  private calculateCapacityScore(shipmentWeight: number, vehicleCapacity: number): number {
    const utilizationPercent = (shipmentWeight / vehicleCapacity) * 100

    if (utilizationPercent >= 80 && utilizationPercent <= 100) {
      return 1.0 // Perfect - near full capacity
    }

    if (utilizationPercent >= 60 && utilizationPercent < 80) {
      return 0.9 // Good - decent utilization
    }

    if (utilizationPercent >= 40 && utilizationPercent < 60) {
      return 0.7 // Fair - under-utilized
    }

    if (utilizationPercent >= 20 && utilizationPercent < 40) {
      return 0.5 // Poor - very under-utilized
    }

    if (utilizationPercent < 20) {
      return 0.3 // Very poor - wasteful
    }

    if (utilizationPercent > 100 && utilizationPercent <= 110) {
      return 0.6 // Slight overload - common in Africa
    }

    if (utilizationPercent > 110) {
      return 0.2 // Dangerous overload - risky
    }

    return 0.5 // Default
  }

  /**
   * Timing match - Can pickup happen when needed? (15 points)
   *
   * African Reality:
   * - "Tomorrow morning" is more common than "8:00 AM sharp"
   * - Flexibility is expected (±2 days is normal)
   * - Rainy season affects timing (October-March)
   */
  private async calculateTimingScore(shipment: Shipment, transporter: TransporterCandidate): Promise<number> {
    const departureDate = new Date(shipment.pickupDate)
    const today = new Date()
    const daysUntilDeparture = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Check for schedule conflict
    const hasConflict = await this.hasScheduleConflict(transporter.id, departureDate)

    if (hasConflict) {
      return 0.2 // Has another shipment same day
    }

    // Scoring based on timing urgency
    if (daysUntilDeparture === 0) {
      return 1.0 // Today - urgent
    }

    if (daysUntilDeparture === 1) {
      return 0.95 // Tomorrow - very soon
    }

    if (daysUntilDeparture >= 2 && daysUntilDeparture <= 3) {
      return 0.85 // 2-3 days - good planning window
    }

    if (daysUntilDeparture >= 4 && daysUntilDeparture <= 7) {
      return 0.7 // Week ahead - plenty of time
    }

    if (daysUntilDeparture > 7 && daysUntilDeparture <= 14) {
      return 0.5 // 1-2 weeks - far out
    }

    return 0.3 // More than 2 weeks - too far in advance
  }

  /**
   * Reputation score - Can we trust this transporter? (15 points)
   *
   * African Reality:
   * - Trust is earned slowly, lost quickly
   * - Ratings are sparse initially (cold start problem)
   * - Verification status matters (union membership, etc.)
   * - Completion rate more important than star ratings
   */
  private calculateReputationScore(transporter: TransporterCandidate): number {
    let score = 0

    // 1. Verification status (40% of reputation)
    if (transporter.verified) {
      score += 0.4
    } else {
      score += 0.1 // Unverified but not blocked
    }

    // 2. Rating average (40% of reputation)
    if (transporter.totalRatings >= 5) {
      // Has enough ratings to be reliable
      score += (transporter.rating / 5) * 0.4
    } else if (transporter.totalRatings > 0) {
      // Has some ratings but not enough
      score += (transporter.rating / 5) * 0.3
    } else {
      // No ratings - benefit of the doubt
      score += 0.2
    }

    // 3. Activity recency (20% of reputation)
    const daysSinceActive = transporter.lastActiveAt
      ? Math.ceil((Date.now() - transporter.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))
      : 30

    if (daysSinceActive <= 7) {
      score += 0.2 // Very active
    } else if (daysSinceActive <= 30) {
      score += 0.15 // Active recently
    } else {
      score += 0.05 // Inactive
    }

    return Math.min(score, 1.0)
  }

  /**
   * Experience score - Has the transporter proven themselves? (10 points)
   *
   * Factors:
   * - Total completed trips
   * - Trips on this specific route
   * - Account age
   * - On-time rate
   */
  private calculateExperienceScore(transporter: TransporterCandidate): number {
    let score = 0

    // Route-specific experience (50% of experience score)
    if (transporter.routeExperience >= 10) {
      score += 0.5 // Expert on this route
    } else if (transporter.routeExperience >= 5) {
      score += 0.4
    } else if (transporter.routeExperience >= 2) {
      score += 0.3
    } else if (transporter.routeExperience === 1) {
      score += 0.2
    } else {
      score += 0.1 // Never done this route
    }

    // General completion count (30% of experience score)
    if (transporter.completedTrips >= 50) {
      score += 0.3 // Very experienced
    } else if (transporter.completedTrips >= 20) {
      score += 0.25
    } else if (transporter.completedTrips >= 10) {
      score += 0.2
    } else if (transporter.completedTrips >= 5) {
      score += 0.15
    } else {
      score += 0.1 // New driver
    }

    // On-time rate (20% of experience score)
    score += transporter.onTimeRate * 0.2

    return Math.min(score, 1.0)
  }

  /**
   * Check if this is a known return route for the transporter
   * Logic: If transporter frequently does A→B, they need B→A returns
   */
  async isKnownReturnRoute(transporterId: string, origin: string, destination: string): Promise<boolean> {
    // Look for reverse trips (destination→origin) in transporter history
    const reverseTrips = this.transporterHistory.filter(
      (h) =>
        h.transporterId === transporterId &&
        h.origin === destination && // Note: reversed
        h.destination === origin &&
        this.isWithinDays(h.lastTripDate, 90),
    )

    // Done this route 2+ times in 90 days = known return route
    return reverseTrips.reduce((sum, h) => sum + h.completedTrips, 0) >= 2
  }

  /**
   * Check if transporter is heading towards the destination (backhaul opportunity)
   */
  private isBackhaulOpportunity(transporter: TransporterCandidate, shipment: Shipment): boolean {
    if (!transporter.currentLocation) return false

    // Simple check: transporter's current location matches shipment destination
    // This indicates they're heading back and could pick up cargo on the return
    return transporter.currentLocation.city === shipment.destination.city
  }

  /**
   * Check if transporter has a schedule conflict
   */
  private async hasScheduleConflict(transporterId: string, date: Date): Promise<boolean> {
    const conflicts = this.scheduleConflicts.get(transporterId) || []
    return conflicts.some((d) => d.toDateString() === date.toDateString())
  }

  /**
   * Determine if match needs manual admin review
   */
  private checkNeedsReview(
    shipment: Shipment,
    transporter: TransporterCandidate,
    scoreBreakdown: MatchScoreBreakdown,
  ): { needsReview: boolean; reviewReasons: string[] } {
    const reasons: string[] = []

    // High value shipment (>500,000 MWK)
    if (shipment.price > 500000) {
      reasons.push("High value shipment (>MK 500,000)")
    }

    // Unverified transporter
    if (!transporter.verified) {
      reasons.push("Unverified transporter")
    }

    // New transporter (< 5 ratings)
    if (transporter.totalRatings < 5) {
      reasons.push("New transporter (< 5 ratings)")
    }

    // Low match score (< 50)
    if (scoreBreakdown.totalScore < 50) {
      reasons.push("Low match score")
    }

    // Hazardous cargo
    if (shipment.cargoType === "hazardous" || shipment.cargoType === "fuel") {
      reasons.push("Hazardous/fuel cargo requires verification")
    }

    // Border crossing required
    if (shipment.borderCrossing?.required) {
      reasons.push("Border crossing required")
    }

    return {
      needsReview: reasons.length > 0,
      reviewReasons: reasons,
    }
  }

  /**
   * Get distance between two cities using predefined matrix
   */
  private getRouteDistance(origin: string, destination: string): number {
    const key = `${origin}-${destination}`
    const reverseKey = `${destination}-${origin}`

    return CITY_DISTANCES[key] || CITY_DISTANCES[reverseKey] || 500 // Default if unknown
  }

  /**
   * Check if date is within N days of today
   */
  private isWithinDays(date: Date, days: number): boolean {
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= days
  }

  /**
   * Add transporter history record (for tracking return routes)
   */
  addTransporterHistory(history: TransporterHistory): void {
    this.transporterHistory.push(history)
  }

  /**
   * Add schedule conflict for a transporter
   */
  addScheduleConflict(transporterId: string, date: Date): void {
    const conflicts = this.scheduleConflicts.get(transporterId) || []
    conflicts.push(date)
    this.scheduleConflicts.set(transporterId, conflicts)
  }

  /**
   * Get matches requiring admin review
   */
  getMatchesNeedingReview(matches: MatchResult[]): MatchResult[] {
    return matches.filter((m) => m.needsReview)
  }

  /**
   * Group matches by notification priority
   * - Top 3: SMS + WhatsApp immediately
   * - Matches 4-10: WhatsApp only
   */
  groupByNotificationPriority(matches: MatchResult[]): {
    highPriority: MatchResult[]
    normalPriority: MatchResult[]
  } {
    return {
      highPriority: matches.slice(0, 3),
      normalPriority: matches.slice(3),
    }
  }
}

// Singleton instance
export const matchingService = new MatchingService()

// Export types and utilities
export {
  MATCHING_WEIGHTS,
  CITY_DISTANCES,
  VEHICLE_CAPACITIES,
  CARGO_VEHICLE_COMPATIBILITY,
  MIN_MATCH_SCORE,
  MAX_MATCHES_PER_SHIPMENT,
}
