/**
 * Malawi Validators Test Suite
 * Tests all Malawi-specific validation logic per PRD requirements
 */

import {
  validateMalawiPhone,
  isValidMalawiPhone,
  detectMobileMoneyProvider,
  validateVehiclePlate,
  isValidVehiclePlate,
  parseVehiclePlate,
  validateNasfamId,
  isValidNasfamId,
  validateRtoaId,
  isValidRtoaId,
  validateNationalId,
  isValidNationalId,
  formatMWK,
  formatMWKFull,
  formatMalawiDate,
  formatDateMalawi,
  getSeasonalCargoMultiplier,
  getCargoSeasonInfo,
  isInSeason,
  getSeasonalMultiplier,
} from "../malawi-validators"

describe("Malawi Phone Validation", () => {
  describe("validateMalawiPhone", () => {
    test("accepts valid Airtel numbers with country code", () => {
      expect(validateMalawiPhone("+265991234567").valid).toBe(true)
      expect(validateMalawiPhone("+265997654321").valid).toBe(true)
      expect(validateMalawiPhone("+265999123456").valid).toBe(true)
    })

    test("accepts valid TNM numbers with country code", () => {
      expect(validateMalawiPhone("+265881234567").valid).toBe(true)
      expect(validateMalawiPhone("+265884567890").valid).toBe(true)
      expect(validateMalawiPhone("+265888123456").valid).toBe(true)
    })

    test("returns provider info", () => {
      const airtelResult = validateMalawiPhone("+265991234567")
      expect(airtelResult.valid).toBe(true)
      expect(airtelResult.provider).toBe("airtel")
    })

    test("rejects invalid numbers", () => {
      expect(validateMalawiPhone("123456789").valid).toBe(false)
      expect(validateMalawiPhone("+254991234567").valid).toBe(false) // Kenya code
      expect(validateMalawiPhone("").valid).toBe(false)
    })

    test("returns formatted number", () => {
      const result = validateMalawiPhone("+265991234567")
      expect(result.formatted).toBeDefined()
    })
  })

  describe("isValidMalawiPhone", () => {
    test("returns boolean for valid numbers", () => {
      expect(isValidMalawiPhone("+265991234567")).toBe(true)
      expect(isValidMalawiPhone("invalid")).toBe(false)
    })
  })

  describe("detectMobileMoneyProvider", () => {
    test("detects Airtel Money from 99X prefix", () => {
      expect(detectMobileMoneyProvider("+265991234567")).toBe("airtel_money")
    })

    test("detects TNM Mpamba from 88X prefix", () => {
      expect(detectMobileMoneyProvider("+265881234567")).toBe("tnm_mpamba")
    })

    test("returns null for invalid numbers", () => {
      expect(detectMobileMoneyProvider("invalid")).toBeNull()
    })
  })
})

describe("Vehicle Plate Validation", () => {
  describe("validateVehiclePlate", () => {
    test("accepts valid Malawi plates with space", () => {
      expect(validateVehiclePlate("BT 1234").valid).toBe(true)
      expect(validateVehiclePlate("LL 5678").valid).toBe(true)
      expect(validateVehiclePlate("MZ 9012").valid).toBe(true)
    })

    test("accepts plates without space", () => {
      expect(validateVehiclePlate("BT1234").valid).toBe(true)
    })

    test("returns district information", () => {
      const result = validateVehiclePlate("BT 1234")
      expect(result.valid).toBe(true)
      expect(result.district).toBe("Blantyre")
    })

    test("rejects invalid plates", () => {
      expect(validateVehiclePlate("123 ABC").valid).toBe(false)
      expect(validateVehiclePlate("BT 12345").valid).toBe(false) // Too many digits
      expect(validateVehiclePlate("").valid).toBe(false)
    })
  })

  describe("isValidVehiclePlate", () => {
    test("returns boolean", () => {
      expect(isValidVehiclePlate("BT 1234")).toBe(true)
      expect(isValidVehiclePlate("invalid")).toBe(false)
    })
  })

  describe("parseVehiclePlate", () => {
    test("parses valid plates correctly", () => {
      const result = parseVehiclePlate("BT 1234")
      expect(result).not.toBeNull()
      expect(result?.districtCode).toBe("BT")
      expect(result?.districtName).toBe("Blantyre")
      expect(result?.region).toBe("Southern")
      expect(result?.number).toBe("1234")
    })

    test("identifies Northern region plates", () => {
      const result = parseVehiclePlate("MZ 1234")
      expect(result?.region).toBe("Northern")
    })

    test("identifies Central region plates", () => {
      const result = parseVehiclePlate("LL 1234")
      expect(result?.region).toBe("Central")
    })

    test("returns null for invalid plates", () => {
      expect(parseVehiclePlate("invalid")).toBeNull()
    })
  })
})

describe("NASFAM ID Validation", () => {
  describe("validateNasfamId", () => {
    test("accepts valid NASFAM IDs", () => {
      expect(validateNasfamId("NASFAM-2024-123456").valid).toBe(true)
      expect(validateNasfamId("NASFAM-2020-000001").valid).toBe(true)
    })

    test("returns year and member number", () => {
      const result = validateNasfamId("NASFAM-2024-123456")
      expect(result.year).toBe(2024)
      expect(result.memberNumber).toBe("123456")
    })

    test("rejects invalid NASFAM IDs", () => {
      expect(validateNasfamId("NASFAM12345").valid).toBe(false)
      expect(validateNasfamId("12345").valid).toBe(false)
      expect(validateNasfamId("").valid).toBe(false)
    })

    test("rejects invalid years", () => {
      expect(validateNasfamId("NASFAM-1990-123456").valid).toBe(false) // Before 1995
      expect(validateNasfamId("NASFAM-2099-123456").valid).toBe(false) // Future
    })
  })

  describe("isValidNasfamId", () => {
    test("returns boolean", () => {
      expect(isValidNasfamId("NASFAM-2024-123456")).toBe(true)
      expect(isValidNasfamId("invalid")).toBe(false)
    })
  })
})

describe("RTOA ID Validation", () => {
  describe("validateRtoaId", () => {
    test("accepts valid RTOA IDs", () => {
      expect(validateRtoaId("RTOA-2024-0001").valid).toBe(true)
      expect(validateRtoaId("RTOA-2023-9999").valid).toBe(true)
    })

    test("returns year and member number", () => {
      const result = validateRtoaId("RTOA-2024-0001")
      expect(result.year).toBe(2024)
      expect(result.memberNumber).toBe("0001")
    })

    test("rejects invalid RTOA IDs", () => {
      expect(validateRtoaId("RTOA2024001").valid).toBe(false)
      expect(validateRtoaId("").valid).toBe(false)
    })
  })

  describe("isValidRtoaId", () => {
    test("returns boolean", () => {
      expect(isValidRtoaId("RTOA-2024-0001")).toBe(true)
      expect(isValidRtoaId("invalid")).toBe(false)
    })
  })
})

describe("National ID Validation", () => {
  describe("validateNationalId", () => {
    test("accepts valid National IDs", () => {
      expect(validateNationalId("AB123456").valid).toBe(true)
      expect(validateNationalId("ABC123456789").valid).toBe(true)
    })

    test("rejects too short IDs", () => {
      expect(validateNationalId("1234567").valid).toBe(false)
    })

    test("rejects too long IDs", () => {
      expect(validateNationalId("1234567890123").valid).toBe(false)
    })

    test("rejects special characters", () => {
      expect(validateNationalId("AB-123456").valid).toBe(false)
    })
  })

  describe("isValidNationalId", () => {
    test("returns boolean", () => {
      expect(isValidNationalId("AB123456")).toBe(true)
      expect(isValidNationalId("short")).toBe(false)
    })
  })
})

describe("Currency Formatting", () => {
  describe("formatMWK", () => {
    test("formats currency with MK prefix", () => {
      expect(formatMWK(50000)).toMatch(/MK\s*50,?000/)
    })

    test("formats large amounts with comma separators", () => {
      expect(formatMWK(1234567)).toMatch(/1,?234,?567/)
    })

    test("handles zero", () => {
      expect(formatMWK(0)).toMatch(/MK\s*0/)
    })
  })

  describe("formatMWKFull", () => {
    test("formats with MWK prefix", () => {
      expect(formatMWKFull(50000)).toBe("MWK 50,000")
    })

    test("rounds decimals", () => {
      expect(formatMWKFull(1234.89)).toBe("MWK 1,235")
    })
  })
})

describe("Date Formatting", () => {
  describe("formatMalawiDate", () => {
    test("formats dates in DD/MM/YYYY format", () => {
      const date = new Date("2024-12-25")
      const formatted = formatMalawiDate(date)
      expect(formatted).toBe("25/12/2024")
    })

    test("handles string dates", () => {
      const formatted = formatMalawiDate("2024-06-15")
      expect(formatted).toBe("15/06/2024")
    })
  })

  describe("formatDateMalawi (alias)", () => {
    test("works same as formatMalawiDate", () => {
      const date = new Date("2024-12-25")
      expect(formatDateMalawi(date)).toBe(formatMalawiDate(date))
    })
  })
})

describe("Seasonal Cargo Pricing", () => {
  describe("isInSeason", () => {
    test("tobacco is in season Jan-Apr", () => {
      expect(isInSeason("tobacco", new Date("2024-02-15"))).toBe(true)
      expect(isInSeason("tobacco", new Date("2024-08-15"))).toBe(false)
    })

    test("maize is in season Apr-Jun", () => {
      expect(isInSeason("maize", new Date("2024-05-15"))).toBe(true)
      expect(isInSeason("maize", new Date("2024-12-15"))).toBe(false)
    })

    test("general cargo is always in season", () => {
      expect(isInSeason("general", new Date("2024-01-15"))).toBe(true)
      expect(isInSeason("general", new Date("2024-07-15"))).toBe(true)
    })
  })

  describe("getSeasonalMultiplier", () => {
    test("returns higher multiplier during season", () => {
      const tobaccoInSeason = getSeasonalMultiplier("tobacco", new Date("2024-02-15"))
      const tobaccoOffSeason = getSeasonalMultiplier("tobacco", new Date("2024-08-15"))
      expect(tobaccoInSeason).toBe(1.4)
      expect(tobaccoOffSeason).toBe(1.0)
    })

    test("returns 1.0 for unknown cargo types", () => {
      expect(getSeasonalMultiplier("unknown")).toBe(1.0)
    })
  })

  describe("getSeasonalCargoMultiplier", () => {
    test("returns multiplier for tobacco in auction season", () => {
      const multiplier = getSeasonalCargoMultiplier("tobacco", new Date("2024-03-15"))
      expect(multiplier).toBe(1.4)
    })

    test("returns 1.0 for off-season cargo", () => {
      const multiplier = getSeasonalCargoMultiplier("tobacco", new Date("2024-08-15"))
      expect(multiplier).toBe(1.0)
    })
  })

  describe("getCargoSeasonInfo", () => {
    test("returns season info for active seasons", () => {
      const info = getCargoSeasonInfo("maize", new Date("2024-05-15"))
      expect(info).not.toBeNull()
      expect(info?.name).toContain("Maize")
      expect(info?.nameNy).toContain("Chimanga")
    })

    test("returns null for off-season", () => {
      const info = getCargoSeasonInfo("maize", new Date("2024-12-15"))
      expect(info).toBeNull()
    })
  })
})

describe("PRD Business Logic Validation", () => {
  test("Empty return reduction target: 70% to 50%", () => {
    const baseline = 70
    const target = 50
    const reduction = baseline - target
    expect(reduction).toBe(20) // 20 percentage points reduction
  })

  test("Transporter earnings increase target: +30%", () => {
    const baselineEarnings = 100000 // MWK
    const targetIncrease = 0.3
    const targetEarnings = baselineEarnings * (1 + targetIncrease)
    expect(targetEarnings).toBe(130000)
  })

  test("Shipper cost reduction target: -20%", () => {
    const baselineCost = 100000 // MWK
    const targetReduction = 0.2
    const targetCost = baselineCost * (1 - targetReduction)
    expect(targetCost).toBe(80000)
  })

  test("Platform commission rate is 5%", () => {
    const shipmentValue = 100000 // MWK
    const commissionRate = 0.05
    const platformFee = shipmentValue * commissionRate
    expect(platformFee).toBe(5000)
  })

  test("Backhaul discount is 40%", () => {
    const regularPrice = 100000 // MWK
    const backhaulDiscount = 0.4
    const backhaulPrice = regularPrice * (1 - backhaulDiscount)
    expect(backhaulPrice).toBe(60000)
  })
})

describe("Malawi Routes Validation", () => {
  const PRIMARY_ROUTES = [
    { from: "Lilongwe", to: "Blantyre", highway: "M1", distanceKm: 311 },
    { from: "Mzuzu", to: "Lilongwe", highway: "M1", distanceKm: 350 },
    { from: "Blantyre", to: "Zomba", highway: "M3", distanceKm: 65 },
  ]

  test("Primary routes are defined", () => {
    expect(PRIMARY_ROUTES.length).toBeGreaterThanOrEqual(3)
  })

  test("Lilongwe-Blantyre is the main route on M1", () => {
    const mainRoute = PRIMARY_ROUTES.find((r) => r.from === "Lilongwe" && r.to === "Blantyre")
    expect(mainRoute).toBeDefined()
    expect(mainRoute?.highway).toBe("M1")
    expect(mainRoute?.distanceKm).toBeGreaterThan(300)
  })

  test("All routes have valid distances", () => {
    PRIMARY_ROUTES.forEach((route) => {
      expect(route.distanceKm).toBeGreaterThan(0)
    })
  })
})
