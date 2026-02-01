import { supabase } from "@/lib/supabase/client"

/**
 * MATOLA System Invariants - Supabase Implementation
 * Application-level validation layer for database integrity
 */

export class InvariantError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = "InvariantError"
  }
}

// ============================================
// USER & IDENTITY INVARIANTS
// ============================================

/**
 * INVARIANT: Every user must have a unique phone number
 */
export async function validateUniquePhoneNumber(phone: string, excludeUserId?: string): Promise<void> {
  const query = supabase.from("users").select("id").eq("phone", phone)

  if (excludeUserId) {
    query.neq("id", excludeUserId)
  }

  const { data, error } = await query.limit(1)

  if (error) throw error

  if (data && data.length > 0) {
    throw new InvariantError(
      "USER_PHONE_DUPLICATE",
      "A user with this phone number already exists",
      409
    )
  }
}

/**
 * INVARIANT: Phone numbers must always be in E.164 format
 */
export function validateE164PhoneFormat(phone: string): void {
  const e164Regex = /^\+[1-9]\d{1,14}$/
  if (!e164Regex.test(phone)) {
    throw new InvariantError(
      "INVALID_PHONE_FORMAT",
      "Phone number must be in E.164 format (e.g., +265123456789)",
      400
    )
  }
}

/**
 * INVARIANT: User verification status can only increase, never decrease
 */
export async function validateVerificationProgression(
  userId: string,
  newLevel: string
): Promise<void> {
  const levels = {
    none: 0,
    phone: 1,
    id: 2,
    community: 3,
    rtoa: 4,
    full: 5,
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("verification_level")
    .eq("id", userId)
    .single()

  if (error) throw error
  if (!user) {
    throw new InvariantError("USER_NOT_FOUND", "User not found", 404)
  }

  const currentLevel = levels[user.verification_level as keyof typeof levels] || 0
  const newLevelValue = levels[newLevel as keyof typeof levels]

  if (newLevelValue < currentLevel) {
    throw new InvariantError(
      "VERIFICATION_DOWNGRADE_FORBIDDEN",
      "User verification status can only increase, never decrease",
      400
    )
  }
}

// ============================================
// SHIPMENT INVARIANTS
// ============================================

/**
 * INVARIANT: Shipment weight must always be positive and greater than zero
 */
export function validateShipmentWeight(weight: number): void {
  if (weight <= 0) {
    throw new InvariantError(
      "INVALID_SHIPMENT_WEIGHT",
      "Shipment weight must be greater than zero",
      400
    )
  }
}

/**
 * INVARIANT: Shipment price must always be positive and greater than zero
 */
export function validateShipmentPrice(price: number): void {
  if (price <= 0) {
    throw new InvariantError(
      "INVALID_SHIPMENT_PRICE",
      "Shipment price must be greater than zero",
      400
    )
  }
}

/**
 * INVARIANT: Pickup date must never be in the past
 */
export function validatePickupDate(pickupDate: Date): void {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Start of today

  if (new Date(pickupDate) < now) {
    throw new InvariantError(
      "INVALID_PICKUP_DATE",
      "Pickup date cannot be in the past",
      400
    )
  }
}

/**
 * INVARIANT: Delivery deadline must never precede pickup date
 */
export function validateDeliveryDate(pickupDate: Date, deliveryDate: Date): void {
  if (new Date(deliveryDate) < new Date(pickupDate)) {
    throw new InvariantError(
      "INVALID_DELIVERY_DATE",
      "Delivery date must be after or equal to pickup date",
      400
    )
  }
}

/**
 * INVARIANT: Shipment origin and destination must always be different
 */
export function validateOriginDestinationDifferent(
  origin: string,
  destination: string
): void {
  if (origin === destination) {
    throw new InvariantError(
      "INVALID_SHIPMENT_LOCATIONS",
      "Origin and destination must be different",
      400
    )
  }
}

/**
 * INVARIANT: Every shipment must have a globally unique reference
 */
export async function validateUniqueShipmentReference(
  reference: string,
  excludeShipmentId?: string
): Promise<void> {
  const query = supabase
    .from("shipments")
    .select("id")
    .eq("reference_number", reference)

  if (excludeShipmentId) {
    query.neq("id", excludeShipmentId)
  }

  const { data, error } = await query.limit(1)

  if (error) throw error

  if (data && data.length > 0) {
    throw new InvariantError(
      "SHIPMENT_REFERENCE_DUPLICATE",
      "Shipment reference must be globally unique",
      409
    )
  }
}

/**
 * INVARIANT: Shipment status transitions must follow the defined state machine
 */
export function validateShipmentStatusTransition(
  currentStatus: string,
  newStatus: string
): void {
  const validTransitions: Record<string, string[]> = {
    draft: ["pending", "cancelled"],
    pending: ["posted", "cancelled"],
    posted: ["matched", "cancelled"],
    matched: ["confirmed", "cancelled"],
    confirmed: ["picked_up", "cancelled"],
    picked_up: ["in_transit", "cancelled"],
    in_transit: ["at_checkpoint", "at_border", "delivered", "disputed"],
    at_checkpoint: ["in_transit", "at_border", "delivered", "disputed"],
    at_border: ["in_transit", "delivered", "disputed"],
    delivered: ["completed", "disputed"],
    completed: [], // Terminal state
    cancelled: [], // Terminal state
    disputed: ["completed", "cancelled"],
  }

  if (currentStatus === "completed") {
    throw new InvariantError(
      "SHIPMENT_IMMUTABLE",
      "Completed shipments cannot be modified",
      400
    )
  }

  const allowed = validTransitions[currentStatus] || []
  if (!allowed.includes(newStatus)) {
    throw new InvariantError(
      "INVALID_STATUS_TRANSITION",
      `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(", ")}`,
      400
    )
  }
}

// ============================================
// MATCH INVARIANTS
// ============================================

/**
 * INVARIANT: Match score must always be between 0 and 100
 */
export function validateMatchScore(score: number): void {
  if (score < 0 || score > 100) {
    throw new InvariantError(
      "INVALID_MATCH_SCORE",
      "Match score must be between 0 and 100",
      400
    )
  }
}

/**
 * INVARIANT: Match final_price cannot exceed 150% of shipment original price
 */
export async function validateMatchPrice(
  shipmentId: string,
  finalPrice: number | null
): Promise<void> {
  if (!finalPrice) return

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select("price_mwk")
    .eq("id", shipmentId)
    .single()

  if (error) throw error
  if (!shipment) {
    throw new InvariantError("SHIPMENT_NOT_FOUND", "Shipment not found", 404)
  }

  const maxPrice = shipment.price_mwk * 1.5

  if (finalPrice > maxPrice) {
    throw new InvariantError(
      "MATCH_PRICE_EXCEEDS_LIMIT",
      `Match price cannot exceed 150% of shipment price (max: ${maxPrice}, got: ${finalPrice})`,
      400
    )
  }
}

/**
 * INVARIANT: A transporter cannot have duplicate active matches for the same shipment
 */
export async function validateNoDuplicateActiveMatches(
  shipmentId: string,
  transporterId: string
): Promise<void> {
  const { data, error } = await supabase
    .from("matches")
    .select("id")
    .eq("shipment_id", shipmentId)
    .eq("transporter_id", transporterId)
    .in("status", ["pending", "accepted"])
    .limit(1)

  if (error) throw error

  if (data && data.length > 0) {
    throw new InvariantError(
      "DUPLICATE_ACTIVE_MATCH",
      "Transporter already has an active match for this shipment",
      409
    )
  }
}

/**
 * INVARIANT: Match status transitions must follow the defined state machine
 */
export function validateMatchStatusTransition(currentStatus: string, newStatus: string): void {
  const validTransitions: Record<string, string[]> = {
    pending: ["accepted", "rejected", "expired"],
    accepted: ["completed", "rejected"],
    completed: [], // Terminal state
    rejected: [], // Terminal state
    expired: [], // Terminal state
  }

  if (currentStatus === "completed") {
    throw new InvariantError(
      "MATCH_IMMUTABLE",
      "Completed matches cannot be modified",
      400
    )
  }

  const allowed = validTransitions[currentStatus] || []
  if (!allowed.includes(newStatus)) {
    throw new InvariantError(
      "INVALID_MATCH_STATUS_TRANSITION",
      `Cannot transition from ${currentStatus} to ${newStatus}`,
      400
    )
  }
}

// ============================================
// PAYMENT INVARIANTS
// ============================================

/**
 * INVARIANT: Payment amount must always be positive and greater than zero
 */
export function validatePaymentAmount(amount: number): void {
  if (amount <= 0) {
    throw new InvariantError(
      "INVALID_PAYMENT_AMOUNT",
      "Payment amount must be greater than zero",
      400
    )
  }
}

/**
 * INVARIANT: Platform fee must never exceed 10% of payment amount
 */
export function validatePlatformFee(amount: number, fee: number): void {
  const maxFee = amount * 0.1

  if (fee > maxFee) {
    throw new InvariantError(
      "PLATFORM_FEE_EXCEEDS_LIMIT",
      `Platform fee cannot exceed 10% of payment amount (max: ${maxFee}, got: ${fee})`,
      400
    )
  }
}

/**
 * INVARIANT: Net amount must always equal (amount - platform_fee)
 */
export function validateNetAmount(
  amount: number,
  platformFee: number,
  netAmount: number
): void {
  const expectedNetAmount = amount - platformFee
  const tolerance = 0.01 // Account for floating-point precision

  if (Math.abs(netAmount - expectedNetAmount) > tolerance) {
    throw new InvariantError(
      "INVALID_NET_AMOUNT",
      `Net amount must equal (amount - platform_fee). Expected: ${expectedNetAmount}, got: ${netAmount}`,
      400
    )
  }
}

/**
 * INVARIANT: Every payment must reference exactly one shipment
 */
export async function validatePaymentShipmentReference(shipmentId: string): Promise<void> {
  if (!shipmentId) {
    throw new InvariantError(
      "PAYMENT_SHIPMENT_REQUIRED",
      "Payment must reference exactly one shipment",
      400
    )
  }

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select("id")
    .eq("id", shipmentId)
    .single()

  if (error || !shipment) {
    throw new InvariantError("SHIPMENT_NOT_FOUND", "Referenced shipment not found", 404)
  }
}

/**
 * INVARIANT: Payments in escrow must never be double-released
 */
export async function validateNoDoubleEscrowRelease(paymentId: string): Promise<void> {
  const { data: payment, error } = await supabase
    .from("payments")
    .select("escrow_status")
    .eq("id", paymentId)
    .single()

  if (error) throw error
  if (!payment) {
    throw new InvariantError("PAYMENT_NOT_FOUND", "Payment not found", 404)
  }

  if (payment.escrow_status === "released") {
    throw new InvariantError(
      "ESCROW_ALREADY_RELEASED",
      "Payment has already been released from escrow",
      400
    )
  }
}

/**
 * INVARIANT: Completed payments can never be refunded
 */
export async function validateNoRefundAfterCompletion(paymentId: string): Promise<void> {
  const { data: payment, error } = await supabase
    .from("payments")
    .select("status, escrow_status")
    .eq("id", paymentId)
    .single()

  if (error) throw error
  if (!payment) {
    throw new InvariantError("PAYMENT_NOT_FOUND", "Payment not found", 404)
  }

  if (payment.status === "completed" && payment.escrow_status === "released") {
    throw new InvariantError(
      "PAYMENT_CANNOT_REFUND",
      "Completed and released payments can never be refunded",
      400
    )
  }
}

/**
 * INVARIANT: Every payment must have a globally unique reference
 */
export async function validateUniquePaymentReference(
  reference: string,
  excludePaymentId?: string
): Promise<void> {
  const query = supabase
    .from("payments")
    .select("id")
    .eq("reference", reference)

  if (excludePaymentId) {
    query.neq("id", excludePaymentId)
  }

  const { data, error } = await query.limit(1)

  if (error) throw error

  if (data && data.length > 0) {
    throw new InvariantError(
      "PAYMENT_REFERENCE_DUPLICATE",
      "Payment reference must be globally unique",
      409
    )
  }
}

// ============================================
// RATING INVARIANTS
// ============================================

/**
 * INVARIANT: Rating values must always be integers between 1 and 5 inclusive
 */
export function validateRatingValue(rating: number): void {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new InvariantError(
      "INVALID_RATING_VALUE",
      "Rating must be an integer between 1 and 5",
      400
    )
  }
}

/**
 * INVARIANT: A user can only rate another user once per shipment
 */
export async function validateNoDuplicateRatings(
  shipmentId: string,
  raterId: string,
  ratedUserId: string
): Promise<void> {
  const { data, error } = await supabase
    .from("ratings")
    .select("id")
    .eq("shipment_id", shipmentId)
    .eq("rater_id", raterId)
    .eq("rated_user_id", ratedUserId)
    .limit(1)

  if (error) throw error

  if (data && data.length > 0) {
    throw new InvariantError(
      "DUPLICATE_RATING",
      "User has already rated this user for this shipment",
      409
    )
  }
}

/**
 * INVARIANT: Users cannot rate themselves
 */
export function validateNoSelfRating(raterId: string, ratedUserId: string): void {
  if (raterId === ratedUserId) {
    throw new InvariantError(
      "SELF_RATING_FORBIDDEN",
      "Users cannot rate themselves",
      400
    )
  }
}

/**
 * INVARIANT: Every rating must reference a completed shipment
 */
export async function validateRatingShipmentCompleted(shipmentId: string): Promise<void> {
  const { data: shipment, error } = await supabase
    .from("shipments")
    .select("status")
    .eq("id", shipmentId)
    .single()

  if (error) throw error
  if (!shipment) {
    throw new InvariantError("SHIPMENT_NOT_FOUND", "Shipment not found", 404)
  }

  if (shipment.status !== "completed") {
    throw new InvariantError(
      "SHIPMENT_NOT_COMPLETED",
      "Ratings can only be submitted for completed shipments",
      400
    )
  }
}

// ============================================
// DISPUTE INVARIANTS
// ============================================

/**
 * INVARIANT: Every dispute must reference exactly one shipment
 */
export async function validateDisputeShipmentReference(shipmentId: string): Promise<void> {
  if (!shipmentId) {
    throw new InvariantError(
      "DISPUTE_SHIPMENT_REQUIRED",
      "Dispute must reference exactly one shipment",
      400
    )
  }

  const { data: shipment, error } = await supabase
    .from("shipments")
    .select("id")
    .eq("id", shipmentId)
    .single()

  if (error || !shipment) {
    throw new InvariantError("SHIPMENT_NOT_FOUND", "Referenced shipment not found", 404)
  }
}

/**
 * INVARIANT: Disputes cannot be resolved without assignment to support agent
 */
export function validateDisputeAssignment(status: string, assignedTo: string | null): void {
  if (status === "resolved" && !assignedTo) {
    throw new InvariantError(
      "DISPUTE_ASSIGNMENT_REQUIRED",
      "Disputes cannot be resolved without assignment to a support agent",
      400
    )
  }
}

/**
 * INVARIANT: Resolved disputes must have resolution explanation
 */
export function validateDisputeExplanation(status: string, explanation: string | null): void {
  if (status === "resolved" && (!explanation || explanation.trim() === "")) {
    throw new InvariantError(
      "DISPUTE_EXPLANATION_REQUIRED",
      "Resolved disputes must include a resolution explanation",
      400
    )
  }
}

/**
 * INVARIANT: Payment release during dispute must be blocked
 */
export async function validateNoPaymentReleaseOnOpenDispute(
  shipmentId: string
): Promise<void> {
  const { data: dispute, error } = await supabase
    .from("disputes")
    .select("status")
    .eq("shipment_id", shipmentId)
    .in("status", ["open", "under_review"])
    .limit(1)

  if (error) throw error

  if (dispute && dispute.length > 0) {
    throw new InvariantError(
      "DISPUTE_BLOCKS_PAYMENT_RELEASE",
      "Payment cannot be released while dispute is open or under review",
      400
    )
  }
}

// ============================================
// IDEMPOTENCY INVARIANTS
// ============================================

/**
 * INVARIANT: Payment references must be unique (Idempotency key support)
 */
export async function validateIdempotencyKey(key: string): Promise<void> {
  if (!key || key.length < 16 || key.length > 128) {
    throw new InvariantError(
      "INVALID_IDEMPOTENCY_KEY",
      "Idempotency key must be 16-128 characters",
      400
    )
  }
}

/**
 * Check if payment was already processed with same idempotency key
 */
export async function getIdempotentPayment(idempotencyKey: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("idempotency_key", idempotencyKey)
    .single()

  if (error && error.code !== "PGRST116") throw error // PGRST116 = no rows found
  return data
}

// ============================================
// EXPORT BATCH VALIDATOR
// ============================================

export const invariantValidators = {
  // User validators
  validateUniquePhoneNumber,
  validateE164PhoneFormat,
  validateVerificationProgression,

  // Shipment validators
  validateShipmentWeight,
  validateShipmentPrice,
  validatePickupDate,
  validateDeliveryDate,
  validateOriginDestinationDifferent,
  validateUniqueShipmentReference,
  validateShipmentStatusTransition,

  // Match validators
  validateMatchScore,
  validateMatchPrice,
  validateNoDuplicateActiveMatches,
  validateMatchStatusTransition,

  // Payment validators
  validatePaymentAmount,
  validatePlatformFee,
  validateNetAmount,
  validatePaymentShipmentReference,
  validateNoDoubleEscrowRelease,
  validateNoRefundAfterCompletion,
  validateUniquePaymentReference,

  // Rating validators
  validateRatingValue,
  validateNoDuplicateRatings,
  validateNoSelfRating,
  validateRatingShipmentCompleted,

  // Dispute validators
  validateDisputeShipmentReference,
  validateDisputeAssignment,
  validateDisputeExplanation,
  validateNoPaymentReleaseOnOpenDispute,

  // Idempotency validators
  validateIdempotencyKey,
  getIdempotentPayment,
}

export default invariantValidators
