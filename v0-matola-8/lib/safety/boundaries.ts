import { logger } from "@/lib/monitoring/logger"
import { Invariant } from "./invariant-engine"

/**
 * Enforces contracts between modules (e.g., Shipment -> Wallet)
 */
export class ModuleBoundary {
    private contractInvariants: Invariant[] = []

    constructor(
        public readonly source: string,
        public readonly target: string
    ) { }

    public addContract(invariant: Invariant) {
        this.contractInvariants.push(invariant)
    }

    /**
     * Verifies that data crossing the boundary satisfies the contract
     */
    public async verifyContract(data: any): Promise<boolean> {
        logger.info(`Verifying boundary contract: ${this.source} -> ${this.target}`)

        for (const inv of this.contractInvariants) {
            const passed = await inv.preCheck(data)
            if (!passed) {
                logger.error(`Boundary Contract Violation: ${this.source} -> ${this.target}`, {
                    invariantId: inv.id,
                    statement: inv.statement
                })
                return false
            }
        }

        return true
    }
}

// Define Inter-module Boundaries
export const SHIPMENT_TO_WALLET_BOUNDARY = new ModuleBoundary("shipment", "wallet")
export const WALLET_TO_SHIPMENT_BOUNDARY = new ModuleBoundary("wallet", "shipment")
export const USSD_TO_IDENTITY_BOUNDARY = new ModuleBoundary("ussd", "identity")
