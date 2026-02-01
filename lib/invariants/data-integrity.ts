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

// ============================================
// FINANCIAL INVARIANTS
// ============================================

// INVARIANT: Payments cannot transition from completed/released back
export function validatePaymentStatusTransition(
  currentStatus: string,
  currentEscrowStatus: string,
  newStatus: string,
  newEscrowStatus: string,
): void {
  // Once completed and released, cannot change
  if (currentStatus === "completed" && currentEscrowStatus === "released") {
    if (newStatus !== "completed" || newEscrowStatus !== "released") {
      throw new ApiError(
        "Cannot modify completed and released payment",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }
  
  // Cannot double-release escrow
  if (currentEscrowStatus === "released" && newEscrowStatus === "released") {
    throw new ApiError(
      "Payment escrow has already been released",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Shipment status transitions must follow state machine
export function validateShipmentStatusTransition(
  currentStatus: string,
  newStatus: string,
): void {
  const validTransitions: Record<string, string[]> = {
    draft: ["pending", "cancelled"],
    pending: ["in_transit", "cancelled"],
    in_transit: ["completed", "failed"],
    completed: [], // Terminal state
    cancelled: [], // Terminal state
    failed: ["pending"], // Can retry from failed
  }

  const allowed = validTransitions[currentStatus] || []

  if (!allowed.includes(newStatus)) {
    throw new ApiError(
      `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(", ")}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Match status transitions must follow state machine
export function validateMatchStatusTransition(
  currentStatus: string,
  newStatus: string,
): void {
  const validTransitions: Record<string, string[]> = {
    pending: ["accepted", "rejected", "expired"],
    accepted: ["in_transit", "rejected"],
    in_transit: ["completed", "failed"],
    completed: [], // Terminal state
    rejected: [], // Terminal state
    expired: [], // Terminal state
    failed: [], // Terminal state
  }

  const allowed = validTransitions[currentStatus] || []

  if (!allowed.includes(newStatus)) {
    throw new ApiError(
      `Cannot transition match from ${currentStatus} to ${newStatus}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Balance must never go negative
export function validateWalletBalance(
  currentBalance: number,
  transactionAmount: number,
  transactionType: string,
): void {
  if (transactionType === "debit" && currentBalance - transactionAmount < 0) {
    throw new ApiError(
      `Insufficient balance. Current: MWK ${currentBalance.toLocaleString()}, Required: MWK ${transactionAmount.toLocaleString()}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Idempotency key prevents duplicate charges
export function validateIdempotencyKey(
  key: string | undefined,
): string | undefined {
  if (key && (key.length < 16 || key.length > 128)) {
    throw new ApiError(
      "Idempotency key must be 16-128 characters",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
  return key
}

// INVARIANT: USSD session must not exceed 5 minutes
export function validateUSSDSessionExpiry(expiresAt: Date): void {
  const now = new Date()
  const maxDuration = 5 * 60 * 1000 // 5 minutes in milliseconds
  const duration = expiresAt.getTime() - now.getTime()

  if (duration > maxDuration) {
    throw new ApiError(
      "USSD session expiry cannot exceed 5 minutes",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: SMS must not exceed 160 characters (for single message)
export function validateSMSLength(message: string): void {
  if (message.length > 160) {
    throw new ApiError(
      `SMS message cannot exceed 160 characters (got ${message.length})`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: File uploads must validate type and size
export function validateFileUpload(
  file: { size: number; type: string },
  maxSizeMB: number = 10,
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp"],
): void {
  const maxSizeBytes = maxSizeMB * 1024 * 1024

  if (file.size > maxSizeBytes) {
    throw new ApiError(
      `File size cannot exceed ${maxSizeMB}MB (got ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }

  if (!allowedTypes.includes(file.type)) {
    throw new ApiError(
      `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Duplicate checks for unique constraints
export function validateUniqueConstraint(
  existingRecord: unknown,
  fieldName: string,
): void {
  if (existingRecord) {
    throw new ApiError(
      `A record with this ${fieldName} already exists`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// INVARIANT: Rating cannot be submitted for incomplete shipments
export function validateRatingEligibility(shipmentStatus: string): void {
  if (shipmentStatus !== "completed") {
    throw new ApiError(
      "Ratings can only be submitted for completed shipments",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

// ============================================
// ENHANCED INVARIANT ENFORCEMENT
// ============================================

/**
 * INVARIANT: User verification status can only increase, never decrease
 * Progression: none → phone → id → community → rtoa → full
 */
export function validateVerificationProgression(
  currentLevel: string,
  newLevel: string,
): void {
  const levels = ["none", "phone", "id", "community", "rtoa", "full"]
  const currentIndex = levels.indexOf(currentLevel)
  const newIndex = levels.indexOf(newLevel)

  if (currentIndex === -1 || newIndex === -1) {
    throw new ApiError(
      "Invalid verification level",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }

  if (newIndex < currentIndex) {
    throw new ApiError(
      `Cannot downgrade verification from ${currentLevel} to ${newLevel}. Verification status can only increase.`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Every payment must reference exactly one shipment
 */
export function validatePaymentShipmentReference(shipmentId: string | null): void {
  if (!shipmentId) {
    throw new ApiError(
      "Payment must reference exactly one shipment",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Every payment must have a globally unique reference
 */
export function validateUniquePaymentReference(existingReference: unknown): void {
  if (existingReference) {
    throw new ApiError(
      "Payment reference must be globally unique",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: A transporter cannot have duplicate active matches for the same shipment
 */
export function validateNoDuplicateActiveMatches(
  existingActiveMatch: unknown,
  shipmentId: string,
  transporterId: string,
): void {
  if (existingActiveMatch) {
    throw new ApiError(
      `Transporter ${transporterId} already has an active match for shipment ${shipmentId}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: A transporter cannot accept two shipments with conflicting pickup dates
 */
export function validateNoScheduleConflict(
  conflictingShipment: unknown,
  pickupDate: Date,
): void {
  if (conflictingShipment) {
    throw new ApiError(
      `Schedule conflict detected. Transporter has another shipment scheduled for the same pickup date: ${pickupDate.toISOString()}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Match score must be deterministic for the same inputs
 * This is enforced at matching algorithm level - checking here for consistency
 */
export function validateMatchScoreDeterminism(
  score1: number,
  score2: number,
  tolerance: number = 0.01,
): void {
  if (Math.abs(score1 - score2) > tolerance) {
    throw new ApiError(
      "Match score calculation is not deterministic - same inputs must produce same score",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Union-verified users must have corresponding union_verification record
 */
export function validateUnionVerificationRecord(
  verificationMethod: string,
  unionVerificationRecord: unknown,
): void {
  if (verificationMethod === "union" && !unionVerificationRecord) {
    throw new ApiError(
      "Union-verified users must have corresponding union verification record",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: In-person verification must include photo evidence
 */
export function validateInPersonVerificationPhotos(
  verificationMethod: string,
  photoUrl: string | null,
): void {
  if (verificationMethod === "in_person" && !photoUrl) {
    throw new ApiError(
      "In-person verification must include photo evidence",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Verification timestamps must be monotonically increasing
 */
export function validateVerificationTimestampProgression(
  previousTimestamp: Date,
  newTimestamp: Date,
): void {
  if (newTimestamp < previousTimestamp) {
    throw new ApiError(
      "Verification timestamp cannot decrease. New timestamp must be after or equal to previous timestamp.",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Payment release during dispute must be blocked
 */
export function validateNoPaymentReleaseDuringDispute(
  disputeStatus: string,
  attemptingRelease: boolean,
): void {
  if (attemptingRelease && ["open", "under_review"].includes(disputeStatus)) {
    throw new ApiError(
      "Payment cannot be released while dispute is open or under review",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Shipment status transitions must follow the defined state machine
 * Enhanced version with all valid transitions
 */
export function validateShipmentStatusTransitionEnhanced(
  currentStatus: string,
  newStatus: string,
): void {
  const validTransitions: Record<string, string[]> = {
    draft: ["pending", "cancelled"],
    pending: ["accepted", "rejected", "cancelled"],
    accepted: ["in_transit", "cancelled"],
    in_transit: ["completed", "failed"],
    completed: [], // Terminal state - no further transitions
    rejected: [], // Terminal state
    cancelled: [], // Terminal state
    failed: ["pending"], // Can retry from failed
  }

  // Once a shipment is marked completed, it can never transition to any other status
  if (currentStatus === "completed") {
    throw new ApiError(
      "Cannot modify status of completed shipment. Completed shipments are immutable.",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }

  const allowed = validTransitions[currentStatus] || []

  if (!allowed.includes(newStatus)) {
    throw new ApiError(
      `Invalid shipment status transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowed.join(", ")}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Once a match is marked completed, it can never be rejected or expired
 */
export function validateMatchStatusTransitionEnhanced(
  currentStatus: string,
  newStatus: string,
): void {
  const validTransitions: Record<string, string[]> = {
    pending: ["accepted", "rejected", "expired"],
    accepted: ["completed", "rejected"],
    completed: [], // Terminal state - immutable after completion
    rejected: [], // Terminal state
    expired: [], // Terminal state
  }

  // Once a match is marked completed, it can never be rejected or expired
  if (currentStatus === "completed") {
    throw new ApiError(
      "Cannot modify status of completed match. Status transitions must be irreversible after completion.",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }

  const allowed = validTransitions[currentStatus] || []

  if (!allowed.includes(newStatus)) {
    throw new ApiError(
      `Invalid match status transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(", ")}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Every shipment must have a globally unique reference
 */
export function validateUniqueShipmentReference(existingReference: unknown): void {
  if (existingReference) {
    throw new ApiError(
      "Shipment reference must be globally unique",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Every match must reference an existing shipment and transporter
 */
export function validateMatchReferences(shipment: unknown, transporter: unknown): void {
  if (!shipment) {
    throw new ApiError(
      "Match must reference an existing shipment",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }

  if (!transporter) {
    throw new ApiError(
      "Match must reference an existing transporter",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Payments in escrow must never be double-released
 */
export function validateNoDoubleEscrowRelease(currentEscrowStatus: string): void {
  if (currentEscrowStatus === "released") {
    throw new ApiError(
      "Payment has already been released from escrow. Cannot double-release.",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Completed payments can never be refunded
 */
export function validateNoRefundForCompletedPayment(
  status: string,
  escrowStatus: string,
  attemptingRefund: boolean,
): void {
  if (
    attemptingRefund &&
    status === "completed" &&
    escrowStatus === "released"
  ) {
    throw new ApiError(
      "Completed and released payments can never be refunded",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Every dispute must reference exactly one shipment
 */
export function validateDisputeShipmentReference(shipmentId: string | null): void {
  if (!shipmentId) {
    throw new ApiError(
      "Dispute must reference exactly one shipment",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Disputes cannot be resolved without assignment to support agent
 */
export function validateDisputeAssignment(status: string, assignedToId: string | null): void {
  if (status === "resolved" && !assignedToId) {
    throw new ApiError(
      "Disputes cannot be resolved without assignment to a support agent",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Resolved disputes must have resolution explanation
 */
export function validateDisputeExplanation(status: string, explanation: string | null): void {
  if (status === "resolved" && !explanation?.trim()) {
    throw new ApiError(
      "Resolved disputes must include a resolution explanation",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: A user can only rate another user once per shipment
 */
export function validateNoDuplicateRatings(
  existingRating: unknown,
  ratedById: string,
  receiverId: string,
  shipmentId: string,
): void {
  if (existingRating) {
    throw new ApiError(
      `User ${ratedById} has already rated user ${receiverId} for shipment ${shipmentId}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Ratings cannot be modified after submission
 */
export function validateRatingImmutability(existingRating: unknown): void {
  if (existingRating) {
    throw new ApiError(
      "Ratings cannot be modified after submission. Ratings are immutable.",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}
