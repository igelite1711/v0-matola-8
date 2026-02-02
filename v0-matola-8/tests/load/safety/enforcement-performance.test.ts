import { describe, it, expect, beforeEach } from "vitest"
import { invariantEngine } from "../../../lib/safety/invariant-engine"
import { ShipmentWeightInvariant } from "../../../lib/safety/invariants/shipment-module"

describe("Invariant Enforcement Load Test", () => {
    beforeEach(() => {
        invariantEngine.register(new ShipmentWeightInvariant())
    })

    it("should handle 1000 sequential enforcements within 300ms (3,333 req/sec capacity)", async () => {
        const context = { weightKg: 100, vehicleMaxCapacityKg: 500 }
        const action = async () => "ok"

        const start = performance.now()
        for (let i = 0; i < 1000; i++) {
            await invariantEngine.execute(["INV-SHIP-WEIGHT"], context, action, { silent: true })
        }
        const end = performance.now()
        const duration = end - start

        console.log(`Load Test (Silent): 1000 enforcements took ${duration.toFixed(2)}ms`)
        // Target: < 300ms for 1000 calls (0.3ms overhead per call)
        // This easily satisfies the 10 req/sec PRD requirement.
        expect(duration).toBeLessThan(300)
    })
})
