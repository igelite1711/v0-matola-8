import { describe, it, expect, beforeEach } from "vitest"
import { createEscrowHold, getWallet, initializeWallet } from "../../../lib/wallet-engine"
import { initializeSafetyLayer } from "../../../lib/safety/registry"

describe("Enforced Wallet Engine Integration", () => {
    const SHIPPER_ID = "shipper-1"
    const TRANSPORTER_ID = "transporter-1"

    beforeEach(() => {
        initializeSafetyLayer()
        initializeWallet(SHIPPER_ID)
    })

    it("should BLOCK escrow creation if balance is insufficient (Digital Payment)", async () => {
        const wallet = getWallet(SHIPPER_ID)
        wallet.availableBalance = 1000 // Only 1,000 MWK

        // Attempting to hold 50,000 MWK
        await expect(
            createEscrowHold("ship-1", SHIPPER_ID, TRANSPORTER_ID, 50000, "large_truck", "digital")
        ).rejects.toThrow("INV-ESCROW-SOLVENCY")

        // State verify: No partial deduction or escrow balance change
        expect(wallet.escrowBalance).toBe(0)
    })

    it("should BLOCK escrow creation if price is below minimum for heavy truck", async () => {
        const wallet = getWallet(SHIPPER_ID)
        wallet.availableBalance = 100000

        // Attempting to hold 5,000 MWK for a tanker (Min 25,000)
        await expect(
            createEscrowHold("ship-2", SHIPPER_ID, TRANSPORTER_ID, 5000, "tanker", "digital")
        ).rejects.toThrow("INV-PRICE-MIN-TRUCK")
    })

    it("should ALLOW escrow creation when invariants are met", async () => {
        const wallet = getWallet(SHIPPER_ID)
        wallet.availableBalance = 100000

        const escrow = await createEscrowHold("ship-3", SHIPPER_ID, TRANSPORTER_ID, 50000, "large_truck", "digital")

        expect(escrow.status).toBe("held")
        expect(wallet.escrowBalance).toBe(50000)
    })
})
