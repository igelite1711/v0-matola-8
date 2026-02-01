/**
 * SESSION & STATE INVARIANTS ENFORCEMENT
 * 
 * Enforces MATOLA session and state management invariants:
 * - USSD session lifecycle
 * - JWT token lifecycle
 * - State machine integrity
 * - Session expiration
 */

import { ApiError, errorCodes } from "@/lib/api/utils/error-handler"

// ============================================
// USSD SESSION INVARIANTS
// ============================================

/**
 * INVARIANT: USSD sessions must expire after 5 minutes (300 seconds) of inactivity
 */
export function validateUSSDSessionExpiry(
  createdAt: Date,
  lastActivity: Date,
  maxInactivityMs: number = 5 * 60 * 1000, // 5 minutes
): { valid: boolean; error?: string } {
  const now = new Date()
  const inactivityDuration = now.getTime() - lastActivity.getTime()

  if (inactivityDuration > maxInactivityMs) {
    return {
      valid: false,
      error: `USSD session expired due to inactivity. Last activity: ${lastActivity.toISOString()}`,
    }
  }

  return { valid: true }
}

/**
 * INVARIANT: USSD session state must always be valid
 */
export const validUSSDStates = [
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
] as const

export type USSDState = (typeof validUSSDStates)[number]

export function validateUSSDState(state: string): { valid: boolean; error?: string } {
  if (!validUSSDStates.includes(state as USSDState)) {
    return {
      valid: false,
      error: `Invalid USSD state: ${state}. Valid states: ${validUSSDStates.join(", ")}`,
    }
  }
  return { valid: true }
}

/**
 * INVARIANT: Session context must be valid JSON
 */
export function validateUSSDSessionContext(context: string | null): {
  valid: boolean
  error?: string
  parsed?: Record<string, unknown>
} {
  if (!context) {
    return { valid: true, parsed: {} }
  }

  try {
    const parsed = JSON.parse(context)
    if (typeof parsed !== "object" || parsed === null) {
      return {
        valid: false,
        error: "Session context must be a valid JSON object",
      }
    }
    return { valid: true, parsed }
  } catch (error) {
    return {
      valid: false,
      error: `Session context must be valid JSON. Parse error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * INVARIANT: USSD responses must start with "CON" or "END"
 */
export function validateUSSDResponseFormat(response: string): {
  valid: boolean
  error?: string
} {
  if (!response.startsWith("CON ") && !response.startsWith("END ")) {
    return {
      valid: false,
      error: 'USSD response must start with "CON" (continue) or "END" (end)',
    }
  }
  return { valid: true }
}

/**
 * INVARIANT: USSD responses must never exceed 160 characters
 */
export function validateUSSDResponseLength(response: string): {
  valid: boolean
  error?: string
} {
  if (response.length > 160) {
    return {
      valid: false,
      error: `USSD response cannot exceed 160 characters. Got ${response.length} characters.`,
    }
  }
  return { valid: true }
}

/**
 * INVARIANT: USSD sessions must be idempotent
 * Receiving the same input twice must produce the same result
 */
export function validateUSSDIdempotency(
  previousInput: string,
  currentInput: string,
  previousOutput: string,
  currentOutput: string,
): { valid: boolean; error?: string } {
  if (previousInput === currentInput && previousOutput !== currentOutput) {
    return {
      valid: false,
      error: "USSD session not idempotent. Same input must produce same output.",
    }
  }
  return { valid: true }
}

/**
 * INVARIANT: USSD handlers must never throw unhandled exceptions
 * Always return valid USSD response format
 */
export function validateUSSDErrorHandling(error: unknown): string {
  let message = "An error occurred. Please try again."

  if (error instanceof Error) {
    // Don't expose technical details to user
    console.error("[USSD Error]", error.message)
  } else {
    console.error("[USSD Error]", error)
  }

  // Always return valid USSD response format
  return `END ${message}`
}

// ============================================
// JWT TOKEN INVARIANTS
// ============================================

/**
 * INVARIANT: JWT tokens must expire after 24 hours
 */
export function validateJWTExpiry(
  issuedAt: Date,
  expiresAt: Date,
  maxDurationMs: number = 24 * 60 * 60 * 1000, // 24 hours
): { valid: boolean; error?: string } {
  const duration = expiresAt.getTime() - issuedAt.getTime()

  if (duration > maxDurationMs) {
    return {
      valid: false,
      error: `JWT token validity period exceeds 24 hours. Duration: ${duration / 1000 / 60 / 60} hours`,
    }
  }

  return { valid: true }
}

/**
 * INVARIANT: Expired tokens must never be accepted
 */
export function validateJWTNotExpired(expiresAt: Date): {
  valid: boolean
  error?: string
} {
  const now = new Date()

  if (now > expiresAt) {
    return {
      valid: false,
      error: `JWT token has expired. Expired at: ${expiresAt.toISOString()}`,
    }
  }

  return { valid: true }
}

/**
 * INVARIANT: Session invalidation must be immediate
 * When a user logs out, their token must be blacklisted immediately
 */
export async function validateTokenNotBlacklisted(
  token: string,
  tokenBlacklist: Set<string> | Map<string, Date>,
): Promise<{ valid: boolean; error?: string }> {
  const isBlacklisted =
    tokenBlacklist instanceof Set
      ? tokenBlacklist.has(token)
      : tokenBlacklist.has(token)

  if (isBlacklisted) {
    return {
      valid: false,
      error: "Token has been blacklisted (session invalidated)",
    }
  }

  return { valid: true }
}

// ============================================
// STATE MACHINE INVARIANTS
// ============================================

/**
 * INVARIANT: Shipment status transitions must be logged
 * Every status change must have corresponding audit trail entry
 */
export interface StateTransitionLog {
  entityId: string
  entityType: "shipment" | "match" | "payment" | "dispute"
  previousState: string
  newState: string
  changedBy: string
  reason?: string
  timestamp: Date
}

export function validateStateTransitionLog(
  log: StateTransitionLog,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!log.entityId) errors.push("Entity ID is required")
  if (!log.entityType) errors.push("Entity type is required")
  if (!log.previousState) errors.push("Previous state is required")
  if (!log.newState) errors.push("New state is required")
  if (!log.changedBy) errors.push("Changed by user ID is required")
  if (!log.timestamp) errors.push("Timestamp is required")

  // Ensure timestamp is reasonable (not in future, not too far in past)
  if (log.timestamp) {
    const now = new Date()
    const diff = Math.abs(now.getTime() - log.timestamp.getTime())
    const maxDiff = 60 * 60 * 1000 // 1 hour tolerance

    if (diff > maxDiff) {
      errors.push("Timestamp is not reasonable (too far from current time)")
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * INVARIANT: Invalid state transitions must be rejected
 */
export function validateStateTransitionValidity(
  previousState: string,
  newState: string,
  allowedTransitions: Record<string, string[]>,
): { valid: boolean; error?: string } {
  const allowed = allowedTransitions[previousState] || []

  if (!allowed.includes(newState)) {
    return {
      valid: false,
      error: `Invalid state transition from ${previousState} to ${newState}. Allowed: ${allowed.join(", ")}`,
    }
  }

  return { valid: true }
}

// ============================================
// CONCURRENCY & LOCKING INVARIANTS
// ============================================

/**
 * INVARIANT: Session state transitions must be transactional
 * Prevent partial state updates
 */
export interface SessionLock {
  sessionId: string
  lockedAt: Date
  expiresAt: Date
  lockedBy: string
}

export function validateSessionLockValidity(lock: SessionLock): {
  valid: boolean
  error?: string
} {
  const now = new Date()

  if (now > lock.expiresAt) {
    return {
      valid: false,
      error: `Session lock has expired. Lock held until: ${lock.expiresAt.toISOString()}`,
    }
  }

  return { valid: true }
}

/**
 * Helper to acquire session lock with timeout
 */
export function createSessionLock(
  sessionId: string,
  userId: string,
  lockDurationMs: number = 30 * 1000, // 30 seconds default
): SessionLock {
  const now = new Date()
  return {
    sessionId,
    lockedAt: now,
    expiresAt: new Date(now.getTime() + lockDurationMs),
    lockedBy: userId,
  }
}

// ============================================
// SESSION LIFECYCLE HELPERS
// ============================================

/**
 * Calculate session remaining validity duration
 */
export function getSessionRemainingDuration(
  createdAt: Date,
  expiresAt: Date,
): { remainingMs: number; remainingSeconds: number; isExpired: boolean } {
  const now = new Date()
  const remainingMs = expiresAt.getTime() - now.getTime()

  return {
    remainingMs,
    remainingSeconds: Math.floor(remainingMs / 1000),
    isExpired: remainingMs <= 0,
  }
}

/**
 * Determine if session should be automatically refreshed
 * Refresh if less than 25% time remaining
 */
export function shouldRefreshSession(expiresAt: Date, createdAt: Date): boolean {
  const totalDuration = expiresAt.getTime() - createdAt.getTime()
  const remaining = getSessionRemainingDuration(createdAt, expiresAt)

  const refreshThreshold = totalDuration * 0.25 // Refresh at 25% remaining
  return remaining.remainingMs <= refreshThreshold
}

/**
 * Cleanup expired sessions safely
 * Verify expiration before deletion
 */
export async function validateSessionCleanupEligibility(
  session: {
    expiresAt: Date
    deletedAt?: Date
  },
): Promise<{ eligible: boolean; error?: string }> {
  const now = new Date()

  if (session.deletedAt) {
    return { eligible: false, error: "Session already deleted" }
  }

  if (now <= session.expiresAt) {
    return { eligible: false, error: "Session not yet expired" }
  }

  return { eligible: true }
}

// ============================================
// MULTI-STATE VALIDATION HELPERS
// ============================================

/**
 * Helper to validate complex state machine flow
 */
export interface StateMachineConfig {
  states: string[]
  initialState: string
  terminalStates: string[]
  transitions: Record<string, string[]>
}

export function validateStateMachineDefinition(
  config: StateMachineConfig,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.states || config.states.length === 0) {
    errors.push("State machine must define at least one state")
  }

  if (!config.initialState) {
    errors.push("State machine must define an initial state")
  }

  if (!config.initialState || !config.states.includes(config.initialState)) {
    errors.push("Initial state must be defined in states list")
  }

  if (!config.terminalStates || config.terminalStates.length === 0) {
    errors.push("State machine must define at least one terminal state")
  }

  // Verify all transitions reference valid states
  for (const [fromState, toStates] of Object.entries(config.transitions)) {
    if (!config.states.includes(fromState)) {
      errors.push(`Transition from undefined state: ${fromState}`)
    }

    for (const toState of toStates) {
      if (!config.states.includes(toState)) {
        errors.push(`Transition to undefined state: ${toState}`)
      }
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Execute state transition safely with full validation
 */
export function executeStateTransition(
  currentState: string,
  targetState: string,
  config: StateMachineConfig,
): { success: boolean; error?: string; newState?: string } {
  // Validate current state exists
  if (!config.states.includes(currentState)) {
    return { success: false, error: `Invalid current state: ${currentState}` }
  }

  // Validate target state exists
  if (!config.states.includes(targetState)) {
    return { success: false, error: `Invalid target state: ${targetState}` }
  }

  // Check if transition is allowed
  const allowed = config.transitions[currentState] || []
  if (!allowed.includes(targetState)) {
    return {
      success: false,
      error: `Transition from ${currentState} to ${targetState} not allowed`,
    }
  }

  return { success: true, newState: targetState }
}
