import { invariantEngine } from "./invariant-engine"
import { SHIPMENT_INVARIANTS } from "./invariants/shipment-module"
import { WALLET_INVARIANTS } from "./invariants/wallet-module"
import { USSD_INVARIANTS } from "./invariants/ussd-module"
import { IDENTITY_INVARIANTS } from "./invariants/identity-module"
import { logger } from "@/lib/monitoring/logger"

/**
 * Initializes the safety layer by registering all module invariants.
 * This should be called once during system startup.
 */
export function initializeSafetyLayer() {
    logger.info("Initializing Safety Layer: Registering all invariants...")

    const allInvariants = [
        ...SHIPMENT_INVARIANTS,
        ...WALLET_INVARIANTS,
        ...USSD_INVARIANTS,
        ...IDENTITY_INVARIANTS
    ]

    allInvariants.forEach(inv => {
        invariantEngine.register(inv)
    })

    logger.info(`Safety Layer Initialized: ${allInvariants.length} invariants active.`)
}
