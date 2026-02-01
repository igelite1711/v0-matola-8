// Phone number validation for Malawi (+265 or 0)
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.length === 9 || (cleaned.length === 12 && cleaned.startsWith("265"))
}

// PIN validation (4 digits)
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

// Full name validation
export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 100
}

// Shipment weight validation (kg)
export function isValidWeight(weight: number): boolean {
  return weight > 0 && weight <= 50000 && Number.isInteger(weight)
}

// Price validation (MWK)
export function isValidPrice(price: number): boolean {
  return price > 0 && price <= 10000000
}

// Format phone number to Malawi format
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 9) {
    return `+265 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  if (cleaned.length === 12 && cleaned.startsWith("265")) {
    const withoutCountry = cleaned.slice(3)
    return `+265 ${withoutCountry.slice(0, 3)} ${withoutCountry.slice(3, 6)} ${withoutCountry.slice(6)}`
  }
  return phone
}

// Format currency to MWK
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: "MWK",
    minimumFractionDigits: 0,
  }).format(amount)
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  const div = document.createElement("div")
  div.textContent = input
  return div.innerHTML
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  isStrong: boolean
  score: number
  feedback: string
} {
  let score = 0
  let feedback = ""

  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score < 2) feedback = "Too weak"
  else if (score < 4) feedback = "Fair"
  else if (score < 5) feedback = "Good"
  else feedback = "Strong"

  return {
    isStrong: score >= 4,
    score,
    feedback,
  }
}

// Generate random PIN for demo
export function generateRandomPin(): string {
  return Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
}
