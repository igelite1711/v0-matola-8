import { describe, it, expect } from "vitest"
import { SHIPMENT_TO_WALLET_BOUNDARY } from "../../../lib/safety/boundaries"
import { PriceMinTruckInvariant } from "../../../lib/safety/invariants/wallet-module"

describe("Module Boundary Integration", () => {
    it("should enforce the contract when data crosses the Shipment -> Wallet boundary", async () => {
        // Setup the boundary contract
        const priceInv = new PriceMinTruckInvariant()
        SHIPMENT_TO_WALLET_BOUNDARY.addContract(priceInv)

        // Invalid data: Heavy vehicle with low price
        const invalidData = { vehicleType: 'tanker', price: 5000 }
        const failedResult = await SHIPMENT_TO_WALLET_BOUNDARY.verifyContract(invalidData)
        expect(failedResult).toBe(false)

        // Valid data
        const validData = { vehicleType: 'tanker', price: 30000 }
        const successResult = await SHIPMENT_TO_WALLET_BOUNDARY.verifyContract(validData)
        expect(successResult).toBe(true)
    })
})
