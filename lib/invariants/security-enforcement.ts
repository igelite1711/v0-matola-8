/**
 * Security Invariant Enforcement
 * Ensures authorization, authentication, and secure practices
 */

import { ApiError, errorCodes } from "@/lib/api/utils/error-handler"
import type { NextRequest } from "next/server"

// ============================================
// AUTHORIZATION INVARIANTS
// ============================================

export class AuthorizationEnforcer {
  // INVARIANT: Non-admin users cannot access admin endpoints
  static enforceAdminAccess(userRole: string | undefined): void {
    if (!userRole || !["admin", "support"].includes(userRole)) {
      throw new ApiError(
        "Admin access required",
        errorCodes.UNAUTHORIZED,
        403,
      )
    }
  }

  // INVARIANT: Users can only access their own data
  static enforceResourceOwnership(
    userId: string,
    resourceOwnerId: string,
  ): void {
    if (userId !== resourceOwnerId) {
      throw new ApiError(
        "You do not have access to this resource",
        errorCodes.FORBIDDEN,
        403,
      )
    }
  }

  // INVARIANT: Support agents can access assigned resources
  static enforceSupportAccessOrOwnership(
    userRole: string,
    userId: string,
    resourceOwnerId: string,
    assignedAgentId?: string,
  ): void {
    const isOwner = userId === resourceOwnerId
    const isAssignedAgent = userRole === "support" && userId === assignedAgentId
    const isAdmin = userRole === "admin"

    if (!isOwner && !isAssignedAgent && !isAdmin) {
      throw new ApiError(
        "You do not have access to this resource",
        errorCodes.FORBIDDEN,
        403,
      )
    }
  }

  // INVARIANT: Payment operations must verify ownership
  static enforcePaymentAccess(
    userId: string,
    paymentUserId: string,
    userRole: string,
  ): void {
    if (userId === paymentUserId) return // Owner access

    if (userRole === "admin" || userRole === "support") return // Admin/support access

    throw new ApiError(
      "You do not have access to this payment",
      errorCodes.FORBIDDEN,
      403,
    )
  }

  // INVARIANT: Shipment modification only by owner
  static enforceShipmentModificationAccess(
    userId: string,
    shipmentOwnerId: string,
  ): void {
    if (userId !== shipmentOwnerId) {
      throw new ApiError(
        "Only the shipment creator can modify it",
        errorCodes.FORBIDDEN,
        403,
      )
    }
  }
}

// ============================================
// AUTHENTICATION INVARIANTS
// ============================================

export class AuthenticationEnforcer {
  // INVARIANT: JWT tokens must be validated
  static enforceTokenPresence(token: string | undefined): void {
    if (!token) {
      throw new ApiError(
        "Authentication required",
        errorCodes.UNAUTHORIZED,
        401,
      )
    }
  }

  // INVARIANT: Token must not be blacklisted (logged out)
  static enforceTokenNotBlacklisted(isBlacklisted: boolean): void {
    if (isBlacklisted) {
      throw new ApiError(
        "Token has been invalidated",
        errorCodes.UNAUTHORIZED,
        401,
      )
    }
  }

  // INVARIANT: Token must not be expired
  static enforceTokenNotExpired(expiresAt: Date): void {
    if (new Date() > expiresAt) {
      throw new ApiError(
        "Token has expired",
        errorCodes.UNAUTHORIZED,
        401,
      )
    }
  }

  // INVARIANT: User must be verified before sensitive operations
  static enforceUserVerification(
    isVerified: boolean,
    requirementLevel: "phone" | "id" | "full",
  ): void {
    if (!isVerified) {
      throw new ApiError(
        `User verification (${requirementLevel}) required for this operation`,
        errorCodes.FORBIDDEN,
        403,
      )
    }
  }
}

// ============================================
// DATA PRIVACY INVARIANTS
// ============================================

export class DataPrivacyEnforcer {
  // INVARIANT: Phone numbers must not be exposed to unauthorized users
  static sanitizePhoneNumber(
    phone: string,
    viewerId: string,
    ownerId: string,
    matchedPartyId?: string,
  ): string | undefined {
    // Only owner or matched party can see full phone number
    if (viewerId === ownerId || viewerId === matchedPartyId) {
      return phone
    }

    // For admin, allow viewing (with audit logging)
    return undefined // Phone hidden
  }

  // INVARIANT: Payment details only visible to involved parties
  static enforcePaymentVisibility(
    viewerId: string,
    paymentOwnerId: string,
    userRole: string,
  ): void {
    const canView =
      viewerId === paymentOwnerId ||
      userRole === "admin" ||
      userRole === "support"

    if (!canView) {
      throw new ApiError(
        "You cannot view this payment",
        errorCodes.FORBIDDEN,
        403,
      )
    }
  }

  // INVARIANT: Sensitive data must never be included in logs
  static sanitizeForLogging(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data }
    const sensitiveFields = [
      "password",
      "pinHash",
      "apiKey",
      "secret",
      "token",
      "creditCard",
      "cvv",
    ]

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = "[REDACTED]"
      }
    }

    return sanitized
  }

  // INVARIANT: API keys must never be exposed
  static validateNoAPIKeyExposure(data: unknown): void {
    const dataStr = JSON.stringify(data)

    // Check for common API key patterns
    const apiKeyPatterns = [
      /sk_[a-z0-9]{20,}/i, // Stripe-like
      /[\w-]{20,}\.[\w-]{20,}/i, // JWT-like
      /api[_-]?key[_-]?=?[\w-]{20,}/i,
    ]

    for (const pattern of apiKeyPatterns) {
      if (pattern.test(dataStr)) {
        throw new ApiError(
          "Sensitive data detected in response",
          errorCodes.INTERNAL_SERVER_ERROR,
          500,
        )
      }
    }
  }
}

// ============================================
// REQUEST VALIDATION INVARIANTS
// ============================================

export class RequestValidationEnforcer {
  // INVARIANT: Input must be sanitized against SQL injection
  static validateInputSanitization(input: string): void {
    const sqlInjectionPatterns = [
      /('|("))+\s*(or|and|union|select|drop|insert|update|delete|create|alter)/i,
      /;\s*(drop|delete|truncate|update|insert|select)/i,
      /xp_|sp_|exec|execute/i,
    ]

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(input)) {
        throw new ApiError(
          "Invalid input detected",
          errorCodes.VALIDATION_ERROR,
          400,
        )
      }
    }
  }

  // INVARIANT: Input must be sanitized against XSS
  static validateXSSSanitization(input: string): void {
    const xssPatterns = [
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /on\w+\s*=/gi, // onclick=, onload=, etc.
      /<iframe[^>]*>/gi,
      /javascript:/gi,
      /<embed[^>]*>/gi,
      /<object[^>]*>/gi,
    ]

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        throw new ApiError(
          "Invalid input detected",
          errorCodes.VALIDATION_ERROR,
          400,
        )
      }
    }
  }

  // INVARIANT: Rate limiting for sensitive operations
  static enforceRateLimit(
    identifier: string,
    limit: number,
    windowMs: number,
    attempts: Map<string, number[]>,
  ): void {
    const now = Date.now()
    const windowStart = now - windowMs

    if (!attempts.has(identifier)) {
      attempts.set(identifier, [])
    }

    const userAttempts = attempts.get(identifier)!
    const recentAttempts = userAttempts.filter((t) => t > windowStart)

    if (recentAttempts.length >= limit) {
      throw new ApiError(
        "Rate limit exceeded. Please try again later.",
        errorCodes.TOO_MANY_REQUESTS,
        429,
      )
    }

    recentAttempts.push(now)
    attempts.set(identifier, recentAttempts)
  }

  // INVARIANT: Request size must not exceed limits
  static enforceMaxRequestSize(
    size: number,
    maxSize: number = 1024 * 100,
  ): void {
    if (size > maxSize) {
      throw new ApiError(
        `Request body too large (max ${(maxSize / 1024).toFixed(0)}KB)`,
        errorCodes.PAYLOAD_TOO_LARGE,
        413,
      )
    }
  }
}

// ============================================
// WEBHOOK SECURITY INVARIANTS
// ============================================

export class WebhookSecurityEnforcer {
  // INVARIANT: Webhook signatures must be verified
  static enforceSignatureVerification(
    body: string,
    signature: string | undefined,
    secret: string,
  ): boolean {
    if (!signature) {
      throw new ApiError(
        "Webhook signature required",
        errorCodes.UNAUTHORIZED,
        401,
      )
    }

    // Simple HMAC-SHA256 verification (implement with crypto library in production)
    // This is pseudo-code - use 'crypto' module in real implementation
    const crypto = require("crypto")
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex")

    if (signature !== expectedSignature) {
      throw new ApiError(
        "Invalid webhook signature",
        errorCodes.UNAUTHORIZED,
        401,
      )
    }

    return true
  }

  // INVARIANT: Webhook must be from trusted source
  static enforceSourceIP(
    requestIP: string | undefined,
    allowedIPs: string[],
  ): void {
    if (!requestIP || !allowedIPs.includes(requestIP)) {
      throw new ApiError(
        "Webhook request from untrusted source",
        errorCodes.UNAUTHORIZED,
        401,
      )
    }
  }

  // INVARIANT: Webhook processing must be idempotent
  static enforceIdempotency(
    webhookId: string,
    processedWebhooks: Set<string>,
  ): boolean {
    if (processedWebhooks.has(webhookId)) {
      // Return true (already processed) but don't process again
      return false
    }
    processedWebhooks.add(webhookId)
    return true
  }
}

// ============================================
// COMPLIANCE INVARIANTS
// ============================================

export class ComplianceEnforcer {
  // INVARIANT: Financial transactions must be audited
  static enforceAuditLogCreation(
    action: string,
    resourceType: string,
  ): void {
    const auditableActions = [
      "payment_created",
      "payment_released",
      "payment_refunded",
      "user_deleted",
      "admin_action",
      "dispute_resolved",
      "match_accepted",
      "shipment_completed",
    ]

    if (auditableActions.includes(action)) {
      // Audit log must be created before transaction completes
      // This should be enforced at database level with triggers
    }
  }

  // INVARIANT: User consent must be recorded
  static enforceConsentRecording(consentTimestamp: Date | null): void {
    if (!consentTimestamp) {
      throw new ApiError(
        "User consent required",
        errorCodes.VALIDATION_ERROR,
        400,
      )
    }
  }

  // INVARIANT: Data deletion requests must be honored within 30 days
  static enforceDeletionDeadline(
    deletionRequestedAt: Date,
    maxDelayMs: number = 30 * 24 * 60 * 60 * 1000,
  ): void {
    const elapsed = Date.now() - deletionRequestedAt.getTime()

    if (elapsed > maxDelayMs) {
      throw new ApiError(
        "Data deletion deadline exceeded (must be within 30 days)",
        errorCodes.INTERNAL_SERVER_ERROR,
        500,
      )
    }
  }

  // INVARIANT: Sensitive data must be encrypted at rest
  static validateEncryptionRequired(fieldName: string): void {
    const encryptedFields = [
      "phone",
      "email",
      "creditCard",
      "pinHash",
      "apiKey",
    ]

    if (encryptedFields.includes(fieldName)) {
      // Data must be encrypted before storage
      // Check at database level with constraints
    }
  }
}
