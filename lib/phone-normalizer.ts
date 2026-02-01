// Phone Number Normalization - Ensures consistent phone formats
// "+265790123456" and "0790123456" are treated as the same user

const MALAWI_COUNTRY_CODE = "265"
const MALAWI_PREFIXES = ["265", "+265", "00265"]

export class PhoneNormalizer {
  /**
   * Normalize phone number to standard format: +265XXXXXXXXX
   */
  static normalize(phone: string): string {
    if (!phone) throw new Error("Phone number required")

    // Remove all non-digit characters except leading +
    let cleaned = phone.replace(/[^\d+]/g, "")

    // Remove leading +
    cleaned = cleaned.replace(/^\+/, "")

    // Remove country code if present
    for (const prefix of MALAWI_PREFIXES) {
      if (cleaned.startsWith(prefix.replace(/^\+/, ""))) {
        cleaned = cleaned.slice(prefix.replace(/^\+/, "").length)
        break
      }
    }

    // Handle local format (0-prefix)
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1)
    }

    // Validate length (should be 9-10 digits after country code)
    if (cleaned.length < 9 || cleaned.length > 10) {
      throw new Error(`Invalid phone number format: ${phone}`)
    }

    // Return standardized format
    return `+${MALAWI_COUNTRY_CODE}${cleaned}`
  }

  /**
   * Get various formats of same phone number
   */
  static getAllFormats(phone: string): string[] {
    const normalized = this.normalize(phone)
    const withoutPrefix = normalized.slice(4) // Remove "+265"
    const withZero = `0${withoutPrefix}`

    return [normalized, withoutPrefix, withZero]
  }

  /**
   * Check if two phone numbers are the same
   */
  static isSame(phone1: string, phone2: string): boolean {
    try {
      return this.normalize(phone1) === this.normalize(phone2)
    } catch {
      return false
    }
  }

  /**
   * Validate phone format
   */
  static isValid(phone: string): boolean {
    try {
      this.normalize(phone)
      return true
    } catch {
      return false
    }
  }
}
