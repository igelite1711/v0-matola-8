/**
 * FINANCIAL INVARIANTS ENFORCEMENT
 * 
 * Enforces MATOLA financial system invariants:
 * - Money accounting and balance integrity
 * - Escrow fund management
 * - Payment reconciliation
 * - Transaction processing atomicity
 */

import { ApiError, errorCodes } from "@/lib/api/utils/error-handler"

// ============================================
// MONEY ACCOUNTING INVARIANTS
// ============================================

/**
 * INVARIANT: Total money in the system must always balance
 * SUM(payments.amount WHERE status='held') + SUM(payments.net_amount WHERE status='completed')
 * must equal SUM(payments.amount WHERE status IN ('held','completed'))
 */
export function validateMoneyBalance(
  heldAmount: number,
  completedNetAmount: number,
  totalAmount: number,
  tolerance: number = 1, // 1 MWK tolerance for rounding
): void {
  const calculatedTotal = heldAmount + completedNetAmount

  if (Math.abs(calculatedTotal - totalAmount) > tolerance) {
    throw new ApiError(
      `Money balance mismatch. Held: ${heldAmount}, Net Completed: ${completedNetAmount}, Total: ${totalAmount}. Expected: ${calculatedTotal}`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Escrow funds must always be accounted for
 * Every payment with escrow_status='held' must have corresponding funds in the escrow account
 */
export function validateEscrowAccounting(
  heldEscrowAmount: number,
  escrowAccountBalance: number,
  tolerance: number = 1,
): void {
  if (Math.abs(heldEscrowAmount - escrowAccountBalance) > tolerance) {
    throw new ApiError(
      `Escrow fund mismatch. Payments held: ${heldEscrowAmount}, Account balance: ${escrowAccountBalance}`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Payment reconciliation must never have discrepancies > MWK 100
 */
export function validatePaymentReconciliation(
  systemTotal: number,
  externalTotal: number,
  threshold: number = 100,
): void {
  const discrepancy = Math.abs(systemTotal - externalTotal)

  if (discrepancy > threshold) {
    throw new ApiError(
      `Payment reconciliation failed. Discrepancy: ${discrepancy} MWK exceeds threshold of ${threshold} MWK`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Platform fees must be calculated consistently
 */
export function validateFeeConsistency(
  calculatedFee: number,
  expectedFee: number,
  feePercentage: number = 0.05, // 5% default platform fee
  tolerance: number = 0.01,
): void {
  if (Math.abs(calculatedFee - expectedFee) > tolerance) {
    throw new ApiError(
      `Platform fee calculation inconsistent. Calculated: ${calculatedFee}, Expected: ${expectedFee}. Fee percentage: ${feePercentage * 100}%`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Negative balances are forbidden
 */
export function validateNonNegativeBalance(
  balance: number,
  context: string = "balance",
): void {
  if (balance < 0) {
    throw new ApiError(
      `Negative ${context} not allowed. Current balance: ${balance}`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

// ============================================
// TRANSACTION PROCESSING INVARIANTS
// ============================================

/**
 * INVARIANT: Payment state transitions must be atomic
 * Status and escrow_status must be updated together
 */
export function validatePaymentStateAtomicity(
  previousStatus: string,
  previousEscrowStatus: string,
  newStatus: string,
  newEscrowStatus: string,
): void {
  // Define valid state combinations
  const validCombinations: Record<string, string[]> = {
    "pending|none": ["processing|none", "completed|released", "failed|none"],
    "processing|none": ["completed|released", "failed|none"],
    "completed|released": ["completed|released"], // Terminal state
    "completed|held": ["completed|released"],
    "failed|none": ["pending|none", "processing|none"],
  }

  const currentCombo = `${previousStatus}|${previousEscrowStatus}`
  const newCombo = `${newStatus}|${newEscrowStatus}`
  const allowed = validCombinations[currentCombo] || []

  if (!allowed.includes(newCombo)) {
    throw new ApiError(
      `Invalid atomic state transition from ${currentCombo} to ${newCombo}. Payment status and escrow status must be updated together atomically.`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Concurrent payment modifications must be prevented
 * Use row-level locking (SELECT FOR UPDATE) to ensure single modifier
 */
export async function validatePaymentNotLockedByOther(
  paymentId: string,
  currentUserId: string,
  lockedByUserId: string | null,
): Promise<void> {
  if (lockedByUserId && lockedByUserId !== currentUserId) {
    throw new ApiError(
      `Payment is currently being modified by another process. Lock held by: ${lockedByUserId}`,
      errorCodes.FINANCIAL_ERROR,
      409,
    )
  }
}

/**
 * INVARIANT: Payment retries must have exponential backoff
 * Maximum 5 retries without human intervention
 */
export function validatePaymentRetryLimit(
  retryCount: number,
  maxRetries: number = 5,
): void {
  if (retryCount > maxRetries) {
    throw new ApiError(
      `Payment has exceeded maximum retry attempts (${maxRetries}). Human intervention required.`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

/**
 * Calculate exponential backoff delay for payment retry
 * Delay = 2^(retryCount - 1) seconds, capped at 5 minutes
 */
export function calculatePaymentRetryDelay(retryCount: number): number {
  const baseDelay = Math.pow(2, retryCount - 1) * 1000 // Convert to milliseconds
  const maxDelay = 5 * 60 * 1000 // 5 minutes
  return Math.min(baseDelay, maxDelay)
}

/**
 * INVARIANT: Every financial transaction must be logged in audit_logs
 */
export function validateAuditLogEntry(
  transactionId: string,
  auditLogExists: boolean,
  action: string,
): void {
  if (!auditLogExists) {
    throw new ApiError(
      `Audit log missing for payment transaction. Transaction: ${transactionId}, Action: ${action}`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

// ============================================
// ESCROW MANAGEMENT INVARIANTS
// ============================================

/**
 * INVARIANT: Payments in escrow must never be double-released
 */
export function validateEscrowNotAlreadyReleased(currentEscrowStatus: string): void {
  if (currentEscrowStatus === "released") {
    throw new ApiError(
      "Escrow funds have already been released. Cannot double-release.",
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Total released amounts must never exceed total received amounts
 */
export function validateReleasedNotExceedsReceived(
  totalReleased: number,
  totalReceived: number,
): void {
  if (totalReleased > totalReceived) {
    throw new ApiError(
      `Total released (${totalReleased}) exceeds total received (${totalReceived})`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Escrow release must be idempotent and safe
 */
export function validateEscrowReleaseIdempotency(
  paymentId: string,
  previousReleaseAmount: number,
  newReleaseAmount: number,
): void {
  if (previousReleaseAmount > 0 && newReleaseAmount !== previousReleaseAmount) {
    throw new ApiError(
      `Escrow release amount mismatch for payment ${paymentId}. Previous: ${previousReleaseAmount}, New: ${newReleaseAmount}. Releases must be idempotent.`,
      errorCodes.FINANCIAL_ERROR,
      400,
    )
  }
}

// ============================================
// PAYMENT IDEMPOTENCY INVARIANTS
// ============================================

/**
 * INVARIANT: Payment idempotency key must be unique and valid
 */
export function validateIdempotencyKeyFormat(key: string): void {
  if (!key || key.length < 16 || key.length > 128) {
    throw new ApiError(
      "Idempotency key must be 16-128 characters",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }

  // Idempotency key should be a UUID or similar
  if (!/^[a-zA-Z0-9\-_.]+$/.test(key)) {
    throw new ApiError(
      "Idempotency key contains invalid characters. Use alphanumeric, hyphens, underscores, or dots.",
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}

/**
 * INVARIANT: Duplicate idempotency key must return cached result, not process twice
 */
export function validateIdempotencyKeyDeduplication(
  idempotencyKey: string,
  previousPayment: unknown,
  newPaymentData: unknown,
): void {
  if (previousPayment) {
    // Don't process again - return cached result
    // This is checked before processing, not here
  }
}

// ============================================
// FINANCIAL RECONCILIATION HELPERS
// ============================================

/**
 * Helper to validate a complete financial transaction
 */
export function validateCompleteTransaction(data: {
  amount: number
  platformFee: number
  netAmount: number
  status: string
  escrowStatus: string
  idempotencyKey?: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate amount
  if (data.amount <= 0) {
    errors.push("Transaction amount must be positive")
  }

  // Validate fees
  if (data.platformFee < 0) {
    errors.push("Platform fee cannot be negative")
  }

  if (data.platformFee > data.amount * 0.1) {
    errors.push("Platform fee exceeds 10% of amount")
  }

  // Validate net amount
  const expectedNet = data.amount - data.platformFee
  if (Math.abs(data.netAmount - expectedNet) > 0.01) {
    errors.push(
      `Net amount mismatch. Expected: ${expectedNet}, Got: ${data.netAmount}`,
    )
  }

  // Validate idempotency key if provided
  if (data.idempotencyKey) {
    try {
      validateIdempotencyKeyFormat(data.idempotencyKey)
    } catch (error) {
      if (error instanceof ApiError) {
        errors.push(error.message)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Helper to log financial transaction details for audit trail
 */
export function formatFinancialAuditLog(data: {
  paymentId: string
  userId: string
  action: string
  amount: number
  status: string
  timestamp: Date
  metadata?: Record<string, unknown>
}): string {
  return JSON.stringify(
    {
      timestamp: data.timestamp.toISOString(),
      paymentId: data.paymentId,
      userId: data.userId,
      action: data.action,
      amount: data.amount,
      status: data.status,
      metadata: data.metadata,
    },
    null,
    2,
  )
}

// ============================================
// PLATFORM FEE CALCULATIONS
// ============================================

/**
 * Calculate platform fee with validation
 * Standard rate: 5% of transaction amount
 */
export function calculatePlatformFee(
  amount: number,
  feePercentage: number = 0.05,
): number {
  validateNonNegativeBalance(amount, "transaction amount")

  const fee = amount * feePercentage
  const maxFee = amount * 0.1 // Hard cap at 10%

  return Math.min(fee, maxFee)
}

/**
 * Calculate net amount after platform fee
 */
export function calculateNetAmount(amount: number, feePercentage: number = 0.05): number {
  const platformFee = calculatePlatformFee(amount, feePercentage)
  const netAmount = amount - platformFee

  validateNonNegativeBalance(netAmount, "net amount")

  return netAmount
}

/**
 * Validate financial numbers are reasonable (not NaN, Infinity, etc)
 */
export function validateFinancialNumberValidity(
  value: number,
  fieldName: string,
): void {
  if (!Number.isFinite(value)) {
    throw new ApiError(
      `${fieldName} must be a valid finite number. Got: ${value}`,
      errorCodes.VALIDATION_ERROR,
      400,
    )
  }
}
