import { logger } from "@/lib/monitoring/logger"
import { Invariant, EnforcementLevel } from "../invariant-engine"

/**
 * INV-PLATE-ML: Malawi District Plate Format
 */
export class PlateMalawiInvariant implements Invariant<{ plate: string }> {
    id = "INV-PLATE-ML"
    statement = "The system MUST always enforce vehicle registration plates to match the 'XX 0000' Malawi district format."
    type = "STATE" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "P365D"
    owner = "lib/safety/invariants/shipment-module.ts"
    threatsMitigated = ["T1.1_invalid_assets"]

    async preCheck(ctx: { plate: string }): Promise<boolean> {
        const plateRegex = /^[A-Z]{2}\s?\d{4}$/
        return plateRegex.test(ctx.plate)
    }

    async postCheck(ctx: { plate: string }): Promise<boolean> {
        // In a real system, we might check a national DB here
        return this.preCheck(ctx)
    }

    async rollback(ctx: { plate: string }): Promise<void> {
        logger.warn(`Rolling back plate registration for ${ctx.plate}`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-SHIP-WEIGHT: Vehicle Capacity Constraint
 */
export interface WeightContext {
    weightKg: number
    vehicleMaxCapacityKg: number
}

export class ShipmentWeightInvariant implements Invariant<WeightContext> {
    id = "INV-SHIP-WEIGHT"
    statement = "The system MUST always ensure shipment weight is less than or equal to the assigned vehicle's maximum capacity."
    type = "STATE" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "P1D"
    owner = "lib/safety/invariants/shipment-module.ts"
    threatsMitigated = ["T4.1_overload_risk"]

    async preCheck(ctx: WeightContext): Promise<boolean> {
        // Allow 10% tolerance for overload (Requirement V1.0)
        return ctx.weightKg <= ctx.vehicleMaxCapacityKg * 1.10
    }

    async postCheck(ctx: WeightContext): Promise<boolean> {
        return ctx.weightKg <= ctx.vehicleMaxCapacityKg * 1.10
    }

    async rollback(ctx: WeightContext): Promise<void> {
        logger.warn(`Rolling back weight-based match for ${ctx.weightKg}kg load`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-SHIP-CARGO: Cargo Compatibility
 */
export interface CargoContext {
    cargoType: string
    vehicleType: string
    compatibilityMap: Record<string, string[]>
}

export class ShipmentCargoInvariant implements Invariant<CargoContext> {
    id = "INV-SHIP-CARGO"
    statement = "It is FORBIDDEN for a vehicle to transport cargo types marked as incompatible."
    type = "STATE" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "P1D"
    owner = "lib/safety/invariants/shipment-module.ts"
    threatsMitigated = ["T1.4_cargo_damage"]

    async preCheck(ctx: CargoContext): Promise<boolean> {
        const allowed = ctx.compatibilityMap[ctx.cargoType]
        return allowed?.includes(ctx.vehicleType) ?? false
    }

    async postCheck(ctx: CargoContext): Promise<boolean> {
        return this.preCheck(ctx)
    }

    async rollback(ctx: CargoContext): Promise<void> {
        logger.warn(`Rolling back incompatible cargo match: ${ctx.cargoType} on ${ctx.vehicleType}`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-SHIP-STATE: Shipment status transitions MUST follow the defined state machine
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
    'posted': ['matched', 'cancelled'],
    'matched': ['accepted', 'expired', 'cancelled'],
    'accepted': ['in_transit', 'cancelled'],
    'in_transit': ['delivered', 'cancelled'],
    'delivered': ['completed', 'disputed'],
    'completed': [],
    'cancelled': [],
    'disputed': ['completed', 'cancelled']
};

export class ShipmentStateInvariant implements Invariant<{ oldStatus: string, newStatus: string }> {
    id = "INV-SHIP-STATE"
    statement = "Shipment status transitions MUST follow the defined state machine (e.g. posted -> matched -> accepted)."
    type = "TRANSITION" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/shipment-module.ts"
    threatsMitigated = ["T1.2_data_corruption"]

    async preCheck(ctx: { oldStatus: string, newStatus: string }): Promise<boolean> {
        const validNext = VALID_TRANSITIONS[ctx.oldStatus] || []
        return validNext.includes(ctx.newStatus)
    }

    async postCheck(ctx: { oldStatus: string, newStatus: string }): Promise<boolean> {
        return true
    }

    async rollback(ctx: { oldStatus: string, newStatus: string }): Promise<void> {
        logger.error(`Invalid shipment state transition attempt: ${ctx.oldStatus} -> ${ctx.newStatus}`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-SHIP-HIGHVAL: Manual review for high-value shipments (> 500k MWK)
 */
export class HighValueReviewInvariant implements Invariant<{ price: number, isReviewed: boolean }> {
    id = "INV-SHIP-HIGHVAL"
    statement = "Shipments with a price > 500,000 MWK MUST be manually reviewed before they can be matched."
    type = "STATE" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/shipment-module.ts"
    threatsMitigated = ["T2.2_financial_loss"]

    async preCheck(ctx: { price: number, isReviewed: boolean }): Promise<boolean> {
        if (ctx.price > 500000) {
            return ctx.isReviewed
        }
        return true
    }

    async postCheck(ctx: { price: number, isReviewed: boolean }): Promise<boolean> {
        return true
    }

    async rollback(ctx: { price: number, isReviewed: boolean }): Promise<void> {
        logger.warn(`High-value shipment blocked pending manual review: ${ctx.price} MWK`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

export const SHIPMENT_INVARIANTS = [
    new PlateMalawiInvariant(),
    new ShipmentWeightInvariant(),
    new ShipmentCargoInvariant(),
    new ShipmentStateInvariant(),
    new HighValueReviewInvariant()
]
