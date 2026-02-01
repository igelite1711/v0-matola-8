/**
 * Invariant Violation Monitoring & Alerting
 * Detects and logs invariant violations for investigation
 */

import type { Prisma } from "@prisma/client"

export interface InvariantViolation {
  id: string
  timestamp: Date
  invariantType: string
  severity: "critical" | "high" | "medium" | "low"
  description: string
  affectedResource: {
    type: string
    id: string
  }
  context: Record<string, unknown>
  userId?: string
  resolved: boolean
  resolution?: string
}

export class InvariantMonitor {
  private violations: InvariantViolation[] = []
  private readonly maxViolations = 10000 // In-memory limit
  private readonly criticalViolationHandlers: Array<
    (violation: InvariantViolation) => Promise<void>
  > = []

  constructor() {
    this.initializeHandlers()
  }

  private initializeHandlers(): void {
    // Add handlers for critical violations
    this.criticalViolationHandlers.push(
      this.alertViaLogging,
      this.alertViaMetrics,
    )
  }

  // ============================================
  // VIOLATION RECORDING
  // ============================================

  recordViolation(violation: Omit<InvariantViolation, "id" | "timestamp">) {
    const fullViolation: InvariantViolation = {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...violation,
    }

    this.violations.push(fullViolation)

    // Maintain size limit
    if (this.violations.length > this.maxViolations) {
      this.violations = this.violations.slice(-this.maxViolations)
    }

    // Handle critical violations immediately
    if (violation.severity === "critical") {
      this.handleCriticalViolation(fullViolation)
    }

    return fullViolation
  }

  // ============================================
  // DATA INTEGRITY VIOLATIONS
  // ============================================

  recordDuplicatePhoneViolation(phone: string, userIds: string[]): void {
    this.recordViolation({
      invariantType: "unique_phone_number",
      severity: "critical",
      description: `Multiple users with same phone number: ${phone}`,
      affectedResource: {
        type: "user",
        id: userIds.join(","),
      },
      context: {
        phone,
        userIds,
        count: userIds.length,
      },
      resolved: false,
    })
  }

  recordNegativeWeightViolation(shipmentId: string, weight: number): void {
    this.recordViolation({
      invariantType: "positive_weight",
      severity: "critical",
      description: `Shipment with non-positive weight: ${weight}kg`,
      affectedResource: {
        type: "shipment",
        id: shipmentId,
      },
      context: {
        weight,
      },
      resolved: false,
    })
  }

  recordNegativePriceViolation(
    resourceType: string,
    resourceId: string,
    price: number,
  ): void {
    this.recordViolation({
      invariantType: "positive_price",
      severity: "critical",
      description: `${resourceType} with non-positive price: ${price}`,
      affectedResource: {
        type: resourceType,
        id: resourceId,
      },
      context: {
        price,
      },
      resolved: false,
    })
  }

  recordDateOrderViolation(
    shipmentId: string,
    pickupDate: Date,
    deliveryDate: Date,
  ): void {
    this.recordViolation({
      invariantType: "delivery_after_pickup",
      severity: "critical",
      description: `Delivery date before pickup date`,
      affectedResource: {
        type: "shipment",
        id: shipmentId,
      },
      context: {
        pickupDate,
        deliveryDate,
      },
      resolved: false,
    })
  }

  recordOriginDestinationViolation(
    shipmentId: string,
    origin: string,
    destination: string,
  ): void {
    this.recordViolation({
      invariantType: "origin_destination_different",
      severity: "critical",
      description: `Shipment with same origin and destination`,
      affectedResource: {
        type: "shipment",
        id: shipmentId,
      },
      context: {
        origin,
        destination,
      },
      resolved: false,
    })
  }

  recordInvalidStatusTransitionViolation(
    resourceType: string,
    resourceId: string,
    fromStatus: string,
    toStatus: string,
  ): void {
    this.recordViolation({
      invariantType: "invalid_state_transition",
      severity: "high",
      description: `Invalid ${resourceType} status transition: ${fromStatus} -> ${toStatus}`,
      affectedResource: {
        type: resourceType,
        id: resourceId,
      },
      context: {
        fromStatus,
        toStatus,
      },
      resolved: false,
    })
  }

  recordCompletedResourceModificationViolation(
    resourceType: string,
    resourceId: string,
  ): void {
    this.recordViolation({
      invariantType: "immutable_completed",
      severity: "critical",
      description: `Attempt to modify completed ${resourceType}`,
      affectedResource: {
        type: resourceType,
        id: resourceId,
      },
      context: {},
      resolved: false,
    })
  }

  // ============================================
  // FINANCIAL VIOLATIONS
  // ============================================

  recordNegativeBalanceViolation(
    userId: string,
    balance: number,
    transactionAmount: number,
  ): void {
    this.recordViolation({
      invariantType: "negative_balance",
      severity: "critical",
      description: `User balance would go negative`,
      affectedResource: {
        type: "user",
        id: userId,
      },
      userId,
      context: {
        balance,
        transactionAmount,
      },
      resolved: false,
    })
  }

  recordDoubleReleaseViolation(
    paymentId: string,
    amount: number,
  ): void {
    this.recordViolation({
      invariantType: "double_release",
      severity: "critical",
      description: `Attempt to release already-released escrow`,
      affectedResource: {
        type: "payment",
        id: paymentId,
      },
      context: {
        amount,
      },
      resolved: false,
    })
  }

  recordPlatformFeeExceededViolation(
    paymentId: string,
    amount: number,
    fee: number,
    maxAllowed: number,
  ): void {
    this.recordViolation({
      invariantType: "platform_fee_exceeded",
      severity: "high",
      description: `Platform fee exceeds 10% limit`,
      affectedResource: {
        type: "payment",
        id: paymentId,
      },
      context: {
        amount,
        fee,
        maxAllowed,
      },
      resolved: false,
    })
  }

  recordNetAmountMismatchViolation(
    paymentId: string,
    amount: number,
    fee: number,
    netAmount: number,
    expectedNet: number,
  ): void {
    this.recordViolation({
      invariantType: "net_amount_mismatch",
      severity: "critical",
      description: `Net amount calculation mismatch`,
      affectedResource: {
        type: "payment",
        id: paymentId,
      },
      context: {
        amount,
        fee,
        netAmount,
        expectedNet,
        difference: Math.abs(netAmount - expectedNet),
      },
      resolved: false,
    })
  }

  // ============================================
  // AUTHORIZATION VIOLATIONS
  // ============================================

  recordUnauthorizedAccessViolation(
    userId: string,
    resourceType: string,
    resourceId: string,
  ): void {
    this.recordViolation({
      invariantType: "unauthorized_access",
      severity: "high",
      description: `Unauthorized access attempt`,
      affectedResource: {
        type: resourceType,
        id: resourceId,
      },
      userId,
      context: {},
      resolved: false,
    })
  }

  recordAdminActionViolation(
    userId: string,
    action: string,
    userRole: string,
  ): void {
    this.recordViolation({
      invariantType: "unauthorized_admin_action",
      severity: "critical",
      description: `Non-admin user attempted admin action: ${action}`,
      affectedResource: {
        type: "system",
        id: "admin_action",
      },
      userId,
      context: {
        action,
        userRole,
      },
      resolved: false,
    })
  }

  // ============================================
  // SECURITY VIOLATIONS
  // ============================================

  recordSQLInjectionAttempt(
    userId: string,
    field: string,
    input: string,
  ): void {
    this.recordViolation({
      invariantType: "sql_injection_attempt",
      severity: "critical",
      description: `SQL injection attempt detected`,
      affectedResource: {
        type: "system",
        id: "security",
      },
      userId,
      context: {
        field,
        input: input.substring(0, 100), // Truncate for safety
      },
      resolved: false,
    })
  }

  recordXSSAttempt(userId: string, field: string, input: string): void {
    this.recordViolation({
      invariantType: "xss_attempt",
      severity: "critical",
      description: `XSS attack attempt detected`,
      affectedResource: {
        type: "system",
        id: "security",
      },
      userId,
      context: {
        field,
        input: input.substring(0, 100), // Truncate for safety
      },
      resolved: false,
    })
  }

  recordWeakPasswordViolation(userId: string): void {
    this.recordViolation({
      invariantType: "weak_password",
      severity: "medium",
      description: `User set weak password`,
      affectedResource: {
        type: "user",
        id: userId,
      },
      userId,
      context: {},
      resolved: false,
    })
  }

  recordInvalidSignatureViolation(
    webhookType: string,
    sourceIP?: string,
  ): void {
    this.recordViolation({
      invariantType: "invalid_webhook_signature",
      severity: "high",
      description: `Invalid webhook signature for ${webhookType}`,
      affectedResource: {
        type: "webhook",
        id: webhookType,
      },
      context: {
        sourceIP,
      },
      resolved: false,
    })
  }

  // ============================================
  // QUERY & REPORTING
  // ============================================

  getViolations(
    filter?: {
      invariantType?: string
      severity?: InvariantViolation["severity"]
      resolved?: boolean
      timeRange?: { from: Date; to: Date }
    },
  ): InvariantViolation[] {
    return this.violations.filter((v) => {
      if (filter?.invariantType && v.invariantType !== filter.invariantType)
        return false
      if (filter?.severity && v.severity !== filter.severity) return false
      if (filter?.resolved !== undefined && v.resolved !== filter.resolved)
        return false
      if (filter?.timeRange) {
        if (
          v.timestamp < filter.timeRange.from ||
          v.timestamp > filter.timeRange.to
        )
          return false
      }
      return true
    })
  }

  getCriticalViolations(): InvariantViolation[] {
    return this.getViolations({ severity: "critical", resolved: false })
  }

  getViolationsByType(invariantType: string): InvariantViolation[] {
    return this.getViolations({ invariantType })
  }

  getViolationStats(): {
    total: number
    critical: number
    unresolved: number
    byType: Record<string, number>
  } {
    const stats = {
      total: this.violations.length,
      critical: this.violations.filter((v) => v.severity === "critical").length,
      unresolved: this.violations.filter((v) => !v.resolved).length,
      byType: {} as Record<string, number>,
    }

    for (const violation of this.violations) {
      stats.byType[violation.invariantType] =
        (stats.byType[violation.invariantType] || 0) + 1
    }

    return stats
  }

  // ============================================
  // ALERTS & HANDLERS
  // ============================================

  private async handleCriticalViolation(
    violation: InvariantViolation,
  ): Promise<void> {
    console.error("[CRITICAL INVARIANT VIOLATION]", {
      id: violation.id,
      type: violation.invariantType,
      resource: violation.affectedResource,
      timestamp: violation.timestamp,
      context: violation.context,
    })

    // Execute all registered handlers
    for (const handler of this.criticalViolationHandlers) {
      try {
        await handler(violation)
      } catch (error) {
        console.error("Error in critical violation handler:", error)
      }
    }
  }

  private async alertViaLogging(
    violation: InvariantViolation,
  ): Promise<void> {
    // Log to monitoring service (e.g., Sentry, CloudWatch, etc.)
    console.error("[INVARIANT VIOLATION ALERT]", {
      violation_id: violation.id,
      invariant_type: violation.invariantType,
      resource_type: violation.affectedResource.type,
      resource_id: violation.affectedResource.id,
      message: violation.description,
      context: violation.context,
    })
  }

  private async alertViaMetrics(
    violation: InvariantViolation,
  ): Promise<void> {
    // Increment metrics counter
    // Example: monitoring.increment('invariant_violations', {
    //   type: violation.invariantType,
    //   severity: violation.severity
    // })
  }

  registerCriticalViolationHandler(
    handler: (violation: InvariantViolation) => Promise<void>,
  ): void {
    this.criticalViolationHandlers.push(handler)
  }

  // ============================================
  // RESOLUTION
  // ============================================

  resolveViolation(violationId: string, resolution: string): boolean {
    const violation = this.violations.find((v) => v.id === violationId)
    if (!violation) return false

    violation.resolved = true
    violation.resolution = resolution
    return true
  }

  // ============================================
  // EXPORT & PERSISTENCE
  // ============================================

  exportViolations(format: "json" | "csv" = "json"): string {
    if (format === "json") {
      return JSON.stringify(this.violations, null, 2)
    }

    // CSV format
    const headers = [
      "ID",
      "Timestamp",
      "Type",
      "Severity",
      "Description",
      "Resource Type",
      "Resource ID",
      "Resolved",
    ]
    const rows = this.violations.map((v) => [
      v.id,
      v.timestamp.toISOString(),
      v.invariantType,
      v.severity,
      v.description,
      v.affectedResource.type,
      v.affectedResource.id,
      v.resolved ? "Yes" : "No",
    ])

    return (
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
    )
  }

  clearViolations(): void {
    this.violations = []
  }

  // Singleton instance
  private static instance: InvariantMonitor

  static getInstance(): InvariantMonitor {
    if (!InvariantMonitor.instance) {
      InvariantMonitor.instance = new InvariantMonitor()
    }
    return InvariantMonitor.instance
  }
}

// Export singleton
export const invariantMonitor = InvariantMonitor.getInstance()
