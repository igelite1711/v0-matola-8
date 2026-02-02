import { describe, it, expect, beforeEach, vi } from "vitest"
import { invariantEngine } from "../../../lib/safety/invariant-engine"
import { ShipmentWeightInvariant, WeightContext } from "../../../lib/safety/invariants/shipment-module"
import { AuthRoleInvariant, AuthContext } from "../../../lib/safety/invariants/identity-module"

describe("Invariant Enforcement Layer", () => {
    beforeEach(() => {
        // Clear registrations if needed, or re-register
        invariantEngine.register(new ShipmentWeightInvariant())
        invariantEngine.register(new AuthRoleInvariant())
    })

    describe("Unit Tests (Isolation)", () => {
        it("should block action if PRE-CHECK fails (Weight violation)", async () => {
            const context: WeightContext = { weightKg: 1000, vehicleMaxCapacityKg: 500 }
            const action = vi.fn().mockResolvedValue("Success")

            await expect(
                invariantEngine.execute(["INV-SHIP-WEIGHT"], context, action)
            ).rejects.toThrow("Invariant violation (PRE): INV-SHIP-WEIGHT")

            expect(action).not.toHaveBeenCalled()
        })

        it("should allow action if PRE and POST checks pass", async () => {
            const context: WeightContext = { weightKg: 400, vehicleMaxCapacityKg: 500 }
            const action = vi.fn().mockResolvedValue("Action Complete")

            const result = await invariantEngine.execute(["INV-SHIP-WEIGHT"], context, action)

            expect(result).toBe("Action Complete")
            expect(action).toHaveBeenCalledWith(context)
        })
    })

    describe("Composition Tests (Chained Invariants)", () => {
        it("should pass when both Auth and weight invariants are satisfied", async () => {
            const context = {
                userRole: "shipper",
                action: "POST_SHIPMENT",
                requiredRoleMap: { "POST_SHIPMENT": "shipper" },
                weightKg: 400,
                vehicleMaxCapacityKg: 500
            }
            const action = vi.fn().mockResolvedValue("Shipment Posted")

            const result = await invariantEngine.execute(
                ["INV-AUTH-ROLE", "INV-SHIP-WEIGHT"],
                context as AuthContext & WeightContext,
                action
            )

            expect(result).toBe("Shipment Posted")
        })

        it("should fail if the second invariant in the chain is violated", async () => {
            const context = {
                userRole: "shipper",
                action: "POST_SHIPMENT",
                requiredRoleMap: { "POST_SHIPMENT": "shipper" },
                weightKg: 1000, // Invalid
                vehicleMaxCapacityKg: 500
            }
            const action = vi.fn().mockResolvedValue("Shipment Posted")

            await expect(
                invariantEngine.execute(
                    ["INV-AUTH-ROLE", "INV-SHIP-WEIGHT"],
                    context as AuthContext & WeightContext,
                    action
                )
            ).rejects.toThrow("INV-SHIP-WEIGHT")
        })
    })

    describe("Failure & Rollback Tests", () => {
        it("should trigger rollback if the action itself throws", async () => {
            const context: WeightContext = { weightKg: 400, vehicleMaxCapacityKg: 500 }
            const weightInv = new ShipmentWeightInvariant()
            const rollbackSpy = vi.spyOn(weightInv, "rollback")

            invariantEngine.register(weightInv)

            const action = vi.fn().mockRejectedValue(new Error("Database Failure"))

            await expect(
                invariantEngine.execute(["INV-SHIP-WEIGHT"], context, action)
            ).rejects.toThrow("Database Failure")

            expect(rollbackSpy).toHaveBeenCalled()
        })
    })
})
