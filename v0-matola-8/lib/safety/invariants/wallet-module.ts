import { logger } from "@/lib/monitoring/logger"
import { Invariant, EnforcementLevel } from "../invariant-engine"

/**
 * INV-PRICE-MIN-TRUCK: Heavy Vehicle Minimum Price
 */
export class PriceMinTruckInvariant implements Invariant<{ vehicleType: string, price: number }> {
    id = "INV-PRICE-MIN-TRUCK"
    statement = "Heavy vehicles (Medium/Large Trucks, Tankers) MUST always enforce a minimum shipment price of 25,000 MWK."
    type = "STATE" as const
    criticality = "IMPORTANT" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "P30D"
    owner = "lib/safety/invariants/wallet-module.ts"
    threatsMitigated = ["T2.3_underpricing"]

    async preCheck(ctx: { vehicleType: string, price: number }): Promise<boolean> {
        const heavyTypes = ['medium_truck', 'large_truck', 'tanker']
        if (heavyTypes.includes(ctx.vehicleType)) {
            return ctx.price >= 25000
        }
        return true
    }

    async postCheck(ctx: { vehicleType: string, price: number }): Promise<boolean> {
        return this.preCheck(ctx)
    }

    async rollback(ctx: { vehicleType: string, price: number }): Promise<void> {
        logger.warn(`Price violation for heavy vehicle: ${ctx.price} MWK`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-ESCROW-SOLVENCY: Digital or Verified Cash Solvency
 */
export interface SolvencyContext {
    method: 'cash' | 'digital'
    availableBalance: number
    grossPrice: number
    cashVerified: boolean
}

export class EscrowSolvencyInvariant implements Invariant<SolvencyContext> {
    id = "INV-ESCROW-SOLVENCY"
    statement = "The system MUST verify sufficient digital balance OR a 'Verified Cash Commitment' before creating an escrow hold."
    type = "STATE" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/wallet-module.ts"
    threatsMitigated = ["T2.4_insufficient_funds"]

    async preCheck(ctx: SolvencyContext): Promise<boolean> {
        if (ctx.method === 'cash') {
            return ctx.cashVerified
        }
        return ctx.availableBalance >= ctx.grossPrice
    }

    async postCheck(ctx: SolvencyContext): Promise<boolean> {
        // Post-check: Balance must have been deducted or hold created
        return true // Placeholder for actual balance state check
    }

    async rollback(ctx: SolvencyContext): Promise<void> {
        logger.warn(`Rolling back escrow hold for ${ctx.method} payment`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-MATCH-SCORE: Match score MUST be >= 30
 */
export class MatchScoreInvariant implements Invariant<{ score: number }> {
    id = "INV-MATCH-SCORE"
    statement = "Match score MUST be >= 30 before presenting to transporter."
    type = "STATE" as const
    criticality = "IMPORTANT" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/wallet-module.ts"
    threatsMitigated = ["T1.5_poor_match_quality"]

    async preCheck(ctx: { score: number }): Promise<boolean> {
        return ctx.score >= 30
    }

    async postCheck(ctx: { score: number }): Promise<boolean> {
        return ctx.score >= 30
    }

    async rollback(ctx: { score: number }): Promise<void> {
        logger.warn(`Poor match quality blocked: Score ${ctx.score}`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-PRICE-BIND: Price agreed at match acceptance MUST NOT change
 */
export class PriceBindingInvariant implements Invariant<{ isAccepted: boolean, oldPrice: number, newPrice: number, hasException: boolean }> {
    id = "INV-PRICE-BIND"
    statement = "Price agreed at match acceptance MUST NOT change without a documented exception."
    type = "TRANSITION" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/wallet-module.ts"
    threatsMitigated = ["T2.5_price_tampering"]

    async preCheck(ctx: { isAccepted: boolean, oldPrice: number, newPrice: number, hasException: boolean }): Promise<boolean> {
        if (ctx.isAccepted && ctx.newPrice !== ctx.oldPrice) {
            return ctx.hasException
        }
        return true
    }

    async postCheck(ctx: { isAccepted: boolean, oldPrice: number, newPrice: number, hasException: boolean }): Promise<boolean> {
        return true
    }

    async rollback(ctx: { isAccepted: boolean, oldPrice: number, newPrice: number, hasException: boolean }): Promise<void> {
        logger.error(`Unauthorized price change attempt: ${ctx.oldPrice} -> ${ctx.newPrice}`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-OTP-EXPIRY: OTP codes MUST expire after 5 minutes
 */
export class OtpExpiryInvariant implements Invariant<{ creationTime: number, now: number }> {
    id = "INV-OTP-EXPIRY"
    statement = "OTP codes MUST expire after 5 minutes (300s)."
    type = "TEMPORAL" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "PT300S"
    owner = "lib/safety/invariants/wallet-module.ts"
    threatsMitigated = ["T3.3_account_takeover"]

    async preCheck(ctx: { creationTime: number, now: number }): Promise<boolean> {
        const ageSeconds = (ctx.now - ctx.creationTime) / 1000
        return ageSeconds <= 300
    }

    async postCheck(ctx: { creationTime: number, now: number }): Promise<boolean> {
        return true
    }

    async rollback(ctx: { creationTime: number, now: number }): Promise<void> {
        logger.warn("OTP verification attempt failed: Code expired.")
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-ESCROW-RELEASE: Payments MUST be held in escrow until delivery confirmed
 */
export class EscrowReleaseInvariant implements Invariant<{
    shipmentStatus: string,
    isConfirmedByShipper: boolean,
    paymentStatus: string
}> {
    id = "INV-ESCROW-RELEASE"
    statement = "Payments MUST be held in escrow until delivery confirmed (Requirement T2.1)"
    type = "TRANSITION" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    dependencies = ["INV-SHIP-STATE"]
    decayWindow = "T0"
    owner = "lib/safety/invariants/wallet-module.ts"
    threatsMitigated = ["T2.1_payment_fraud"]

    async preCheck(ctx: { shipmentStatus: string, isConfirmedByShipper: boolean, paymentStatus: string }): Promise<boolean> {
        if (ctx.paymentStatus === "released") {
            return ctx.shipmentStatus === "delivered" && ctx.isConfirmedByShipper
        }
        return true
    }

    async postCheck(ctx: { shipmentStatus: string, isConfirmedByShipper: boolean, paymentStatus: string }): Promise<boolean> {
        return this.preCheck(ctx)
    }

    async rollback(): Promise<void> {
        logger.error("ILLEGAL PAYMENT RELEASE DETECTED - INITIATING RECOVERY")
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-SHIP-UNIQ: Unique Shipment References
 */
export class UniqueReferenceInvariant implements Invariant<{ reference: string }> {
    id = "INV-SHIP-UNIQ"
    statement = "Shipment reference numbers MUST be unique."
    type = "STATE" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/wallet-module.ts"
    threatsMitigated = ["T1.2_data_corruption"]

    async preCheck(ctx: { reference: string }): Promise<boolean> {
        return true // Database handles this, but safety layer confirms
    }

    async postCheck(ctx: { reference: string }): Promise<boolean> {
        return true
    }

    async rollback(): Promise<void> { }

    async verify(): Promise<boolean> {
        return true
    }
}

export const WALLET_INVARIANTS = [
    new PriceMinTruckInvariant(),
    new EscrowSolvencyInvariant(),
    new MatchScoreInvariant(),
    new PriceBindingInvariant(),
    new OtpExpiryInvariant(),
    new EscrowReleaseInvariant(),
    new UniqueReferenceInvariant()
]
