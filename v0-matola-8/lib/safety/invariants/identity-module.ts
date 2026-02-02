import { logger } from "@/lib/monitoring/logger"
import { Invariant, EnforcementLevel } from "../invariant-engine"

/**
 * INV-AUTH-ROLE: Role-based Access Control
 */
export interface AuthContext {
    userRole: string
    action: string
    requiredRoleMap: Record<string, string>
}

export class AuthRoleInvariant implements Invariant<AuthContext> {
    id = "INV-AUTH-ROLE"
    statement = "The system MUST always verify that the user's role permits the requested action."
    type = "STATE" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/identity-module.ts"
    threatsMitigated = ["T3.1_unauthorized_access"]

    async preCheck(ctx: AuthContext): Promise<boolean> {
        const requiredRole = ctx.requiredRoleMap[ctx.action]
        return ctx.userRole === requiredRole
    }

    async postCheck(ctx: AuthContext): Promise<boolean> {
        // Post-check: ensure audit log was created (mock)
        return true
    }

    async rollback(ctx: AuthContext): Promise<void> {
        logger.warn(`Unauthorized action attempted: ${ctx.action} by ${ctx.userRole}. Access Blocked.`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-RATING-UNIQ: Duplicate rating prevention
 */
export class RatingUniquenessInvariant implements Invariant<{ shipmentId: string, raterId: string, alreadyRated: boolean }> {
    id = "INV-RATING-UNIQ"
    statement = "Users MUST NOT rate the same trip twice."
    type = "STATE" as const
    criticality = "IMPORTANT" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/identity-module.ts"
    threatsMitigated = ["T1.3_duplicate_data"]

    async preCheck(ctx: { shipmentId: string, raterId: string, alreadyRated: boolean }): Promise<boolean> {
        return !ctx.alreadyRated
    }

    async postCheck(ctx: { shipmentId: string, raterId: string, alreadyRated: boolean }): Promise<boolean> {
        return true
    }

    async rollback(ctx: { shipmentId: string, raterId: string, alreadyRated: boolean }): Promise<void> {
        logger.warn(`Duplicate rating attempt blocked for shipment ${ctx.shipmentId} by ${ctx.raterId}`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-REPUTATION-NOSHOW: Auto-suspension after 3 no-shows
 */
export class ReputationNoShowInvariant implements Invariant<{ noShowCount: number }> {
    id = "INV-REPUTATION-NOSHOW"
    statement = "Transporters with 3 or more no-shows MUST be automatically suspended."
    type = "STATE" as const
    criticality = "IMPORTANT" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "P90D"
    owner = "lib/safety/invariants/identity-module.ts"
    threatsMitigated = ["T5.1_unreliable_transporters"]

    async preCheck(ctx: { noShowCount: number }): Promise<boolean> {
        return ctx.noShowCount < 3
    }

    async postCheck(ctx: { noShowCount: number }): Promise<boolean> {
        return ctx.noShowCount < 3
    }

    async rollback(ctx: { noShowCount: number }): Promise<void> {
        logger.error(`User reaches no-show threshold (${ctx.noShowCount}). Mandatory suspension required.`)
    }

    async verify(): Promise<boolean> {
        return true
    }
}

/**
 * INV-AUTH-SUSPEND: Block suspended users
 */
export class AuthSuspendInvariant implements Invariant<{ userStatus: string }> {
    id = "INV-AUTH-SUSPEND"
    statement = "Suspended users MUST NOT be able to create new transactions."
    type = "STATE" as const
    criticality = "CRITICAL" as const
    enforcement = EnforcementLevel.BLOCK
    decayWindow = "T0"
    owner = "lib/safety/invariants/identity-module.ts"
    threatsMitigated = ["T3.2_identity_theft"]

    async preCheck(ctx: { userStatus: string }): Promise<boolean> {
        return ctx.userStatus !== 'suspended'
    }

    async postCheck(ctx: { userStatus: string }): Promise<boolean> {
        return ctx.userStatus !== 'suspended'
    }

    async rollback(ctx: { userStatus: string }): Promise<void> {
        logger.warn("Action blocked: User account is suspended.")
    }

    async verify(): Promise<boolean> {
        return true
    }
}

export const IDENTITY_INVARIANTS = [
    new AuthRoleInvariant(),
    new RatingUniquenessInvariant(),
    new ReputationNoShowInvariant(),
    new AuthSuspendInvariant()
]
