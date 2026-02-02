// Comprehensive Malawi-specific validation utilities

/**
 * Validate Malawi phone number
 * Format: +265 followed by 8 or 9, then 8 more digits
 * Airtel: +265 88X XXX XXX, +265 99X XXX XXX
 * TNM: +265 88X XXX XXX (shared prefix), +265 98X XXX XXX
 */
export function validateMalawiPhone(phone: string): {
  valid: boolean
  provider?: "airtel" | "tnm" | "unknown"
  formatted?: string
  error?: string
} {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "")

  // Check format
  const match = cleaned.match(/^\+265([89])(\d)(\d{7})$/)
  if (!match) {
    return {
      valid: false,
      error: "Invalid format. Use: +265 8XX XXX XXX or +265 9XX XXX XXX",
    }
  }

  const [, firstDigit, secondDigit] = match

  // Determine provider (approximate - some prefixes overlap)
  let provider: "airtel" | "tnm" | "unknown" = "unknown"

  if (firstDigit === "9") {
    // 99X is typically Airtel, 98X is TNM
    provider = secondDigit === "9" ? "airtel" : secondDigit === "8" ? "tnm" : "unknown"
  } else if (firstDigit === "8") {
    // 88X is shared between providers
    provider = "unknown"
  }

  return {
    valid: true,
    provider,
    formatted: cleaned.replace(/(\+265)(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4"),
  }
}

/**
 * Simple boolean phone validation (for compatibility)
 */
export function isValidMalawiPhone(phone: string): boolean {
  return validateMalawiPhone(phone).valid
}

/**
 * Detect mobile money provider from phone number
 */
export function detectMobileMoneyProvider(phone: string): "airtel_money" | "tnm_mpamba" | null {
  const validation = validateMalawiPhone(phone)
  if (!validation.valid) return null

  // Clean and check prefix
  const cleaned = phone.replace(/[\s-]/g, "")
  const normalized = cleaned.startsWith("+265") ? cleaned : `+265${cleaned.replace(/^0/, "")}`

  // Airtel prefixes: 99X, 98X (some), 88X (some)
  if (/^\+26599\d{7}$/.test(normalized)) return "airtel_money"
  if (/^\+26598[0-4]\d{6}$/.test(normalized)) return "tnm_mpamba"
  if (/^\+26598[5-9]\d{6}$/.test(normalized)) return "airtel_money"
  if (/^\+26588[0-4]\d{6}$/.test(normalized)) return "tnm_mpamba"
  if (/^\+26588[5-9]\d{6}$/.test(normalized)) return "airtel_money"

  return null
}

/**
 * Validate Malawi vehicle registration plate
 * Format: XX 1234 (2 letters district code, space, 4 digits)
 */
export function validateVehiclePlate(plate: string): {
  valid: boolean
  district?: string
  formatted?: string
  error?: string
} {
  const DISTRICTS: Record<string, string> = {
    BT: "Blantyre",
    LL: "Lilongwe",
    MZ: "Mzuzu",
    ZA: "Zomba",
    KU: "Kasungu",
    MG: "Mangochi",
    SA: "Salima",
    KA: "Karonga",
    DD: "Dedza",
    NT: "Ntcheu",
    MC: "Mchinji",
    NB: "Nkhotakota",
    MW: "Mwanza",
    ML: "Mulanje",
    RU: "Rumphi",
    CH: "Chikwawa",
    TH: "Thyolo",
    PH: "Phalombe",
    BA: "Balaka",
    DW: "Dowa",
    NK: "Nkhata Bay",
    NS: "Nsanje",
    LW: "Liwonde",
    BL: "Blantyre", // Alternative
    CZ: "Chiradzulu",
    CK: "Chikwawa",
  }

  const normalized = plate.toUpperCase().trim()
  const match = normalized.match(/^([A-Z]{2})\s?(\d{4})$/)

  if (!match) {
    return {
      valid: false,
      error: "Invalid format. Use: XX 1234 (e.g., BT 1234, LL 5678)",
    }
  }

  const [, prefix, number] = match
  const district = DISTRICTS[prefix]

  return {
    valid: true,
    district: district || "Unknown District",
    formatted: `${prefix} ${number}`,
  }
}

/**
 * Simple boolean plate validation (for compatibility)
 */
export function isValidVehiclePlate(plate: string): boolean {
  return validateVehiclePlate(plate).valid
}

/**
 * Parse vehicle plate into components
 */
export function parseVehiclePlate(plate: string): {
  districtCode: string
  districtName: string
  region: "Northern" | "Central" | "Southern"
  number: string
} | null {
  const validation = validateVehiclePlate(plate)
  if (!validation.valid) return null

  const DISTRICT_REGIONS: Record<string, "Northern" | "Central" | "Southern"> = {
    BT: "Southern",
    LL: "Central",
    MZ: "Northern",
    ZA: "Southern",
    KU: "Central",
    MG: "Southern",
    SA: "Central",
    KA: "Northern",
    DD: "Central",
    NT: "Central",
    MC: "Central",
    NB: "Central",
    MW: "Southern",
    ML: "Southern",
    RU: "Northern",
    CH: "Southern",
    TH: "Southern",
    PH: "Southern",
    BA: "Southern",
    DW: "Central",
    NK: "Northern",
    NS: "Southern",
    CZ: "Southern",
  }

  const normalized = plate.toUpperCase().trim()
  const match = normalized.match(/^([A-Z]{2})\s?(\d{4})$/)
  if (!match) return null

  const [, prefix, number] = match

  return {
    districtCode: prefix,
    districtName: validation.district || "Unknown",
    region: DISTRICT_REGIONS[prefix] || "Central",
    number,
  }
}

/**
 * Validate NASFAM membership ID
 * Format: NASFAM-YYYY-NNNNNN
 */
export function validateNasfamId(id: string): {
  valid: boolean
  year?: number
  memberNumber?: string
  error?: string
} {
  const match = id.match(/^NASFAM-(\d{4})-(\d{6})$/)

  if (!match) {
    return {
      valid: false,
      error: "Invalid NASFAM ID format. Use: NASFAM-YYYY-NNNNNN",
    }
  }

  const [, yearStr, memberNumber] = match
  const year = Number.parseInt(yearStr, 10)
  const currentYear = new Date().getFullYear()

  if (year < 1995 || year > currentYear) {
    return {
      valid: false,
      error: `Year must be between 1995 and ${currentYear}`,
    }
  }

  return {
    valid: true,
    year,
    memberNumber,
  }
}

/**
 * Simple boolean NASFAM ID validation
 */
export function isValidNasfamId(id: string): boolean {
  return validateNasfamId(id).valid
}

/**
 * Validate RTOA membership ID
 * Format: RTOA-YYYY-NNNN
 */
export function validateRtoaId(id: string): {
  valid: boolean
  year?: number
  memberNumber?: string
  error?: string
} {
  const match = id.match(/^RTOA-(\d{4})-(\d{4})$/)

  if (!match) {
    return {
      valid: false,
      error: "Invalid RTOA ID format. Use: RTOA-YYYY-NNNN",
    }
  }

  const [, yearStr, memberNumber] = match
  const year = Number.parseInt(yearStr, 10)
  const currentYear = new Date().getFullYear()

  if (year < 2000 || year > currentYear) {
    return {
      valid: false,
      error: `Year must be between 2000 and ${currentYear}`,
    }
  }

  return {
    valid: true,
    year,
    memberNumber,
  }
}

/**
 * Simple boolean RTOA ID validation
 */
export function isValidRtoaId(id: string): boolean {
  return validateRtoaId(id).valid
}

/**
 * Validate Malawi National ID
 * Format varies, but typically alphanumeric
 */
export function validateNationalId(id: string): {
  valid: boolean
  error?: string
} {
  // Malawi national IDs are typically 8-12 characters alphanumeric
  const cleaned = id.replace(/[\s-]/g, "").toUpperCase()

  if (cleaned.length < 8 || cleaned.length > 12) {
    return {
      valid: false,
      error: "National ID should be 8-12 characters",
    }
  }

  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return {
      valid: false,
      error: "National ID should only contain letters and numbers",
    }
  }

  return { valid: true }
}

/**
 * Simple boolean national ID validation
 */
export function isValidNationalId(id: string): boolean {
  return validateNationalId(id).valid
}

/**
 * Format currency in MWK
 */
export function formatMWK(amount: number): string {
  return `MK ${amount.toLocaleString("en-MW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

/**
 * Format currency in MWK with full currency code (alternative format)
 */
export function formatMWKFull(amount: number): string {
  return `MWK ${Math.round(amount).toLocaleString("en-MW")}`
}

/**
 * Format date in Malawi format (DD/MM/YYYY)
 */
export function formatMalawiDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Format date in Malawi format (alias for compatibility)
 */
export function formatDateMalawi(date: Date | string): string {
  return formatMalawiDate(date)
}

/**
 * Get Malawi district from phone prefix
 */
export function getDistrictFromPhone(phone: string): string | null {
  // This is a simplified mapping - in reality would need carrier data
  const validation = validateMalawiPhone(phone)
  if (!validation.valid) return null

  // Most phones don't indicate district, so return null
  // Only useful if we had carrier location data
  return null
}

/**
 * Seasonal cargo information
 */
interface SeasonInfo {
  name: string
  nameNy: string
  months: number[]
  multiplier: number
}

const CARGO_SEASONS: Record<string, SeasonInfo> = {
  tobacco: {
    name: "Tobacco Auction Season",
    nameNy: "Nyengo ya Msika wa Fodya",
    months: [1, 2, 3, 4], // Jan-Apr
    multiplier: 1.4,
  },
  maize: {
    name: "Maize Harvest Season",
    nameNy: "Nyengo ya Kukolola Chimanga",
    months: [4, 5, 6], // Apr-Jun
    multiplier: 1.3,
  },
  tea: {
    name: "Tea Plucking Season",
    nameNy: "Nyengo ya Tiyi",
    months: [9, 10, 11, 12, 1, 2, 3], // Sep-Mar
    multiplier: 1.2,
  },
  sugar: {
    name: "Sugar Cane Harvest",
    nameNy: "Nyengo ya Shuga",
    months: [7, 8, 9, 10], // Jul-Oct
    multiplier: 1.25,
  },
  fertilizer: {
    name: "Fertilizer Import Season",
    nameNy: "Nyengo ya Feteleza",
    months: [9, 10, 11], // Sep-Nov
    multiplier: 1.35,
  },
}

/**
 * Get seasonal cargo multiplier for pricing
 */
export function getSeasonalCargoMultiplier(cargoType: string, date: Date = new Date()): number {
  const season = CARGO_SEASONS[cargoType.toLowerCase()]
  if (!season) return 1.0

  const month = date.getMonth() + 1 // 1-12
  return season.months.includes(month) ? season.multiplier : 1.0
}

/**
 * Get cargo season info if currently in season
 */
export function getCargoSeasonInfo(cargoType: string, date: Date = new Date()): SeasonInfo | null {
  const season = CARGO_SEASONS[cargoType.toLowerCase()]
  if (!season) return null

  const month = date.getMonth() + 1 // 1-12
  return season.months.includes(month) ? season : null
}

/**
 * Validate seasonal cargo timing
 */
export function isInSeason(cargoType: string, date: Date = new Date()): boolean {
  const month = date.toLocaleString("en-US", { month: "long" })

  const SEASONAL_CARGO: Record<string, string[]> = {
    tobacco: ["January", "February", "March", "April"],
    maize: ["April", "May", "June"],
    tea: ["September", "October", "November"],
    sugar: ["July", "August", "September", "October"],
    fertilizer: ["September", "October", "November"],
  }

  const seasons = SEASONAL_CARGO[cargoType.toLowerCase()]
  return seasons ? seasons.includes(month) : true // General cargo always in season
}
