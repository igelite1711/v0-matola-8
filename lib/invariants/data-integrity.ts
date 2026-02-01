/**
 * Data Integrity Invariant Validators
 * Enforces constraints at application level before database operations
 */

import { ApiError, errorCodes } from "@/lib/api/utils/error-handler"

// INVARIANT: Phone numbers must be E.164 format
export function validatePhoneFormat(phone: string): boolean {
  const e164Regex = /^\+265\d{8,9}$/
  return e164Regex.test(phone)
}

// INVARIANT: Users must have exactly one role
export function validateUserRole(role: string): boolean {
  const validRoles = ["shipper", "transporter", "broker", "admin", "support"]
  return validRoles.includes(role)
}

// INVARIANT: Shipment weight must be positive
export function validateShipmentWeight(weight: number): void {
  if (weight <= 0) {
    throw new ApiError(
      "Shipment weight must be greater than zero",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Shipment price must be positive
export function validateShipmentPrice(price: number): void {
  if (price <= 0) {
    throw new ApiError(
      "Shipment price must be greater than zero",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Pickup date cannot be in the past
export function validatePickupDate(pickupDate: Date): void {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (new Date(pickupDate) < today) {
    throw new ApiError(
      "Pickup date cannot be in the past",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Delivery deadline must not precede pickup date
export function validateDeliveryDateAfterPickup(
  pickupDate: Date,
  deliveryDate: Date,
): void {
  if (new Date(deliveryDate) < new Date(pickupDate)) {
    throw new ApiError(
      "Delivery date must not precede pickup date",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Shipment origin and destination must be different
export function validateOriginAndDestinationDifferent(
  origin: string,
  destination: string,
): void {
  if (origin.toLowerCase() === destination.toLowerCase()) {
    throw new ApiError(
      "Origin and destination must be different",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Match score must be between 0 and 100
export function validateMatchScore(score: number): void {
  if (score < 0 || score > 100) {
    throw new ApiError(
      "Match score must be between 0 and 100",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Match final price cannot exceed 150% of shipment price
export function validateMatchPriceInflation(
  shipmentPrice: number,
  matchPrice: number,
): void {
  const maxAllowed = shipmentPrice * 1.5
  if (matchPrice > maxAllowed) {
    throw new ApiError(
      `Match price cannot exceed 150% of shipment price (max: MWK ${maxAllowed.toLocaleString()})`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Payment amount must be positive
export function validatePaymentAmount(amount: number): void {
  if (amount <= 0) {
    throw new ApiError(
      "Payment amount must be greater than zero",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Platform fee must not exceed 10% of payment
export function validatePlatformFee(amount: number, fee: number): void {
  const maxFee = amount * 0.1
  if (fee > maxFee) {
    throw new ApiError(
      `Platform fee cannot exceed 10% of payment amount (max: MWK ${maxFee.toLocaleString()})`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Net amount must equal (amount - fee)
export function validateNetAmount(
  amount: number,
  fee: number,
  netAmount: number,
): void {
  const expectedNet = amount - fee
  if (Math.abs(netAmount - expectedNet) > 0.01) {
    // Allow 1 cent rounding error
    throw new ApiError(
      `Net amount must equal amount minus fee (expected: ${expectedNet})`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Rating must be 1-5
export function validateRatingValue(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(
      "Rating must be an integer between 1 and 5",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: User cannot rate themselves
export function validateNotSelfRating(raterId: string, receiverId: string): void {
  if (raterId === receiverId) {
    throw new ApiError(
      "You cannot rate yourself",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: USSD session state must be valid
export const VALID_USSD_STATES = [
  "welcome",
  "menu_main",
  "menu_auth",
  "auth_phone",
  "auth_pin",
  "menu_shipment",
  "shipment_list",
  "shipment_detail",
  "menu_payment",
  "payment_status",
  "error",
  "exit",
]

export function validateUSSDState(state: string): boolean {
  return VALID_USSD_STATES.includes(state)
}

// INVARIANT: USSD response must not exceed 160 characters
export function validateUSSDResponseLength(response: string): void {
  if (response.length > 160) {
    throw new ApiError(
      "USSD response cannot exceed 160 characters",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Session context must be valid JSON
export function validateSessionContextJSON(context: string | null): void {
  if (context) {
    try {
      JSON.parse(context)
    } catch {
      throw new ApiError(
        "Session context must be valid JSON",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }
}

// INVARIANT: Verification level can only increase
export function validateVerificationLevelProgression(
  currentLevel: string,
  newLevel: string,
): void {
  const levels = ["none", "phone", "id", "community", "rtoa", "full"]
  const currentIndex = levels.indexOf(currentLevel)
  const newIndex = levels.indexOf(newLevel)

  if (newIndex < currentIndex) {
    throw new ApiError(
      "Verification level can only increase, never decrease",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Dispute resolution requires explanation and assignment
export function validateDisputeResolution(
  status: string,
  assignedToId: string | null,
  resolution: string | null,
): void {
  if (status === "resolved") {
    if (!assignedToId) {
      throw new ApiError(
        "Dispute must be assigned to support agent before resolution",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
    if (!resolution) {
      throw new ApiError(
        "Dispute resolution must include explanation",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }
}
