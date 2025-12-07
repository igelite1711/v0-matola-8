// Audit logging service for compliance and security tracking

import { db } from "@/lib/api/services/db"

export interface AuditEvent {
  action: string
  actorId: string
  resourceType: string
  resourceId: string
  changes?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

/**
 * Log an audit event for compliance tracking
 * Used for security-sensitive operations, data changes, and regulatory compliance
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
  try {
    await db.createAuditLog({
      user_id: event.actorId,
      action: event.action,
      entity: event.resourceType,
      entity_id: event.resourceId,
      changes: {
        ...event.changes,
        metadata: event.metadata,
        userAgent: event.userAgent,
      },
      ip_address: event.ipAddress,
    })

    // Also log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Audit]", JSON.stringify(event, null, 2))
    }
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error("[Audit] Failed to log event:", error)
  }
}

/**
 * Log authentication events
 */
export async function logAuthEvent(
  action: "login" | "logout" | "register" | "password_reset" | "otp_sent" | "otp_verified",
  userId: string,
  ipAddress?: string,
  metadata?: Record<string, any>,
): Promise<void> {
  await logAuditEvent({
    action: `auth:${action}`,
    actorId: userId,
    resourceType: "auth",
    resourceId: userId,
    ipAddress,
    metadata,
  })
}

/**
 * Log payment events
 */
export async function logPaymentEvent(
  action: "initiated" | "completed" | "failed" | "refunded" | "disputed",
  paymentId: string,
  actorId: string,
  amount?: number,
  provider?: string,
  ipAddress?: string,
): Promise<void> {
  await logAuditEvent({
    action: `payment:${action}`,
    actorId,
    resourceType: "payment",
    resourceId: paymentId,
    changes: { amount, provider },
    ipAddress,
  })
}

/**
 * Log shipment events
 */
export async function logShipmentEvent(
  action: "created" | "updated" | "matched" | "started" | "completed" | "cancelled",
  shipmentId: string,
  actorId: string,
  changes?: Record<string, any>,
  ipAddress?: string,
): Promise<void> {
  await logAuditEvent({
    action: `shipment:${action}`,
    actorId,
    resourceType: "shipment",
    resourceId: shipmentId,
    changes,
    ipAddress,
  })
}

/**
 * Log admin actions
 */
export async function logAdminAction(
  action: string,
  adminId: string,
  resourceType: string,
  resourceId: string,
  changes?: Record<string, any>,
  ipAddress?: string,
): Promise<void> {
  await logAuditEvent({
    action: `admin:${action}`,
    actorId: adminId,
    resourceType,
    resourceId,
    changes,
    ipAddress,
  })
}
