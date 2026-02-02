/**
 * Matching API Service
 *
 * Handles match creation, approval, and notification workflows
 */

import { matchingService } from "@/lib/matching-service"
import type { MatchResult, TransporterCandidate, MatchingOptions } from "@/lib/matching-service"
import type { Shipment } from "@/lib/types"

// In-memory storage for matches (in production, use database)
const matchesStore = new Map<string, MatchResult>()
const shipmentMatchesIndex = new Map<string, string[]>()
const transporterMatchesIndex = new Map<string, string[]>()

export interface AdminMatchReview {
  matchId: string
  shipmentRef: string
  origin: string
  destination: string
  weightKg: number
  priceMwk: number
  cargoType: string
  shipperName: string
  shipperPhone: string
  shipperRating: number
  shipperVerified: boolean
  transporterName: string
  transporterPhone: string
  transporterRating: number
  transporterVerified: boolean
  vehicleRegistration: string
  vehicleType: string
  capacityKg: number
  matchScore: number
  needsReview: boolean
  reviewReasons: string[]
  matchedAt: Date
}

export interface MatchApprovalResult {
  success: boolean
  matchId: string
  action: "approved" | "rejected" | "flagged"
  message?: string
}

class MatchingApiService {
  /**
   * Find and create matches for a shipment
   */
  async findAndCreateMatches(
    shipment: Shipment,
    transporters: TransporterCandidate[],
    options?: MatchingOptions,
  ): Promise<MatchResult[]> {
    // Find matches using the matching service
    const matches = await matchingService.findMatches(shipment, transporters, options)

    // Store matches
    for (const match of matches) {
      matchesStore.set(match.id, match)

      // Update shipment index
      const shipmentMatches = shipmentMatchesIndex.get(match.shipmentId) || []
      shipmentMatches.push(match.id)
      shipmentMatchesIndex.set(match.shipmentId, shipmentMatches)

      // Update transporter index
      const transporterMatches = transporterMatchesIndex.get(match.transporterId) || []
      transporterMatches.push(match.id)
      transporterMatchesIndex.set(match.transporterId, transporterMatches)
    }

    return matches
  }

  /**
   * Get matches by shipment ID
   */
  getMatchesByShipment(shipmentId: string): MatchResult[] {
    const matchIds = shipmentMatchesIndex.get(shipmentId) || []
    return matchIds.map((id) => matchesStore.get(id)).filter((m): m is MatchResult => m !== undefined)
  }

  /**
   * Get matches by transporter ID
   */
  getMatchesByTransporter(transporterId: string): MatchResult[] {
    const matchIds = transporterMatchesIndex.get(transporterId) || []
    return matchIds.map((id) => matchesStore.get(id)).filter((m): m is MatchResult => m !== undefined)
  }

  /**
   * Get match by ID
   */
  getMatchById(matchId: string): MatchResult | undefined {
    return matchesStore.get(matchId)
  }

  /**
   * Get all pending matches needing admin review
   */
  getPendingReviews(): AdminMatchReview[] {
    const allMatches = Array.from(matchesStore.values())

    return allMatches
      .filter((m) => m.status === "pending" && m.needsReview)
      .map((match) => ({
        matchId: match.id,
        shipmentRef: match.shipmentId,
        origin: "", // Would be populated from shipment lookup
        destination: "",
        weightKg: 0,
        priceMwk: match.pricing.grossPrice,
        cargoType: "",
        shipperName: "",
        shipperPhone: "",
        shipperRating: 0,
        shipperVerified: false,
        transporterName: match.transporterName,
        transporterPhone: match.transporterPhone,
        transporterRating: match.transporterRating,
        transporterVerified: false, // Would be populated from transporter lookup
        vehicleRegistration: match.vehiclePlate,
        vehicleType: match.vehicleType,
        capacityKg: 0,
        matchScore: match.matchScore,
        needsReview: match.needsReview,
        reviewReasons: match.reviewReasons,
        matchedAt: match.matchedAt,
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
  }

  /**
   * Admin action: Approve, reject, or flag a match
   */
  reviewMatch(matchId: string, action: "approve" | "reject" | "flag", adminNotes?: string): MatchApprovalResult {
    const match = matchesStore.get(matchId)

    if (!match) {
      return {
        success: false,
        matchId,
        action: action === "approve" ? "approved" : action === "reject" ? "rejected" : "flagged",
        message: "Match not found",
      }
    }

    if (action === "approve") {
      match.status = "pending" // Approved for transporter to accept
      // In production, trigger notifications here
      return {
        success: true,
        matchId,
        action: "approved",
        message: "Match approved and transporter notified",
      }
    }

    if (action === "reject") {
      match.status = "rejected"
      return {
        success: true,
        matchId,
        action: "rejected",
        message: adminNotes || "Match rejected by admin",
      }
    }

    // Flag for further review
    match.reviewReasons.push(adminNotes || "Flagged by admin")
    return {
      success: true,
      matchId,
      action: "flagged",
      message: "Match flagged for further review",
    }
  }

  /**
   * Transporter accepts a match
   */
  acceptMatch(
    matchId: string,
    transporterId: string,
  ): {
    success: boolean
    message: string
  } {
    const match = matchesStore.get(matchId)

    if (!match) {
      return { success: false, message: "Match not found" }
    }

    if (match.transporterId !== transporterId) {
      return { success: false, message: "Unauthorized" }
    }

    if (match.status !== "pending") {
      return { success: false, message: `Match is already ${match.status}` }
    }

    if (new Date() > match.expiresAt) {
      match.status = "expired"
      return { success: false, message: "Match has expired" }
    }

    match.status = "accepted"
    return { success: true, message: "Match accepted successfully" }
  }

  /**
   * Transporter rejects a match
   */
  rejectMatch(
    matchId: string,
    transporterId: string,
  ): {
    success: boolean
    message: string
  } {
    const match = matchesStore.get(matchId)

    if (!match) {
      return { success: false, message: "Match not found" }
    }

    if (match.transporterId !== transporterId) {
      return { success: false, message: "Unauthorized" }
    }

    match.status = "rejected"
    return { success: true, message: "Match rejected" }
  }

  /**
   * Mark match as notified
   */
  markAsNotified(matchId: string): void {
    const match = matchesStore.get(matchId)
    if (match) {
      match.notifiedAt = new Date()
    }
  }

  /**
   * Get notification groups for a set of matches
   */
  getNotificationGroups(matches: MatchResult[]): {
    smsAndWhatsapp: MatchResult[]
    whatsappOnly: MatchResult[]
  } {
    const { highPriority, normalPriority } = matchingService.groupByNotificationPriority(matches)

    return {
      smsAndWhatsapp: highPriority,
      whatsappOnly: normalPriority,
    }
  }

  /**
   * Background job: Match all pending shipments
   * Called every 15 minutes
   */
  async batchMatchPendingShipments(
    pendingShipments: Shipment[],
    allTransporters: TransporterCandidate[],
  ): Promise<{
    processed: number
    matchesCreated: number
    errors: number
  }> {
    let processed = 0
    let matchesCreated = 0
    let errors = 0

    for (const shipment of pendingShipments) {
      try {
        const matches = await this.findAndCreateMatches(shipment, allTransporters)
        processed++
        matchesCreated += matches.length
      } catch (error) {
        console.error(`Error matching shipment ${shipment.id}:`, error)
        errors++
      }
    }

    return { processed, matchesCreated, errors }
  }

  /**
   * Expire old pending matches
   */
  expireOldMatches(): number {
    const now = new Date()
    let expired = 0

    for (const match of matchesStore.values()) {
      if (match.status === "pending" && now > match.expiresAt) {
        match.status = "expired"
        expired++
      }
    }

    return expired
  }
}

export const matchingApiService = new MatchingApiService()
