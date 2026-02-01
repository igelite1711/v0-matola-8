// Shipment State Machine - Enforces valid state transitions
// Prevents impossible transitions like delivered → in_transit

export const SHIPMENT_STATES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_TRANSIT: "in_transit",
  IN_CHECKPOINT: "in_checkpoint",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const

export type ShipmentStatus = (typeof SHIPMENT_STATES)[keyof typeof SHIPMENT_STATES]

// Valid transitions for each state
const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_transit", "cancelled"],
  in_transit: ["in_checkpoint", "delivered", "cancelled"],
  in_checkpoint: ["in_transit", "delivered"],
  delivered: [], // Terminal state
  cancelled: [], // Terminal state
}

export class ShipmentStateMachine {
  private currentState: ShipmentStatus

  constructor(initialState: ShipmentStatus = "pending") {
    if (!Object.values(SHIPMENT_STATES).includes(initialState)) {
      throw new Error(`Invalid initial state: ${initialState}`)
    }
    this.currentState = initialState
  }

  canTransition(targetState: ShipmentStatus): boolean {
    return VALID_TRANSITIONS[this.currentState].includes(targetState)
  }

  transition(targetState: ShipmentStatus): boolean {
    if (!this.canTransition(targetState)) {
      return false
    }
    this.currentState = targetState
    return true
  }

  getState(): ShipmentStatus {
    return this.currentState
  }

  getValidNextStates(): ShipmentStatus[] {
    return VALID_TRANSITIONS[this.currentState]
  }

  isTerminal(): boolean {
    return VALID_TRANSITIONS[this.currentState].length === 0
  }
}

// Validation function for routes
export function validateShipmentStatusTransition(
  currentStatus: ShipmentStatus,
  newStatus: ShipmentStatus,
): { valid: boolean; error?: string } {
  const machine = new ShipmentStateMachine(currentStatus as ShipmentStatus)

  if (!machine.canTransition(newStatus)) {
    return {
      valid: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}. Valid states: ${machine.getValidNextStates().join(", ")}`,
    }
  }

  return { valid: true }
}
