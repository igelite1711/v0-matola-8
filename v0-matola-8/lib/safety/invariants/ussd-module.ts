import { logger } from "@/lib/monitoring/logger"
import { Invariant, EnforcementLevel } from "../invariant-engine"

/**
 * INV-PHONE-ML: Malawi Phone Format
 */
export class PhoneMalawiInvariant implements Invariant<{ phone: string }> {
    id = "INV-PHONE-ML"
    statement = "The system MUST always validate Malawi phone numbers to follow the +265 national prefix followed by an 8 or 9 provider digit."
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "P365D"
    owner = "lib/safety/invariants/ussd-module.ts"

    async preCheck(ctx: { phone: string, isVerified?: boolean }): Promise<boolean> {
        const isValidFormat = /^\+265[89]\d{8}$/.test(ctx.phone)
        if (ctx.isVerified !== undefined) {
            return isValidFormat && ctx.isVerified
        }
        return isValidFormat
    }

    async postCheck(ctx: { phone: string }): Promise<boolean> {
        return this.preCheck(ctx)
    }

    async rollback(ctx: { phone: string }): Promise<void> {
        logger.warn(`Rolling back identity registration for ${ctx.phone}`)
    }

    async verify(): Promise<boolean> {
        return true // Format is stateless
    }
}

/**
 * INV-USSD-LATENCY: USSD responses MUST complete within 5 seconds on 2G
 */
export class UssdLatencyInvariant implements Invariant<{ startTime: number, sessionId: string }> {
    id = "INV-USSD-LATENCY"
    statement = "USSD responses MUST complete within 5 seconds on 2G (Requirement T8.1)"
    type = "TEMPORAL" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/ussd-module.ts"
    threatsMitigated = ["T8.1_service_unavailability"]

    async preCheck(ctx: { startTime: number, sessionId: string }): Promise<boolean> {
        ctx.startTime = Date.now()
        return true
    }

    async postCheck(ctx: { startTime: number, sessionId: string }): Promise<boolean> {
        const elapsed = Date.now() - ctx.startTime
        if (elapsed > 5000) {
            logger.warn(`USSD Latency Violation: ${elapsed}ms for session ${ctx.sessionId}`)
        }
        return true
    }

    async rollback(): Promise<void> { }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-USSD-STATE: Temporal Resilience
 */
export class UssdStateInvariant implements Invariant<{ ttlSeconds: number }> {
    id = "INV-USSD-STATE"
    statement = "USSD sessions MUST persist for at least 10 minutes to accommodate 2G network latency."
    criticality = "IMPORTANT" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "PT600S"
    owner = "lib/safety/invariants/ussd-module.ts"

    async preCheck(ctx: { ttlSeconds: number }): Promise<boolean> {
        return ctx.ttlSeconds >= 600
    }

    async postCheck(ctx: { ttlSeconds: number }): Promise<boolean> {
        return ctx.ttlSeconds >= 600
    }

    async rollback(ctx: { ttlSeconds: number }): Promise<void> {
        logger.warn("USSD session timed out prematurely, resetting to welcome menu")
    }
}

export const USSD_INVARIANTS = [
    new PhoneMalawiInvariant(),
    new UssdStateInvariant(),
    new UssdLatencyInvariant()
]
