// Mobile Money Integration for Malawi
// Supports Airtel Money and TNM Mpamba

export type MobileMoneyProvider = "airtel" | "tnm"

export interface MobileMoneyTransaction {
  id: string
  provider: MobileMoneyProvider
  type: "deposit" | "withdrawal" | "payment" | "refund"
  amount: number // In MWK (Malawian Kwacha)
  phone: string
  reference: string
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: Date
  completedAt?: Date
  failureReason?: string
}

export interface WalletBalance {
  available: number
  pending: number
  currency: "MWK"
}

// Phone number prefixes to determine provider
const AIRTEL_PREFIXES = ["099", "088", "098"]
const TNM_PREFIXES = [
  "0881",
  "0882",
  "0883",
  "0884",
  "0885",
  "0886",
  "0887",
  "0888",
  "0889",
  "0991",
  "0992",
  "0993",
  "0994",
  "0995",
  "0996",
  "0997",
  "0998",
  "0999",
]

export function detectProvider(phone: string): MobileMoneyProvider | null {
  const cleaned = phone.replace(/\s/g, "").replace(/^\+265/, "0")

  // Check TNM first (more specific prefixes)
  if (TNM_PREFIXES.some((prefix) => cleaned.startsWith(prefix))) {
    return "tnm"
  }

  // Check Airtel
  if (AIRTEL_PREFIXES.some((prefix) => cleaned.startsWith(prefix))) {
    return "airtel"
  }

  return null
}

export function formatMWK(amount: number): string {
  return `MK ${amount.toLocaleString()}`
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, "").replace(/^\+265/, "0")
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

// USSD codes for mobile money
export const USSD_CODES = {
  airtel: {
    checkBalance: "*778#",
    sendMoney: "*778#",
    withdraw: "*778#",
    buyAirtime: "*778#",
  },
  tnm: {
    checkBalance: "*212#",
    sendMoney: "*212#",
    withdraw: "*212#",
    buyAirtime: "*212#",
  },
}

// Payment instructions in Chichewa
export const PAYMENT_INSTRUCTIONS = {
  airtel: {
    en: [
      "Dial *778#",
      "Select 'Send Money'",
      "Enter Matola number: 0999123456",
      "Enter amount",
      "Enter your PIN",
      "Confirm payment",
    ],
    ny: [
      "Dinani *778#",
      "Sankhani 'Tumiza Ndalama'",
      "Lembani nambala ya Matola: 0999123456",
      "Lembani ndalama",
      "Lembani PIN yanu",
      "Tsimikizani malipiro",
    ],
  },
  tnm: {
    en: [
      "Dial *212#",
      "Select 'Mpamba'",
      "Select 'Send Money'",
      "Enter Matola number: 0888123456",
      "Enter amount",
      "Enter your PIN",
    ],
    ny: [
      "Dinani *212#",
      "Sankhani 'Mpamba'",
      "Sankhani 'Tumiza Ndalama'",
      "Lembani nambala ya Matola: 0888123456",
      "Lembani ndalama",
      "Lembani PIN yanu",
    ],
  },
}

// Mock API functions (in production, these connect to real payment APIs)
export async function initiateDeposit(
  phone: string,
  amount: number,
  provider?: MobileMoneyProvider,
): Promise<{ transactionId: string; ussdPrompt?: string }> {
  const detectedProvider = provider || detectProvider(phone)
  if (!detectedProvider) {
    throw new Error("Unable to detect mobile money provider")
  }

  // In production, this would call the actual mobile money API
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

  return {
    transactionId,
    ussdPrompt: detectedProvider === "airtel" ? "*778*1*0999123456*" + amount + "#" : undefined,
  }
}

export async function checkTransactionStatus(transactionId: string): Promise<MobileMoneyTransaction["status"]> {
  // In production, this would check the actual transaction status
  return "completed"
}

export async function initiateWithdrawal(
  phone: string,
  amount: number,
): Promise<{ transactionId: string; eta: string }> {
  const provider = detectProvider(phone)
  if (!provider) {
    throw new Error("Unable to detect mobile money provider")
  }

  const transactionId = `WD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

  return {
    transactionId,
    eta: "Within 24 hours",
  }
}
