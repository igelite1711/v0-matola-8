/**
 * INVARIANT INTEGRATION LAYER
 * 
 * Connects invariant validators to API route handlers and database operations
 * Provides middleware and hooks for enforcing invariants throughout the application
 */

import { NextRequest, NextResponse } from "next/server"
import * as integrity from "./data-integrity"
import * as financial from "./financial"
import * as sessionInvariants from "./session"
import * as security from "./security"
import { ApiError, errorCodes } from "@/lib/api/utils/error-handler"

// ============================================
// SHIPMENT OPERATIONS
// ============================================

export async function validateShipmentCreation(data: {
  userId: string
  weight: number
  quotedPrice: number
  pickupDate: Date
  deliveryDate: Date
  pickupLocation: string
  deliveryLocation: string
  cargoType: string
  description: string
}) {
  // Data integrity checks
  const shipmentValidation = integrity.validateShipmentCreation({
    weight: data.weight,
    quotedPrice: data.quotedPrice,
    pickupDate: data.pickupDate,
    deliveryDate: data.deliveryDate,
    pickupLocation: data.pickupLocation,
    deliveryLocation: data.deliveryLocation,
  })

  if (!shipmentValidation.valid) {
    throw new ApiError(
      shipmentValidation.errors.join("; "),
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }

  // Security checks - ensure user can create shipments
  // (role-based, verified status checks would go here)

  return { valid: true }
}

export async function validateShipmentStatusUpdate(
  shipmentId: string,
  currentStatus: string,
  newStatus: string,
  userId: string,
) {
  // Integrity check - valid state transition
  integrity.validateShipmentStatusTransitionEnhanced(currentStatus, newStatus)

  // Security check - only owner or authorized user can update
  // (resource ownership would be checked here against database)

  return { valid: true }
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

export async function validatePaymentCreation(data: {
  userId: string
  shipmentId: string
  amount: number
  platformFee?: number
  idempotencyKey?: string
}) {
  // Validate idempotency key
  if (data.idempotencyKey) {
    security.validateIdempotencyKeyFormat(data.idempotencyKey)
  }

  // Calculate platform fee if not provided
  const platformFee = data.platformFee ?? financial.calculatePlatformFee(data.amount)
  const netAmount = financial.calculateNetAmount(data.amount)

  // Financial validation
  const paymentValidation = financial.validateCompleteTransaction({
    amount: data.amount,
    platformFee,
    netAmount,
    status: "pending",
    escrowStatus: "none",
    idempotencyKey: data.idempotencyKey,
  })

  if (!paymentValidation.valid) {
    throw new ApiError(
      paymentValidation.errors.join("; "),
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }

  // Data integrity checks
  integrity.validatePaymentAmount(data.amount)
  integrity.validatePlatformFee(data.amount, platformFee)
  integrity.validateNetAmount(data.amount, platformFee, netAmount)

  return { valid: true, platformFee, netAmount }
}

export async function validatePaymentStatusUpdate(
  paymentId: string,
  currentStatus: string,
  currentEscrowStatus: string,
  newStatus: string,
  newEscrowStatus: string,
) {
  // Integrity checks
  integrity.validatePaymentStatusTransition(
    currentStatus,
    currentEscrowStatus,
    newStatus,
    newEscrowStatus,
  )

  // Financial checks
  financial.validatePaymentStatusAtomicity(
    currentStatus,
    currentEscrowStatus,
    newStatus,
    newEscrowStatus,
  )

  return { valid: true }
}

// ============================================
// MATCH OPERATIONS
// ============================================

export async function validateMatchCreation(data: {
  shipmentId: string
  transporterId: string
  matchScore: number
  finalPrice: number
  shipmentOriginalPrice: number
}) {
  // Score validation
  integrity.validateMatchScore(data.matchScore)

  // Price validation
  integrity.validateMatchPrice(data.finalPrice, data.shipmentOriginalPrice)

  return { valid: true }
}

export async function validateMatchStatusUpdate(
  matchId: string,
  currentStatus: string,
  newStatus: string,
) {
  // State machine validation
  integrity.validateMatchStatusTransitionEnhanced(currentStatus, newStatus)

  return { valid: true }
}

// ============================================
// RATING OPERATIONS
// ============================================

export async function validateRatingCreation(data: {
  ratedById: string
  ratedUserId: string
  shipmentId: string
  overallRating: number
  shipmentStatus: string
}) {
  // Check self-rating
  integrity.validateNotSelfRating(data.ratedById, data.ratedUserId)

  // Check rating value
  integrity.validateRatingValue(data.overallRating)

  // Check shipment completed
  integrity.validateRatingEligibility(data.shipmentStatus)

  return { valid: true }
}

// ============================================
// USSD SESSION OPERATIONS
// ============================================

export async function validateUSSDSessionCreation(data: {
  phoneNumber: string
  state: string
  context?: string
}) {
  // Phone validation
  const phoneCheck = security.validateE164PhoneNumber(data.phoneNumber)
  if (!phoneCheck.valid) {
    throw new ApiError(phoneCheck.error!, errorCodes.VALIDATION_ERROR, 400)
  }

  // State validation
  const stateCheck = sessionInvariants.validateUSSDState(data.state)
  if (!stateCheck.valid) {
    throw new ApiError(stateCheck.error, errorCodes.VALIDATION_ERROR, 400)
  }

  // Context validation
  if (data.context) {
    const contextCheck = sessionInvariants.validateUSSDSessionContext(data.context)
    if (!contextCheck.valid) {
      throw new ApiError(contextCheck.error, errorCodes.VALIDATION_ERROR, 400)
    }
  }

  return { valid: true }
}

export async function validateUSSDResponse(response: string) {
  // Format validation
  const formatCheck = sessionInvariants.validateUSSDResponseFormat(response)
  if (!formatCheck.valid) {
    throw new ApiError(formatCheck.error, errorCodes.VALIDATION_ERROR, 400)
  }

  // Length validation
  const lengthCheck = sessionInvariants.validateUSSDResponseLength(response)
  if (!lengthCheck.valid) {
    throw new ApiError(lengthCheck.error, errorCodes.VALIDATION_ERROR, 400)
  }

  return { valid: true }
}

// ============================================
// USER OPERATIONS
// ============================================

export async function validateUserCreation(data: {
  phone: string
  role: string
  name: string
  password: string
}) {
  // Phone validation
  const phoneCheck = security.validateE164PhoneNumber(data.phone)
  if (!phoneCheck.valid) {
    throw new ApiError(phoneCheck.error!, errorCodes.VALIDATION_ERROR, 400)
  }

  // Role validation
  const roleCheck = integrity.validateUserRole(data.role)
  if (!roleCheck.valid) {
    throw new ApiError(roleCheck.error!, errorCodes.VALIDATION_ERROR, 400)
  }

  // Input sanitization
  const { sanitized: sanitizedName, valid: nameValid } = security.sanitizeInput(
    data.name,
    100,
  )
  if (!nameValid) {
    throw new ApiError(
      "Invalid name provided",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }

  return { valid: true, sanitizedName }
}

// ============================================
// MIDDLEWARE FACTORIES
// ============================================

/**
 * Create middleware for invariant enforcement at API level
 */
export function createInvariantEnforcementMiddleware(
  invariantValidators: Array<(req: NextRequest) => Promise<{ valid: boolean; error?: string }>>,
) {
  return async (request: NextRequest) => {
    for (const validator of invariantValidators) {
      const result = await validator(request)
      if (!result.valid) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 },
        )
      }
    }

    return NextResponse.next()
  }
}

/**
 * Create middleware to ensure resource ownership for protected endpoints
 */
export function createResourceOwnershipMiddleware(
  requestingUserId: string,
  resourceOwnerId: string,
  resourceType: string,
  resourceId: string,
) {
  const check = security.validateResourceOwnership(
    resourceOwnerId,
    requestingUserId,
    resourceType,
    resourceId,
  )

  if (!check.authorized) {
    throw new ApiError(check.error!, errorCodes.UNAUTHORIZED, 403)
  }

  return { authorized: true }
}

/**
 * Create middleware to enforce admin-only endpoints
 */
export function createAdminOnlyMiddleware(userRole: string) {
  const check = security.validateAdminAccess(userRole)

  if (!check.valid) {
    throw new ApiError(check.error, errorCodes.UNAUTHORIZED, 403)
  }

  return { authorized: true }
}

// ============================================
// TRANSACTION WRAPPERS
// ============================================

/**
 * Wrap database operation with invariant enforcement
 */
export async function executeInvariantAwareOperation<T>(
  operation: () => Promise<T>,
  invariantValidators: Array<() => Promise<{ valid: boolean; error?: string }>>,
): Promise<T> {
  // Run all validators first
  for (const validator of invariantValidators) {
    const result = await validator()
    if (!result.valid) {
      throw new ApiError(
        result.error || "Invariant violation",
        errorCodes.INVARIANT_VIOLATION,
        400,
      )
    }
  }

  // Execute operation if all invariants pass
  return await operation()
}

// ============================================
// VALIDATION COMPOSITION
// ============================================

/**
 * Compose multiple validators into single validation pipeline
 */
export function composeValidators(
  ...validators: Array<() => { valid: boolean; error?: string }>
): () => { valid: boolean; errors: string[] } {
  return () => {
    const errors: string[] = []

    for (const validator of validators) {
      const result = validator()
      if (!result.valid && result.error) {
        errors.push(result.error)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Wrap API handler with comprehensive invariant enforcement
 */
export function withInvariantEnforcement<T extends (...args: unknown[]) => Promise<NextResponse>>(
  handler: T,
): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
          },
          { status: error.statusCode },
        )
      }

      // Log unexpected errors
      console.error("[Invariant Enforcement Error]", error)

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      )
    }
  }) as T
}

// ============================================
// RECOVERY & REPAIR
// ============================================

/**
 * Detect invariant violations in existing data
 */
export async function detectInvariantViolations(
  scanType: "full" | "users" | "shipments" | "payments" | "sessions",
): Promise<Array<{ entityId: string; invariant: string; violation: string }>> {
  const violations: Array<{
    entityId: string
    invariant: string
    violation: string
  }> = []

  // This would scan actual database records and log violations
  // Implementation depends on database queries

  return violations
}

/**
 * Log invariant violation for auditing
 */
export async function logInvariantViolation(
  invariantName: string,
  entityId: string,
  entityType: string,
  severity: "critical" | "high" | "medium" | "low",
  context: Record<string, unknown>,
) {
  const violationLog = {
    timestamp: new Date(),
    invariantName,
    entityId,
    entityType,
    severity,
    context,
  }

  console.error("[INVARIANT VIOLATION]", violationLog)

  // Send to monitoring service
  // await monitoringService.captureException(violationLog)
}
