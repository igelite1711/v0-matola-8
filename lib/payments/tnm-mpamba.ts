// TNM Mpamba Integration for Malawi
// USSD-triggered payment flow with polling

import crypto from "crypto"

// Types
export interface TnmPaymentRequest {
  merchantCode: string
  amount: number
  reference: string
  msisdn: string
  callbackUrl: string
}

export interface TnmPaymentResponse {
  transactionId: string
  status: "PENDING" | "SUCCESS" | "FAILED"
  message: string
}

export interface TnmStatusResponse {
  transactionId: string
  resultCode: string // "0" = success
  resultDesc: string
  amount: number
  msisdn: string
  reference: string
}

export interface TnmWebhookPayload {
  transactionId: string
  resultCode: string
  resultDesc: string
  amount: number
  msisdn: string
  reference: string
  checksum: string
}

// Configuration
const TNM_CONFIG = {
  baseUrl: process.env.TNM_API_URL || "https://api.tnm.co.mw",
  merchantCode: process.env.TNM_MERCHANT_CODE || "",
  apiKey: process.env.TNM_API_KEY || "",
  webhookSecret: process.env.TNM_WEBHOOK_SECRET || "",
  callbackUrl: process.env.TNM_CALLBACK_URL || "https://api.matola.mw/api/payments/webhook/tnm",
}

export async function initiateTnmPayment(
  phoneNumber: string,
  amount: number,
  reference: string,
): Promise<{ success: boolean; transactionId?: string; ussdPrompt?: string; error?: string }> {
  try {
    // Format phone number
    const msisdn = phoneNumber.replace(/^\+?265/, "")

    const payload: TnmPaymentRequest = {
      merchantCode: TNM_CONFIG.merchantCode,
      amount,
      reference,
      msisdn,
      callbackUrl: TNM_CONFIG.callbackUrl,
    }

    const response = await fetchWithRetry(`${TNM_CONFIG.baseUrl}/mpamba/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TNM_CONFIG.apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const data: TnmPaymentResponse = await response.json()

    if (data.status === "PENDING") {
      return {
        success: true,
        transactionId: data.transactionId,
        // Generate USSD prompt for user to dial
        ussdPrompt: `*444*${TNM_CONFIG.merchantCode}*${amount}*${reference}#`,
      }
    }

    return {
      success: false,
      error: data.message || "Payment initiation failed",
    }
  } catch (error) {
    console.error("TNM payment error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function checkTnmPaymentStatus(
  transactionId: string,
): Promise<{ status: "pending" | "completed" | "failed"; providerRef?: string }> {
  try {
    const response = await fetchWithRetry(`${TNM_CONFIG.baseUrl}/mpamba/status/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TNM_CONFIG.apiKey}`,
      },
    })

    const data: TnmStatusResponse = await response.json()

    return {
      status: data.resultCode === "0" ? "completed" : data.resultCode ? "failed" : "pending",
      providerRef: data.transactionId,
    }
  } catch (error) {
    console.error("TNM status check error:", error)
    return { status: "pending" }
  }
}

export async function pollTnmPaymentStatus(
  transactionId: string,
  onStatusChange: (status: "pending" | "completed" | "failed") => void,
  maxDurationMs = 300000, // 5 minutes
  intervalMs = 30000, // 30 seconds
): Promise<"completed" | "failed" | "timeout"> {
  const startTime = Date.now()

  while (Date.now() - startTime < maxDurationMs) {
    const { status } = await checkTnmPaymentStatus(transactionId)

    onStatusChange(status)

    if (status === "completed" || status === "failed") {
      return status
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  return "timeout"
}

export function verifyTnmWebhookChecksum(payload: TnmWebhookPayload): boolean {
  if (!TNM_CONFIG.webhookSecret) {
    console.warn("TNM webhook secret not configured")
    return false
  }

  const dataString = `${payload.transactionId}${payload.amount}${payload.msisdn}${payload.reference}${TNM_CONFIG.webhookSecret}`

  const expectedChecksum = crypto.createHash("sha256").update(dataString).digest("hex")

  try {
    return crypto.timingSafeEqual(Buffer.from(payload.checksum), Buffer.from(expectedChecksum))
  } catch {
    return false
  }
}

// Retry logic with exponential backoff
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000),
      })

      if (response.status >= 400 && response.status < 500) {
        return response
      }

      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`TNM API attempt ${attempt + 1} failed:`, lastError.message)

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw lastError || new Error("Max retries exceeded")
}
