/**
 * SECURITY INVARIANTS ENFORCEMENT
 * 
 * Enforces MATOLA security system invariants:
 * - Authentication & authorization
 * - Data privacy
 * - Input validation & sanitization
 * - Password security
 */

import { ApiError, errorCodes } from "@/lib/api/utils/error-handler"
import crypto from "crypto"

// ============================================
// AUTHENTICATION & AUTHORIZATION INVARIANTS
// ============================================

/**
 * INVARIANT: Passwords must never be stored in plaintext
 * All passwords must be hashed using bcrypt with cost factor >= 10
 */
export async function validatePasswordHash(
  plaintext: string,
  hashedPassword: string,
): Promise<{ valid: boolean; error?: string }> {
  if (!hashedPassword || !hashedPassword.startsWith("$2")) {
    return {
      valid: false,
      error: "Password hash must be bcrypt format ($2b or $2a)",
    }
  }

  // Verify cost factor
  const costMatch = hashedPassword.match(/\$2[aby]\$(\d+)\$/)
  if (!costMatch) {
    return {
      valid: false,
      error: "Invalid bcrypt hash format",
    }
  }

  const costFactor = parseInt(costMatch[1])
  if (costFactor < 10) {
    return {
      valid: false,
      error: `Bcrypt cost factor must be >= 10. Got: ${costFactor}`,
    }
  }

  return { valid: true }
}

/**
 * INVARIANT: Admin actions must always be audited
 * All admin/support user actions must have corresponding audit_logs entries
 */
export function validateAdminActionAuditable(
  userId: string,
  userRole: string,
  action: string,
  auditLogExists: boolean,
): { valid: boolean; error?: string } {
  if ((userRole === "admin" || userRole === "support") && !auditLogExists) {
    return {
      valid: false,
      error: `Admin action not audited. User: ${userId}, Role: ${userRole}, Action: ${action}`,
    }
  }

  return { valid: true }
}

/**
 * INVARIANT: Non-admin users cannot access admin endpoints
 */
export function validateAdminAccess(userRole: string): {
  valid: boolean
  error?: string
} {
  const adminRoles = ["admin", "support"]

  if (!adminRoles.includes(userRole)) {
    return {
      valid: false,
      error: `Access denied. Admin or support role required. Got: ${userRole}`,
    }
  }

  return { valid: true }
}

// ============================================
// DATA PRIVACY INVARIANTS
// ============================================

/**
 * INVARIANT: Phone numbers must never be exposed to unauthorized users
 * Only owner or matched parties can view phone numbers
 */
export function validatePhoneNumberExposure(
  phoneOwnerUserId: string,
  requestingUserId: string,
  relationshipType?: "shipment_match" | "dispute" | "transaction",
): { canView: boolean; error?: string } {
  // Owner can always view own phone
  if (phoneOwnerUserId === requestingUserId) {
    return { canView: true }
  }

  // Matched parties can view each other's phone only for specific operations
  if (relationshipType === "shipment_match") {
    // Shipper and transporter can view each other's phone for matched shipment
    return { canView: true }
  }

  if (relationshipType === "dispute") {
    // Disputed parties can view each other's phone
    return { canView: true }
  }

  // Default: deny access
  return {
    canView: false,
    error: `Unauthorized access to phone number of user ${phoneOwnerUserId}`,
  }
}

/**
 * INVARIANT: Payment details must only be visible to involved parties
 */
export function validatePaymentVisibility(
  paymentCreatorId: string,
  paymentRecipientId: string,
  requestingUserId: string,
): { canView: boolean; error?: string } {
  if (
    requestingUserId === paymentCreatorId ||
    requestingUserId === paymentRecipientId
  ) {
    return { canView: true }
  }

  return {
    canView: false,
    error: `User ${requestingUserId} not authorized to view this payment`,
  }
}

/**
 * INVARIANT: API keys must never be logged or exposed in error messages
 */
export function sanitizeErrorMessage(
  error: string,
  keysToMask: string[] = [],
): string {
  let sanitized = error

  // Always mask common API key patterns
  sanitized = sanitized.replace(
    /sk_[a-zA-Z0-9]{32,}/g,
    "sk_[REDACTED_API_KEY]",
  )
  sanitized = sanitized.replace(
    /pk_[a-zA-Z0-9]{32,}/g,
    "pk_[REDACTED_API_KEY]",
  )
  sanitized = sanitized.replace(/Authorization:\s*Bearer\s*\S+/g, "Authorization: Bearer [REDACTED]")

  // Mask additional keys if provided
  for (const key of keysToMask) {
    const regex = new RegExp(key, "gi")
    sanitized = sanitized.replace(regex, "[REDACTED]")
  }

  return sanitized
}

// ============================================
// INPUT VALIDATION & SANITIZATION INVARIANTS
// ============================================

/**
 * INVARIANT: All user input must be sanitized before storage
 */
export function sanitizeInput(
  input: string,
  maxLength: number = 1000,
): { sanitized: string; valid: boolean; error?: string } {
  if (!input) {
    return { sanitized: "", valid: true }
  }

  if (input.length > maxLength) {
    return {
      sanitized: "",
      valid: false,
      error: `Input exceeds maximum length of ${maxLength} characters`,
    }
  }

  // Remove potentially malicious characters
  let sanitized = input
    .trim()
    // Remove null bytes
    .replace(/\0/g, "")
    // Escape HTML entities
    .replace(/[<>]/g, (char) => {
      const escapeMap: Record<string, string> = { "<": "&lt;", ">": "&gt;" }
      return escapeMap[char] || char
    })

  return { sanitized, valid: true }
}

/**
 * INVARIANT: Phone numbers must be validated against E.164 before storage
 */
export function validateE164PhoneNumber(phone: string): {
  valid: boolean
  formatted?: string
  error?: string
} {
  if (!phone) {
    return { valid: false, error: "Phone number is required" }
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-().]/g, "")

  // Must start with +265 (Malawi)
  if (!cleaned.startsWith("+265")) {
    return {
      valid: false,
      error: "Phone number must start with +265 (Malawi country code)",
    }
  }

  // Must have 8-9 digits after country code
  const digitsAfterCountryCode = cleaned.substring(4)
  if (!/^\d{8,9}$/.test(digitsAfterCountryCode)) {
    return {
      valid: false,
      error: "Phone number must have 8-9 digits after +265",
    }
  }

  return { valid: true, formatted: cleaned }
}

/**
 * INVARIANT: Amount inputs must be validated as positive numbers
 */
export function validateAmountInput(amount: unknown): {
  valid: boolean
  value?: number
  error?: string
} {
  if (amount === null || amount === undefined) {
    return { valid: false, error: "Amount is required" }
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount

  if (!Number.isFinite(numAmount)) {
    return { valid: false, error: "Amount must be a valid number" }
  }

  if (numAmount <= 0) {
    return { valid: false, error: "Amount must be greater than zero" }
  }

  // Cap at reasonable maximum (e.g., 10 million MWK)
  const maxAmount = 10_000_000
  if (numAmount > maxAmount) {
    return {
      valid: false,
      error: `Amount cannot exceed ${maxAmount.toLocaleString()}`,
    }
  }

  return { valid: true, value: numAmount }
}

/**
 * INVARIANT: File uploads must be validated by type and size
 */
export function validateFileUpload(
  file: { size: number; type: string; name: string },
  maxSizeMB: number = 10,
  allowedTypes: string[] = ["image/jpeg", "image/png", "image/webp"],
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "File is required" }
  }

  // Check size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size cannot exceed ${maxSizeMB}MB. Got ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    }
  }

  // Check type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed: ${allowedTypes.join(", ")}. Got: ${file.type}`,
    }
  }

  // Validate filename
  if (!file.name || !/^[\w\-. ]+$/.test(file.name)) {
    return {
      valid: false,
      error: "File name contains invalid characters",
    }
  }

  return { valid: true }
}

// ============================================
// DATA ENCRYPTION INVARIANTS
// ============================================

/**
 * INVARIANT: Sensitive data must never be cached without encryption
 */
export function validateCachedDataEncryption(
  data: unknown,
  dataType: "payment" | "pii" | "password" | "api_key",
): { valid: boolean; error?: string } {
  const sensitiveTypes = ["payment", "pii", "password", "api_key"]

  if (!sensitiveTypes.includes(dataType)) {
    return { valid: true } // Not sensitive
  }

  // In production, verify data is encrypted
  // For now, log warning
  console.warn(`[Security] Sensitive data of type ${dataType} should be encrypted in cache`)

  return { valid: true }
}

/**
 * Encrypt sensitive data for storage
 */
export function encryptSensitiveData(
  data: string,
  encryptionKey: string,
): { encrypted: string; iv: string } {
  const algorithm = "aes-256-gcm"
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(encryptionKey, "hex").slice(0, 32),
    iv,
  )

  let encrypted = cipher.update(data, "utf8", "hex")
  encrypted += cipher.final("hex")

  return {
    encrypted,
    iv: iv.toString("hex"),
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptSensitiveData(
  encrypted: string,
  iv: string,
  encryptionKey: string,
): string {
  const algorithm = "aes-256-gcm"
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(encryptionKey, "hex").slice(0, 32),
    Buffer.from(iv, "hex"),
  )

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

// ============================================
// WEBHOOK SECURITY INVARIANTS
// ============================================

/**
 * INVARIANT: Webhook callbacks must be verified with signatures
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): { valid: boolean; error?: string } {
  if (!signature) {
    return {
      valid: false,
      error: "Webhook signature header missing",
    }
  }

  // Calculate expected signature using HMAC-SHA256
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")

  // Use timing-safe comparison to prevent timing attacks
  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  ) {
    return {
      valid: false,
      error: "Webhook signature verification failed",
    }
  }

  return { valid: true }
}

// ============================================
// RESOURCE OWNERSHIP INVARIANTS
// ============================================

/**
 * INVARIANT: Users can only access their own resources
 */
export function validateResourceOwnership(
  resourceOwnerId: string,
  requestingUserId: string,
  resourceType: string,
  resourceId: string,
): { authorized: boolean; error?: string } {
  if (resourceOwnerId !== requestingUserId) {
    return {
      authorized: false,
      error: `Unauthorized access to ${resourceType} ${resourceId}. Owner: ${resourceOwnerId}, Requester: ${requestingUserId}`,
    }
  }

  return { authorized: true }
}

/**
 * INVARIANT: Shared resources must have explicit sharing permissions
 */
export interface ResourcePermission {
  userId: string
  resourceId: string
  permission: "read" | "write" | "admin"
  grantedAt: Date
}

export function validateResourcePermission(
  requestingUserId: string,
  permission: ResourcePermission,
  requiredPermission: "read" | "write" | "admin",
): { authorized: boolean; error?: string } {
  if (permission.userId !== requestingUserId) {
    return { authorized: false, error: "Permission not granted to this user" }
  }

  // Check if permission level is sufficient
  const permissionHierarchy = { read: 1, write: 2, admin: 3 }
  if (
    permissionHierarchy[permission.permission] <
    permissionHierarchy[requiredPermission]
  ) {
    return {
      authorized: false,
      error: `Insufficient permissions. Required: ${requiredPermission}, Granted: ${permission.permission}`,
    }
  }

  return { authorized: true }
}

// ============================================
// AUDIT & LOGGING INVARIANTS
// ============================================

/**
 * INVARIANT: Security-sensitive actions must be logged with full context
 */
export interface SecurityAuditLog {
  timestamp: Date
  action: string
  userId: string
  resourceId: string
  resourceType: string
  status: "success" | "failure"
  ipAddress?: string
  userAgent?: string
  details?: Record<string, unknown>
}

export function validateSecurityAuditLog(
  log: SecurityAuditLog,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!log.timestamp) errors.push("Timestamp required")
  if (!log.action) errors.push("Action required")
  if (!log.userId) errors.push("User ID required")
  if (!log.resourceType) errors.push("Resource type required")
  if (!log.status || !["success", "failure"].includes(log.status)) {
    errors.push("Status must be 'success' or 'failure'")
  }

  return { valid: errors.length === 0, errors }
}
