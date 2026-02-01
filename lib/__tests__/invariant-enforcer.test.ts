/**
 * MATOLA Invariant Enforcement Test Suite
 * Tests all critical invariants to ensure they are properly enforced
 */

import { describe, it, expect, beforeEach } from "vitest"
import { ApiError } from "@/lib/api/utils/error-handler"
import {
  UserInvariantEnforcer,
  ShipmentInvariantEnforcer,
  MatchInvariantEnforcer,
  PaymentInvariantEnforcer,
  RatingInvariantEnforcer,
  USSDInvariantEnforcer,
} from "@/lib/invariants/invariant-enforcer"

// ============================================
// USER INVARIANT TESTS
// ============================================

describe("UserInvariantEnforcer", () => {
  describe("Phone Format Validation", () => {
    it("should accept valid Malawi phone numbers", () => {
      expect(() => {
        UserInvariantEnforcer.enforcePhoneFormat("+265999123456")
      }).not.toThrow()
    })

    it("should reject invalid phone formats", () => {
      expect(() => {
        UserInvariantEnforcer.enforcePhoneFormat("0999123456")
      }).toThrow(ApiError)
    })

    it("should reject phone numbers with wrong prefix", () => {
      expect(() => {
        UserInvariantEnforcer.enforcePhoneFormat("+123999123456")
      }).toThrow(ApiError)
    })
  })

  describe("Role Validation", () => {
    it("should accept valid roles", () => {
      const validRoles = [
        "shipper",
        "transporter",
        "broker",
        "admin",
        "support",
      ]
      validRoles.forEach((role) => {
        expect(() => {
          UserInvariantEnforcer.enforceUniqueRole(role)
        }).not.toThrow()
      })
    })

    it("should reject invalid roles", () => {
      expect(() => {
        UserInvariantEnforcer.enforceUniqueRole("invalid_role")
      }).toThrow(ApiError)
    })
  })

  describe("Verification Level Progression", () => {
    it("should allow progression from none to phone", () => {
      expect(() => {
        UserInvariantEnforcer.enforceVerificationProgression("none", "phone")
      }).not.toThrow()
    })

    it("should prevent regression from phone to none", () => {
      expect(() => {
        UserInvariantEnforcer.enforceVerificationProgression("phone", "none")
      }).toThrow(ApiError)
    })

    it("should allow multiple level progression", () => {
      expect(() => {
        UserInvariantEnforcer.enforceVerificationProgression("none", "full")
      }).not.toThrow()
    })
  })
})

// ============================================
// SHIPMENT INVARIANT TESTS
// ============================================

describe("ShipmentInvariantEnforcer", () => {
  describe("Weight Validation", () => {
    it("should accept positive weights", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforcePositiveWeight(100)
      }).not.toThrow()
    })

    it("should reject zero weight", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforcePositiveWeight(0)
      }).toThrow(ApiError)
    })

    it("should reject negative weight", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforcePositiveWeight(-50)
      }).toThrow(ApiError)
    })
  })

  describe("Price Validation", () => {
    it("should accept positive prices", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforcePositivePrice(5000)
      }).not.toThrow()
    })

    it("should accept null/undefined prices", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforcePositivePrice(null)
        ShipmentInvariantEnforcer.enforcePositivePrice(undefined)
      }).not.toThrow()
    })

    it("should reject zero price", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforcePositivePrice(0)
      }).toThrow(ApiError)
    })

    it("should reject negative price", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforcePositivePrice(-1000)
      }).toThrow(ApiError)
    })
  })

  describe("Date Validation", () => {
    it("should accept pickup date today or in future", () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      expect(() => {
        ShipmentInvariantEnforcer.enforcePickupDateNotPast(tomorrow)
      }).not.toThrow()
    })

    it("should reject pickup date in past", () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      expect(() => {
        ShipmentInvariantEnforcer.enforcePickupDateNotPast(yesterday)
      }).toThrow(ApiError)
    })
  })

  describe("Delivery After Pickup", () => {
    it("should accept delivery date after pickup date", () => {
      const pickup = new Date()
      const delivery = new Date(pickup)
      delivery.setDate(delivery.getDate() + 1)

      expect(() => {
        ShipmentInvariantEnforcer.enforceDeliveryAfterPickup(pickup, delivery)
      }).not.toThrow()
    })

    it("should accept same day delivery", () => {
      const pickup = new Date()
      const delivery = new Date(pickup)
      delivery.setHours(delivery.getHours() + 4)

      expect(() => {
        ShipmentInvariantEnforcer.enforceDeliveryAfterPickup(pickup, delivery)
      }).not.toThrow()
    })

    it("should reject delivery before pickup", () => {
      const pickup = new Date()
      const delivery = new Date(pickup)
      delivery.setDate(delivery.getDate() - 1)

      expect(() => {
        ShipmentInvariantEnforcer.enforceDeliveryAfterPickup(pickup, delivery)
      }).toThrow(ApiError)
    })
  })

  describe("Origin and Destination Validation", () => {
    it("should accept different origin and destination", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforceOriginDestinationDifferent(
          "Lilongwe",
          "Blantyre",
        )
      }).not.toThrow()
    })

    it("should reject same origin and destination", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforceOriginDestinationDifferent(
          "Lilongwe",
          "lilongwe",
        )
      }).toThrow(ApiError)
    })

    it("should be case-insensitive", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforceOriginDestinationDifferent(
          "LILONGWE",
          "lilongwe",
        )
      }).toThrow(ApiError)
    })
  })

  describe("Status Transition Validation", () => {
    it("should allow draft to pending", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforceStatusTransition("draft", "pending")
      }).not.toThrow()
    })

    it("should allow pending to in_transit", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforceStatusTransition(
          "pending",
          "in_transit",
        )
      }).not.toThrow()
    })

    it("should not allow skipping states", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforceStatusTransition("draft", "completed")
      }).toThrow(ApiError)
    })

    it("should not allow transitions from completed", () => {
      expect(() => {
        ShipmentInvariantEnforcer.enforceStatusTransition(
          "completed",
          "in_transit",
        )
      }).toThrow(ApiError)
    })
  })
})

// ============================================
// MATCH INVARIANT TESTS
// ============================================

describe("MatchInvariantEnforcer", () => {
  describe("Match Score Validation", () => {
    it("should accept scores between 0 and 100", () => {
      expect(() => {
        MatchInvariantEnforcer.enforceScoreRange(50)
      }).not.toThrow()
    })

    it("should accept edge case 0", () => {
      expect(() => {
        MatchInvariantEnforcer.enforceScoreRange(0)
      }).not.toThrow()
    })

    it("should accept edge case 100", () => {
      expect(() => {
        MatchInvariantEnforcer.enforceScoreRange(100)
      }).not.toThrow()
    })

    it("should reject negative scores", () => {
      expect(() => {
        MatchInvariantEnforcer.enforceScoreRange(-1)
      }).toThrow(ApiError)
    })

    it("should reject scores above 100", () => {
      expect(() => {
        MatchInvariantEnforcer.enforceScoreRange(101)
      }).toThrow(ApiError)
    })
  })

  describe("Price Inflation Limit", () => {
    it("should accept prices up to 150% of shipment price", () => {
      expect(() => {
        MatchInvariantEnforcer.enforcePriceInflationLimit(10000, 15000)
      }).not.toThrow()
    })

    it("should reject prices above 150%", () => {
      expect(() => {
        MatchInvariantEnforcer.enforcePriceInflationLimit(10000, 15001)
      }).toThrow(ApiError)
    })

    it("should accept equal prices", () => {
      expect(() => {
        MatchInvariantEnforcer.enforcePriceInflationLimit(10000, 10000)
      }).not.toThrow()
    })
  })
})

// ============================================
// PAYMENT INVARIANT TESTS
// ============================================

describe("PaymentInvariantEnforcer", () => {
  describe("Amount Validation", () => {
    it("should accept positive amounts", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforcePositiveAmount(5000)
      }).not.toThrow()
    })

    it("should reject zero amount", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforcePositiveAmount(0)
      }).toThrow(ApiError)
    })

    it("should reject negative amounts", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforcePositiveAmount(-1000)
      }).toThrow(ApiError)
    })
  })

  describe("Platform Fee Validation", () => {
    it("should accept fees up to 10%", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforceFeeLimit(10000, 1000)
      }).not.toThrow()
    })

    it("should reject fees above 10%", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforceFeeLimit(10000, 1001)
      }).toThrow(ApiError)
    })

    it("should accept zero fee", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforceFeeLimit(10000, 0)
      }).not.toThrow()
    })
  })

  describe("Net Amount Calculation", () => {
    it("should accept correct net amount", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforceNetAmountCalculation(10000, 1000, 9000)
      }).not.toThrow()
    })

    it("should reject incorrect net amount", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforceNetAmountCalculation(10000, 1000, 8500)
      }).toThrow(ApiError)
    })

    it("should allow small rounding errors", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforceNetAmountCalculation(10000, 1000, 8999.99)
      }).not.toThrow()
    })
  })

  describe("Double-Release Prevention", () => {
    it("should prevent double release of escrow", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforceNoDubleRelease("released")
      }).toThrow(ApiError)
    })

    it("should allow release when not yet released", () => {
      expect(() => {
        PaymentInvariantEnforcer.enforceNoDubleRelease("held")
      }).not.toThrow()
    })
  })
})

// ============================================
// RATING INVARIANT TESTS
// ============================================

describe("RatingInvariantEnforcer", () => {
  describe("Rating Value Validation", () => {
    it("should accept ratings 1-5", () => {
      for (let i = 1; i <= 5; i++) {
        expect(() => {
          RatingInvariantEnforcer.enforceValidRating(i)
        }).not.toThrow()
      }
    })

    it("should reject ratings below 1", () => {
      expect(() => {
        RatingInvariantEnforcer.enforceValidRating(0)
      }).toThrow(ApiError)
    })

    it("should reject ratings above 5", () => {
      expect(() => {
        RatingInvariantEnforcer.enforceValidRating(6)
      }).toThrow(ApiError)
    })

    it("should reject decimal ratings", () => {
      expect(() => {
        RatingInvariantEnforcer.enforceValidRating(3.5)
      }).toThrow(ApiError)
    })
  })

  describe("Self-Rating Prevention", () => {
    it("should prevent self-rating", () => {
      expect(() => {
        RatingInvariantEnforcer.enforceNotSelfRating("user-1", "user-1")
      }).toThrow(ApiError)
    })

    it("should allow rating another user", () => {
      expect(() => {
        RatingInvariantEnforcer.enforceNotSelfRating("user-1", "user-2")
      }).not.toThrow()
    })
  })

  describe("Completed Shipment Requirement", () => {
    it("should allow ratings only for completed shipments", () => {
      expect(() => {
        RatingInvariantEnforcer.enforceCompletedShipment("completed")
      }).not.toThrow()
    })

    it("should prevent ratings for pending shipments", () => {
      expect(() => {
        RatingInvariantEnforcer.enforceCompletedShipment("pending")
      }).toThrow(ApiError)
    })

    it("should prevent ratings for in-transit shipments", () => {
      expect(() => {
        RatingInvariantEnforcer.enforceCompletedShipment("in_transit")
      }).toThrow(ApiError)
    })
  })
})

// ============================================
// USSD INVARIANT TESTS
// ============================================

describe("USSDInvariantEnforcer", () => {
  describe("State Validation", () => {
    it("should accept valid USSD states", () => {
      const validStates = ["welcome", "menu_main", "auth_phone", "exit"]
      validStates.forEach((state) => {
        expect(() => {
          USSDInvariantEnforcer.enforceValidState(state)
        }).not.toThrow()
      })
    })

    it("should reject invalid states", () => {
      expect(() => {
        USSDInvariantEnforcer.enforceValidState("invalid_state")
      }).toThrow(ApiError)
    })
  })

  describe("Response Length Validation", () => {
    it("should accept responses up to 160 characters", () => {
      const response = "a".repeat(160)
      expect(() => {
        USSDInvariantEnforcer.enforceResponseLength(response)
      }).not.toThrow()
    })

    it("should reject responses exceeding 160 characters", () => {
      const response = "a".repeat(161)
      expect(() => {
        USSDInvariantEnforcer.enforceResponseLength(response)
      }).toThrow(ApiError)
    })
  })

  describe("Context JSON Validation", () => {
    it("should accept valid JSON context", () => {
      const context = JSON.stringify({ step: 1, data: "test" })
      expect(() => {
        USSDInvariantEnforcer.enforceContextJSON(context)
      }).not.toThrow()
    })

    it("should accept null context", () => {
      expect(() => {
        USSDInvariantEnforcer.enforceContextJSON(null)
      }).not.toThrow()
    })

    it("should reject invalid JSON context", () => {
      expect(() => {
        USSDInvariantEnforcer.enforceContextJSON("{invalid json}")
      }).toThrow(ApiError)
    })
  })
})
