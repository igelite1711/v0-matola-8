import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { invariantValidators, InvariantError } from "@/lib/invariants/supabase-validators"

/**
 * Error response formatter
 */
function createErrorResponse(error: Error, statusCode: number = 400) {
  if (error instanceof InvariantError) {
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
        status: error.statusCode,
      },
      { status: error.statusCode }
    )
  }

  return NextResponse.json(
    {
      error: "INTERNAL_SERVER_ERROR",
      message: error.message,
      status: 500,
    },
    { status: 500 }
  )
}

/**
 * Middleware to log invariant violations
 */
export async function logInvariantViolation(
  tableName: string,
  operation: string,
  recordId: string,
  userId: string | null,
  violationMessage: string
) {
  try {
    await supabase.from("audit_logs").insert({
      table_name: tableName,
      operation,
      record_id: recordId,
      user_id: userId,
      invariant_violation: true,
      violation_message: violationMessage,
    })
  } catch (error) {
    console.error("Failed to log invariant violation:", error)
  }
}

/**
 * Validate shipment creation
 */
export async function validateShipmentCreation(
  data: any,
  userId: string
): Promise<any> {
  // Validate basic fields
  invariantValidators.validateShipmentWeight(data.weight_kg)
  invariantValidators.validateShipmentPrice(data.price_mwk)
  invariantValidators.validatePickupDate(new Date(data.pickup_date))
  invariantValidators.validateDeliveryDate(
    new Date(data.pickup_date),
    new Date(data.delivery_date)
  )
  invariantValidators.validateOriginDestinationDifferent(
    data.pickup_location,
    data.delivery_location
  )

  // Check unique reference
  if (data.reference_number) {
    await invariantValidators.validateUniqueShipmentReference(data.reference_number)
  }

  return data
}

/**
 * Validate shipment update
 */
export async function validateShipmentUpdate(
  shipmentId: string,
  currentStatus: string,
  newStatus: string,
  updateData: any
): Promise<any> {
  // Validate status transition
  invariantValidators.validateShipmentStatusTransition(currentStatus, newStatus)

  // If updating prices/weight, re-validate
  if (updateData.weight_kg !== undefined) {
    invariantValidators.validateShipmentWeight(updateData.weight_kg)
  }

  if (updateData.price_mwk !== undefined) {
    invariantValidators.validateShipmentPrice(updateData.price_mwk)
  }

  return updateData
}

/**
 * Validate payment creation
 */
export async function validatePaymentCreation(data: any, userId: string): Promise<any> {
  // Validate amounts
  invariantValidators.validatePaymentAmount(data.amount_mwk)
  invariantValidators.validatePlatformFee(data.amount_mwk, data.platform_fee_mwk)
  invariantValidators.validateNetAmount(
    data.amount_mwk,
    data.platform_fee_mwk,
    data.net_amount_mwk
  )

  // Validate shipment reference
  await invariantValidators.validatePaymentShipmentReference(data.shipment_id)

  // Validate unique reference
  if (data.reference) {
    await invariantValidators.validateUniquePaymentReference(data.reference)
  }

  // Check idempotency if key provided
  if (data.idempotency_key) {
    await invariantValidators.validateIdempotencyKey(data.idempotency_key)

    // Check for existing payment with same key
    const existing = await invariantValidators.getIdempotentPayment(data.idempotency_key)
    if (existing) {
      return existing // Return existing payment instead of creating new one
    }
  }

  return data
}

/**
 * Validate match creation
 */
export async function validateMatchCreation(data: any): Promise<any> {
  // Validate score
  invariantValidators.validateMatchScore(data.score)

  // Validate price if provided
  if (data.final_price_mwk) {
    await invariantValidators.validateMatchPrice(data.shipment_id, data.final_price_mwk)
  }

  // Check for duplicate active matches
  await invariantValidators.validateNoDuplicateActiveMatches(
    data.shipment_id,
    data.transporter_id
  )

  return data
}

/**
 * Validate match acceptance
 */
export async function validateMatchAcceptance(matchId: string, currentStatus: string): Promise<void> {
  invariantValidators.validateMatchStatusTransition(currentStatus, "accepted")
}

/**
 * Validate rating creation
 */
export async function validateRatingCreation(data: any): Promise<any> {
  // Validate rating value
  invariantValidators.validateRatingValue(data.rating)

  // Check users are different
  invariantValidators.validateNoSelfRating(data.rater_id, data.rated_user_id)

  // Check shipment is completed
  await invariantValidators.validateRatingShipmentCompleted(data.shipment_id)

  // Check for duplicate ratings
  await invariantValidators.validateNoDuplicateRatings(
    data.shipment_id,
    data.rater_id,
    data.rated_user_id
  )

  return data
}

/**
 * Validate dispute creation
 */
export async function validateDisputeCreation(data: any): Promise<any> {
  // Validate shipment reference
  await invariantValidators.validateDisputeShipmentReference(data.shipment_id)

  return data
}

/**
 * Validate dispute resolution
 */
export async function validateDisputeResolution(
  status: string,
  assignedTo: string | null,
  resolution: string | null
): Promise<void> {
  invariantValidators.validateDisputeAssignment(status, assignedTo)
  invariantValidators.validateDisputeExplanation(status, resolution)
}

/**
 * Validate user registration
 */
export async function validateUserRegistration(data: any): Promise<any> {
  // Validate phone format
  invariantValidators.validateE164PhoneFormat(data.phone)

  // Check unique phone
  await invariantValidators.validateUniquePhoneNumber(data.phone)

  return data
}

/**
 * Validate user verification update
 */
export async function validateUserVerificationUpdate(
  userId: string,
  newLevel: string
): Promise<void> {
  await invariantValidators.validateVerificationProgression(userId, newLevel)
}

/**
 * Validate payment release
 */
export async function validatePaymentRelease(paymentId: string, shipmentId: string): Promise<void> {
  // Check no double release
  await invariantValidators.validateNoDoubleEscrowRelease(paymentId)

  // Check no open disputes
  await invariantValidators.validateNoPaymentReleaseOnOpenDispute(shipmentId)

  // Check payment is not already completed and released
  await invariantValidators.validateNoRefundAfterCompletion(paymentId)
}

/**
 * Generic invariant validation wrapper for API endpoints
 */
export async function withInvariantValidation<T>(
  validationFn: () => Promise<T>,
  errorContext?: { table: string; operation: string; recordId: string }
): Promise<T> {
  try {
    return await validationFn()
  } catch (error) {
    if (error instanceof InvariantError && errorContext) {
      // Log the violation
      const userId = "system" // In real usage, get from auth context
      await logInvariantViolation(
        errorContext.table,
        errorContext.operation,
        errorContext.recordId,
        userId,
        error.message
      )
    }
    throw error
  }
}

/**
 * Express-style middleware for Next.js API routes
 */
export function invariantErrorHandler(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      console.error("API Error:", error)
      return createErrorResponse(error as Error)
    }
  }
}

export default {
  validateShipmentCreation,
  validateShipmentUpdate,
  validatePaymentCreation,
  validateMatchCreation,
  validateMatchAcceptance,
  validateRatingCreation,
  validateDisputeCreation,
  validateDisputeResolution,
  validateUserRegistration,
  validateUserVerificationUpdate,
  validatePaymentRelease,
  withInvariantValidation,
  invariantErrorHandler,
  logInvariantViolation,
}
