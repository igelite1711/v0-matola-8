// Escrow State Machine for PRD-compliant payment flow
// Flow: pending → in_transit → completed/disputed → released/refunded

import { db } from "@/lib/api/services/db"

export type EscrowState = "pending" | "in_transit" | "completed" | "disputed" | "released" | "refunded" | "cancelled"

export interface EscrowTransition {
  from: EscrowState
  to: EscrowState
  action: string
  allowedRoles: ("shipper" | "transporter" | "admin" | "system")[]
}

const VALID_TRANSITIONS: EscrowTransition[] = [
  // Initial payment creates pending escrow
  { from: "pending", to: "in_transit", action: "transporter_accepts", allowedRoles: ["transporter"] },
  { from: "pending", to: "cancelled", action: "shipper_cancels", allowedRoles: ["shipper", "admin"] },

  // In transit to delivery
  { from: "in_transit", to: "completed", action: "shipper_confirms_delivery", allowedRoles: ["shipper"] },
  { from: "in_transit", to: "disputed", action: "raise_dispute", allowedRoles: ["shipper", "transporter"] },

  // Completed to released
  { from: "completed", to: "released", action: "release_funds", allowedRoles: ["system", "admin"] },

  // Disputed resolution
  { from: "disputed", to: "released", action: "resolve_for_transporter", allowedRoles: ["admin"] },
  { from: "disputed", to: "refunded", action: "resolve_for_shipper", allowedRoles: ["admin"] },

  // Cancellation refund
  { from: "cancelled", to: "refunded", action: "process_refund", allowedRoles: ["system", "admin"] },
]

export interface EscrowRecord {
  id: string
  shipmentId: string
  paymentId: string
  shipperId: string
  transporterId: string | null
  amount: number
  platformFee: number
  netAmount: number
  state: EscrowState
  stateHistory: {
    state: EscrowState
    timestamp: Date
    action: string
    userId: string | null
    metadata?: Record<string, unknown>
  }[]
  createdAt: Date
  updatedAt: Date
}

// In-memory store (replace with database in production)
const escrowRecords: Map<string, EscrowRecord> = new Map()

export function createEscrow(
  shipmentId: string,
  paymentId: string,
  shipperId: string,
  amount: number,
  platformFeeRate = 0.1,
): EscrowRecord {
  const platformFee = Math.round(amount * platformFeeRate)
  const netAmount = amount - platformFee

  const escrow: EscrowRecord = {
    id: `escrow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    shipmentId,
    paymentId,
    shipperId,
    transporterId: null,
    amount,
    platformFee,
    netAmount,
    state: "pending",
    stateHistory: [
      {
        state: "pending",
        timestamp: new Date(),
        action: "created",
        userId: shipperId,
        metadata: { amount, platformFee, netAmount },
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  escrowRecords.set(escrow.id, escrow)
  return escrow
}

export async function transitionEscrow(
  escrowId: string,
  action: string,
  userId: string,
  userRole: "shipper" | "transporter" | "admin" | "system",
  metadata?: Record<string, unknown>,
): Promise<{ success: boolean; escrow?: EscrowRecord; error?: string }> {
  const escrow = escrowRecords.get(escrowId)

  if (!escrow) {
    return { success: false, error: "Escrow not found" }
  }

  // Find valid transition
  const transition = VALID_TRANSITIONS.find((t) => t.from === escrow.state && t.action === action)

  if (!transition) {
    return { success: false, error: `Invalid transition: ${action} from state ${escrow.state}` }
  }

  // Check role permission
  if (!transition.allowedRoles.includes(userRole)) {
    return { success: false, error: `Role ${userRole} cannot perform ${action}` }
  }

  // Additional validation based on action
  if (action === "transporter_accepts" && !escrow.transporterId) {
    return { success: false, error: "Transporter must be assigned before acceptance" }
  }

  // Update state
  const previousState = escrow.state
  escrow.state = transition.to
  escrow.updatedAt = new Date()
  escrow.stateHistory.push({
    state: transition.to,
    timestamp: new Date(),
    action,
    userId,
    metadata,
  })

  // Perform side effects
  await performTransitionSideEffects(escrow, previousState, transition.to, action, userId)

  // Audit log
  await db.createAuditLog({
    user_id: userId !== "system" ? userId : undefined,
    action: `escrow_${action}`,
    entity: "escrow",
    entity_id: escrow.id,
    changes: { from: previousState, to: transition.to, metadata },
  })

  return { success: true, escrow }
}

async function performTransitionSideEffects(
  escrow: EscrowRecord,
  fromState: EscrowState,
  toState: EscrowState,
  action: string,
  userId: string,
): Promise<void> {
  switch (toState) {
    case "released":
      // Transfer funds to transporter
      console.log(`Releasing MWK ${escrow.netAmount} to transporter ${escrow.transporterId}`)
      // In production: Call mobile money disbursement API
      break

    case "refunded":
      // Refund shipper
      console.log(`Refunding MWK ${escrow.amount} to shipper ${escrow.shipperId}`)
      // In production: Call mobile money refund API
      break

    case "disputed":
      // Create dispute record and notify admins
      console.log(`Dispute raised for escrow ${escrow.id}`)
      // In production: Create dispute ticket, send notifications
      break
  }
}

export function assignTransporter(escrowId: string, transporterId: string): { success: boolean; error?: string } {
  const escrow = escrowRecords.get(escrowId)

  if (!escrow) {
    return { success: false, error: "Escrow not found" }
  }

  if (escrow.state !== "pending") {
    return { success: false, error: "Can only assign transporter to pending escrow" }
  }

  escrow.transporterId = transporterId
  escrow.updatedAt = new Date()

  return { success: true }
}

// Get escrow by ID
export function getEscrow(escrowId: string): EscrowRecord | undefined {
  return escrowRecords.get(escrowId)
}

// Get escrow by shipment ID
export function getEscrowByShipment(shipmentId: string): EscrowRecord | undefined {
  return Array.from(escrowRecords.values()).find((e) => e.shipmentId === shipmentId)
}

export function checkDuplicatePayment(
  paymentId: string,
  shipmentId: string,
): { isDuplicate: boolean; existingEscrowId?: string } {
  const existing = Array.from(escrowRecords.values()).find(
    (e) =>
      e.paymentId === paymentId || (e.shipmentId === shipmentId && e.state !== "refunded" && e.state !== "cancelled"),
  )

  return {
    isDuplicate: !!existing,
    existingEscrowId: existing?.id,
  }
}

export function getEscrowsNeedingIntervention(): EscrowRecord[] {
  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000 // 24 hours

  return Array.from(escrowRecords.values()).filter((e) => {
    // Disputed escrows
    if (e.state === "disputed") return true

    // Stuck in transit for too long
    if (e.state === "in_transit" && e.updatedAt.getTime() < cutoffTime) return true

    // Pending too long
    if (e.state === "pending" && e.createdAt.getTime() < cutoffTime) return true

    return false
  })
}

export async function runDailyReconciliation(): Promise<{
  totalEscrows: number
  pendingCount: number
  inTransitCount: number
  completedCount: number
  disputedCount: number
  releasedToday: number
  refundedToday: number
  flaggedForReview: string[]
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const escrows = Array.from(escrowRecords.values())
  const flaggedForReview: string[] = []

  // Count by state
  const stateCounts = escrows.reduce(
    (acc, e) => {
      acc[e.state] = (acc[e.state] || 0) + 1
      return acc
    },
    {} as Record<EscrowState, number>,
  )

  // Count today's releases and refunds
  let releasedToday = 0
  let refundedToday = 0

  for (const escrow of escrows) {
    const lastTransition = escrow.stateHistory[escrow.stateHistory.length - 1]

    if (lastTransition && lastTransition.timestamp >= today) {
      if (escrow.state === "released") releasedToday++
      if (escrow.state === "refunded") refundedToday++
    }

    // Flag anomalies
    if (escrow.state === "in_transit") {
      const daysInTransit = (Date.now() - escrow.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysInTransit > 7) {
        flaggedForReview.push(`${escrow.id}: In transit for ${Math.floor(daysInTransit)} days`)
      }
    }
  }

  return {
    totalEscrows: escrows.length,
    pendingCount: stateCounts.pending || 0,
    inTransitCount: stateCounts.in_transit || 0,
    completedCount: stateCounts.completed || 0,
    disputedCount: stateCounts.disputed || 0,
    releasedToday,
    refundedToday,
    flaggedForReview,
  }
}
