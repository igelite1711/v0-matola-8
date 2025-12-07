// Airtel Money Integration for Malawi
// API Documentation: https://developers.airtel.africa/documentation

import crypto from "crypto"

// Types
export interface AirtelAuthResponse {
  access_token: string
  expires_in: number
  token_type: string
}

export interface AirtelPaymentRequest {
  reference: string
  subscriber: {
    country: "MW"
    currency: "MWK"
    msisdn: string // Phone without country code: 991234567
  }
  transaction: {
    amount: number
    country: "MW"
    currency: "MWK"
    id: string // Shipment ID
  }
}

export interface AirtelPaymentResponse {
  data: {
    transaction: {
      id: string
      status: "TS" | "TF" | "TP" | "TIP" // Success, Failed, Pending, In Progress
    }
  }
  status: {
    code: string
    message: string
    result_code: string
    success: boolean
  }
}

export interface AirtelWebhookPayload {
  transaction: {
    id: string
    message: string
    status_code: string
    airtel_money_id: string
  }
}

// Configuration
const AIRTEL_CONFIG = {
  baseUrl: process.env.AIRTEL_API_URL || "https://openapi.airtel.africa",
  clientId: process.env.AIRTEL_CLIENT_ID || "",
  clientSecret: process.env.AIRTEL_CLIENT_SECRET || "",
  webhookSecret: process.env.AIRTEL_WEBHOOK_SECRET || "",
  callbackUrl: process.env.AIRTEL_CALLBACK_URL || "https://api.matola.mw/api/payments/webhook/airtel",
}

// Token cache
let cachedToken: { token: string; expiresAt: number } | null = null

export async function getAirtelAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token
  }

  const response = await fetchWithRetry(`${AIRTEL_CONFIG.baseUrl}/auth/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    body: JSON.stringify({
      client_id: AIRTEL_CONFIG.clientId,
      client_secret: AIRTEL_CONFIG.clientSecret,
      grant_type: "client_credentials",
    }),
  })

  if (!response.ok) {
    throw new Error(`Airtel auth failed: ${response.status}`)
  }

  const data: AirtelAuthResponse = await response.json()

  // Cache the token
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return data.access_token
}

export async function initiateAirtelPayment(
  phoneNumber: string,
  amount: number,
  reference: string,
  shipmentId: string,
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    const token = await getAirtelAccessToken()

    // Format phone number (remove country code if present)
    const msisdn = phoneNumber.replace(/^\+?265/, "")

    const payload: AirtelPaymentRequest = {
      reference,
      subscriber: {
        country: "MW",
        currency: "MWK",
        msisdn,
      },
      transaction: {
        amount,
        country: "MW",
        currency: "MWK",
        id: shipmentId,
      },
    }

    const response = await fetchWithRetry(`${AIRTEL_CONFIG.baseUrl}/merchant/v1/payments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
        "X-Country": "MW",
        "X-Currency": "MWK",
      },
      body: JSON.stringify(payload),
    })

    const data: AirtelPaymentResponse = await response.json()

    if (data.status.success) {
      return {
        success: true,
        transactionId: data.data.transaction.id,
      }
    }

    return {
      success: false,
      error: data.status.message || "Payment initiation failed",
    }
  } catch (error) {
    console.error("Airtel payment error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function checkAirtelPaymentStatus(
  transactionId: string,
): Promise<{ status: "pending" | "completed" | "failed"; providerRef?: string }> {
  try {
    const token = await getAirtelAccessToken()

    const response = await fetchWithRetry(`${AIRTEL_CONFIG.baseUrl}/standard/v1/payments/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Country": "MW",
        "X-Currency": "MWK",
      },
    })

    const data = await response.json()

    const statusMap: Record<string, "pending" | "completed" | "failed"> = {
      TS: "completed",
      TF: "failed",
      TP: "pending",
      TIP: "pending",
    }

    return {
      status: statusMap[data.data?.transaction?.status] || "pending",
      providerRef: data.data?.transaction?.airtel_money_id,
    }
  } catch (error) {
    console.error("Airtel status check error:", error)
    return { status: "pending" }
  }
}

export function verifyAirtelWebhookSignature(payload: string, signature: string): boolean {
  if (!AIRTEL_CONFIG.webhookSecret) {
    console.warn("Airtel webhook secret not configured")
    return false
  }

  const expectedSignature = crypto.createHmac("sha256", AIRTEL_CONFIG.webhookSecret).update(payload).digest("hex")

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch {
    return false
  }
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response
      }

      // Retry on server errors (5xx)
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`Airtel API attempt ${attempt + 1} failed:`, lastError.message)

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }

  throw lastError || new Error("Max retries exceeded")
}
