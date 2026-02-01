/**
 * MATOLA Invariant Enforcement Service
 * Centralized enforcement of all system invariants at application level
 * Ensures data consistency before and after database operations
 */

import { ApiError, errorCodes } from "@/lib/api/utils/error-handler"
import { validateMalawiPhone } from "@/lib/malawi-validators"
import type { Prisma } from "@prisma/client"
import * as integrity from "./data-integrity"

export interface InvariantEnforcementResult {
  valid: boolean
  violations: string[]
}

// ============================================
// USER & IDENTITY INVARIANTS
// ============================================

export class UserInvariantEnforcer {
  static enforcePhoneFormat(phone: string): void {
    const validation = validateMalawiPhone(phone)
    if (!validation.valid) {
      throw new ApiError(
        validation.error || "Invalid phone format",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceUniqueRole(role: string): void {
    integrity.validateUserRole(role)
  }

  static enforceVerificationProgression(
    currentLevel: string,
    newLevel: string,
  ): void {
    integrity.validateVerificationLevelProgression(currentLevel, newLevel)
  }

  static enforceSoftDelete(user: { deletedAt: Date | null }): void {
    // When soft-deleting, ensure deletedAt is set
    if (user.deletedAt === null) {
      throw new ApiError(
        "User must be soft-deleted (deletedAt required)",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceAll(userData: {
    phone: string
    role: string
    verificationLevel: string
  }): InvariantEnforcementResult {
    const violations: string[] = []

    try {
      this.enforcePhoneFormat(userData.phone)
    } catch (e) {
      violations.push(`Phone: ${(e as Error).message}`)
    }

    try {
      this.enforceUniqueRole(userData.role)
    } catch (e) {
      violations.push(`Role: ${(e as Error).message}`)
    }

    return {
      valid: violations.length === 0,
      violations,
    }
  }
}

// ============================================
// SHIPMENT INVARIANTS
// ============================================

export class ShipmentInvariantEnforcer {
  static enforcePositiveWeight(weight: number): void {
    integrity.validateShipmentWeight(weight)
  }

  static enforcePositivePrice(price: number | null | undefined): void {
    if (price !== null && price !== undefined) {
      integrity.validateShipmentPrice(price)
    }
  }

  static enforcePickupDateNotPast(pickupDate: Date): void {
    integrity.validatePickupDate(pickupDate)
  }

  static enforceDeliveryAfterPickup(
    pickupDate: Date,
    deliveryDate: Date,
  ): void {
    integrity.validateDeliveryDateAfterPickup(pickupDate, deliveryDate)
  }

  static enforceOriginDestinationDifferent(
    origin: string,
    destination: string,
  ): void {
    integrity.validateOriginAndDestinationDifferent(origin, destination)
  }

  static enforceStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    integrity.validateShipmentStatusTransition(currentStatus, newStatus)
  }

  static enforceImmutableCompleted(
    currentStatus: string,
    newStatus: string,
  ): void {
    if (currentStatus === "completed" && newStatus !== "completed") {
      throw new ApiError(
        "Cannot modify status of completed shipment",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceAll(shipmentData: {
    weight: number
    quotedPrice?: number | null
    finalPrice?: number | null
    pickupLocation: string
    deliveryLocation: string
    pickupDate: Date
    deliveryDate: Date
    currentStatus?: string
    newStatus?: string
  }): InvariantEnforcementResult {
    const violations: string[] = []

    try {
      this.enforcePositiveWeight(shipmentData.weight)
    } catch (e) {
      violations.push(`Weight: ${(e as Error).message}`)
    }

    try {
      this.enforcePositivePrice(shipmentData.quotedPrice)
      this.enforcePositivePrice(shipmentData.finalPrice)
    } catch (e) {
      violations.push(`Price: ${(e as Error).message}`)
    }

    try {
      this.enforceOriginDestinationDifferent(
        shipmentData.pickupLocation,
        shipmentData.deliveryLocation,
      )
    } catch (e) {
      violations.push(`Location: ${(e as Error).message}`)
    }

    try {
      this.enforcePickupDateNotPast(shipmentData.pickupDate)
      this.enforceDeliveryAfterPickup(
        shipmentData.pickupDate,
        shipmentData.deliveryDate,
      )
    } catch (e) {
      violations.push(`Dates: ${(e as Error).message}`)
    }

    if (shipmentData.currentStatus && shipmentData.newStatus) {
      try {
        this.enforceStatusTransition(
          shipmentData.currentStatus,
          shipmentData.newStatus,
        )
        this.enforceImmutableCompleted(
          shipmentData.currentStatus,
          shipmentData.newStatus,
        )
      } catch (e) {
        violations.push(`Status transition: ${(e as Error).message}`)
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    }
  }
}

// ============================================
// MATCH INVARIANTS
// ============================================

export class MatchInvariantEnforcer {
  static enforceScoreRange(score: number): void {
    integrity.validateMatchScore(score)
  }

  static enforcePriceInflationLimit(
    shipmentPrice: number,
    matchPrice: number,
  ): void {
    integrity.validateMatchPriceInflation(shipmentPrice, matchPrice)
  }

  static enforceStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    integrity.validateMatchStatusTransition(currentStatus, newStatus)
  }

  static enforceImmutableCompleted(
    currentStatus: string,
    newStatus: string,
  ): void {
    if (currentStatus === "completed" && newStatus !== "completed") {
      throw new ApiError(
        "Cannot modify completed match",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceNoDuplicateActive(
    existingActiveMatch: unknown,
  ): void {
    if (existingActiveMatch) {
      throw new ApiError(
        "A transporter cannot have duplicate active matches for the same shipment",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceAll(matchData: {
    matchScore: number
    shipmentPrice: number
    matchPrice?: number | null
    currentStatus?: string
    newStatus?: string
  }): InvariantEnforcementResult {
    const violations: string[] = []

    try {
      this.enforceScoreRange(matchData.matchScore)
    } catch (e) {
      violations.push(`Match score: ${(e as Error).message}`)
    }

    if (matchData.matchPrice) {
      try {
        this.enforcePriceInflationLimit(matchData.shipmentPrice, matchData.matchPrice)
      } catch (e) {
        violations.push(`Price: ${(e as Error).message}`)
      }
    }

    if (matchData.currentStatus && matchData.newStatus) {
      try {
        this.enforceStatusTransition(
          matchData.currentStatus,
          matchData.newStatus,
        )
        this.enforceImmutableCompleted(
          matchData.currentStatus,
          matchData.newStatus,
        )
      } catch (e) {
        violations.push(`Status transition: ${(e as Error).message}`)
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    }
  }
}

// ============================================
// PAYMENT INVARIANTS
// ============================================

export class PaymentInvariantEnforcer {
  static enforcePositiveAmount(amount: number): void {
    integrity.validatePaymentAmount(amount)
  }

  static enforceFeeLimit(amount: number, fee: number): void {
    integrity.validatePlatformFee(amount, fee)
  }

  static enforceNetAmountCalculation(
    amount: number,
    fee: number,
    netAmount: number,
  ): void {
    integrity.validateNetAmount(amount, fee, netAmount)
  }

  static enforceStatusTransition(
    currentStatus: string,
    currentEscrowStatus: string,
    newStatus: string,
    newEscrowStatus: string,
  ): void {
    integrity.validatePaymentStatusTransition(
      currentStatus,
      currentEscrowStatus,
      newStatus,
      newEscrowStatus,
    )
  }

  static enforceNoDubleRelease(escrowStatus: string): void {
    if (escrowStatus === "released") {
      throw new ApiError(
        "Payment escrow has already been released",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceIdempotencyKey(key: string | undefined): void {
    integrity.validateIdempotencyKey(key)
  }

  static enforceAll(paymentData: {
    amount: number
    platformFee: number
    netAmount: number
    currentStatus?: string
    currentEscrowStatus?: string
    newStatus?: string
    newEscrowStatus?: string
    idempotencyKey?: string
  }): InvariantEnforcementResult {
    const violations: string[] = []

    try {
      this.enforcePositiveAmount(paymentData.amount)
    } catch (e) {
      violations.push(`Amount: ${(e as Error).message}`)
    }

    try {
      this.enforceFeeLimit(paymentData.amount, paymentData.platformFee)
    } catch (e) {
      violations.push(`Fee: ${(e as Error).message}`)
    }

    try {
      this.enforceNetAmountCalculation(
        paymentData.amount,
        paymentData.platformFee,
        paymentData.netAmount,
      )
    } catch (e) {
      violations.push(`Net amount: ${(e as Error).message}`)
    }

    if (
      paymentData.currentStatus &&
      paymentData.newStatus &&
      paymentData.currentEscrowStatus &&
      paymentData.newEscrowStatus
    ) {
      try {
        this.enforceStatusTransition(
          paymentData.currentStatus,
          paymentData.currentEscrowStatus,
          paymentData.newStatus,
          paymentData.newEscrowStatus,
        )
      } catch (e) {
        violations.push(`Status transition: ${(e as Error).message}`)
      }
    }

    try {
      this.enforceIdempotencyKey(paymentData.idempotencyKey)
    } catch (e) {
      violations.push(`Idempotency: ${(e as Error).message}`)
    }

    return {
      valid: violations.length === 0,
      violations,
    }
  }
}

// ============================================
// RATING INVARIANTS
// ============================================

export class RatingInvariantEnforcer {
  static enforceValidRating(rating: number): void {
    integrity.validateRatingValue(rating)
  }

  static enforceNotSelfRating(raterId: string, receiverId: string): void {
    integrity.validateNotSelfRating(raterId, receiverId)
  }

  static enforceCompletedShipment(shipmentStatus: string): void {
    integrity.validateRatingEligibility(shipmentStatus)
  }

  static enforceAll(ratingData: {
    rating: number
    raterId: string
    receiverId: string
    shipmentStatus: string
  }): InvariantEnforcementResult {
    const violations: string[] = []

    try {
      this.enforceValidRating(ratingData.rating)
    } catch (e) {
      violations.push(`Rating: ${(e as Error).message}`)
    }

    try {
      this.enforceNotSelfRating(ratingData.raterId, ratingData.receiverId)
    } catch (e) {
      violations.push(`Self-rating: ${(e as Error).message}`)
    }

    try {
      this.enforceCompletedShipment(ratingData.shipmentStatus)
    } catch (e) {
      violations.push(`Shipment: ${(e as Error).message}`)
    }

    return {
      valid: violations.length === 0,
      violations,
    }
  }
}

// ============================================
// USSD INVARIANTS
// ============================================

export class USSDInvariantEnforcer {
  static enforceValidState(state: string): void {
    if (!integrity.validateUSSDState(state)) {
      throw new ApiError(
        `Invalid USSD state: ${state}. Valid states: ${integrity.VALID_USSD_STATES.join(", ")}`,
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceResponseLength(response: string): void {
    integrity.validateUSSDResponseLength(response)
  }

  static enforceContextJSON(context: string | null): void {
    integrity.validateSessionContextJSON(context)
  }

  static enforceSessionExpiry(expiresAt: Date): void {
    integrity.validateUSSDSessionExpiry(expiresAt)
  }

  static enforceAll(ussdData: {
    state: string
    response: string
    context?: string | null
    expiresAt?: Date
  }): InvariantEnforcementResult {
    const violations: string[] = []

    try {
      this.enforceValidState(ussdData.state)
    } catch (e) {
      violations.push(`State: ${(e as Error).message}`)
    }

    try {
      this.enforceResponseLength(ussdData.response)
    } catch (e) {
      violations.push(`Response length: ${(e as Error).message}`)
    }

    if (ussdData.context) {
      try {
        this.enforceContextJSON(ussdData.context)
      } catch (e) {
        violations.push(`Context: ${(e as Error).message}`)
      }
    }

    if (ussdData.expiresAt) {
      try {
        this.enforceSessionExpiry(ussdData.expiresAt)
      } catch (e) {
        violations.push(`Expiry: ${(e as Error).message}`)
      }
    }

    return {
      valid: violations.length === 0,
      violations,
    }
  }
}

// ============================================
// BATCH ENFORCEMENT
// ============================================

export class InvariantEnforcer {
  static enforceOnUserCreate(userData: {
    phone: string
    role: string
    verificationLevel: string
  }): void {
    const result = UserInvariantEnforcer.enforceAll(userData)
    if (!result.valid) {
      throw new ApiError(
        `User creation failed: ${result.violations.join("; ")}`,
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceOnShipmentCreate(shipmentData: {
    weight: number
    quotedPrice?: number | null
    finalPrice?: number | null
    pickupLocation: string
    deliveryLocation: string
    pickupDate: Date
    deliveryDate: Date
  }): void {
    const result = ShipmentInvariantEnforcer.enforceAll(shipmentData)
    if (!result.valid) {
      throw new ApiError(
        `Shipment creation failed: ${result.violations.join("; ")}`,
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceOnShipmentUpdate(
    currentStatus: string,
    newStatus: string,
  ): void {
    ShipmentInvariantEnforcer.enforceStatusTransition(currentStatus, newStatus)
    ShipmentInvariantEnforcer.enforceImmutableCompleted(currentStatus, newStatus)
  }

  static enforceOnMatchCreate(matchData: {
    matchScore: number
    shipmentPrice: number
    matchPrice?: number | null
  }): void {
    const result = MatchInvariantEnforcer.enforceAll({
      ...matchData,
      matchScore: matchData.matchScore,
      shipmentPrice: matchData.shipmentPrice,
    })
    if (!result.valid) {
      throw new ApiError(
        `Match creation failed: ${result.violations.join("; ")}`,
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceOnPaymentCreate(paymentData: {
    amount: number
    platformFee: number
    netAmount: number
    idempotencyKey?: string
  }): void {
    const result = PaymentInvariantEnforcer.enforceAll(paymentData)
    if (!result.valid) {
      throw new ApiError(
        `Payment creation failed: ${result.violations.join("; ")}`,
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  static enforceOnRatingCreate(ratingData: {
    rating: number
    raterId: string
    receiverId: string
    shipmentStatus: string
  }): void {
    const result = RatingInvariantEnforcer.enforceAll(ratingData)
    if (!result.valid) {
      throw new ApiError(
        `Rating creation failed: ${result.violations.join("; ")}`,
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }
}
