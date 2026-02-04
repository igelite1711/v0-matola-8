/**
 * Airtel Money API Integration
 * PRD Requirements: Airtel Money payment integration
 */

import { logger } from "@/lib/monitoring/logger"

export interface AirtelMoneyConfig {
  apiKey: string
  apiUrl: string
  merchantId: string
  callbackUrl: string
}

export interface AirtelMoneyRequest {
  amount: number
  phoneNumber: string
  reference: string
  description: string
}

export interface AirtelMoneyResponse {
  success: boolean
  transactionId?: string
  ussdPrompt?: string
  error?: string
}

/**
 * Initiate Airtel Money payment
 */
export async function initiateAirtelMoneyPayment(
  config: AirtelMoneyConfig,
  request: AirtelMoneyRequest,
): Promise<AirtelMoneyResponse> {
  try {
    // In production, this would call Airtel Money API
    // For now, return USSD prompt for manual completion

    const response = await fetch(config.apiUrl + "/payment/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        amount: request.amount,
        phoneNumber: request.phoneNumber,
        reference: request.reference,
        description: request.description,
        merchantId: config.merchantId,
        callbackUrl: config.callbackUrl,
      }),
    })

    if (!response.ok) {
      // Fallback to USSD prompt
      return {
        success: true,
        ussdPrompt: `*787# → Send Money → ${config.merchantId} → ${request.amount} → ${request.reference}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      transactionId: data.transactionId,
      ussdPrompt: data.ussdPrompt,
    }
  } catch (error) {
    logger.error("Airtel Money API error", {
      error: error instanceof Error ? error.message : String(error),
    })

    // Fallback to USSD prompt
    return {
      success: true,
      ussdPrompt: `*787# → Send Money → ${config.merchantId} → ${request.amount} → ${request.reference}`,
    }
  }
}

/**
 * Verify Airtel Money payment
 */
export async function verifyAirtelMoneyPayment(
  config: AirtelMoneyConfig,
  transactionId: string,
): Promise<{ success: boolean; status: string }> {
  try {
    const response = await fetch(config.apiUrl + `/payment/verify/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
      },
    })

    if (!response.ok) {
      return { success: false, status: "pending" }
    }

    const data = await response.json()
    return {
      success: data.status === "completed",
      status: data.status,
    }
  } catch (error) {
    logger.error("Airtel Money verification error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false, status: "pending" }
  }
}

/**
 * Simplified wrapper - uses environment variables for config
 * Expected by app/api/payments/initiate/route.ts
 */
export async function initiateAirtelPayment(
  phoneNumber: string,
  amount: number,
  reference: string,
  shipmentId: string,
): Promise<AirtelMoneyResponse> {
  const config: AirtelMoneyConfig = {
    apiKey: process.env.AIRTEL_MONEY_API_KEY || "",
    apiUrl: process.env.AIRTEL_MONEY_API_URL || "https://api.airtel.mw/payments",
    merchantId: process.env.MATOLA_AIRTEL_NUMBER || "",
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/airtel`,
  }

  return initiateAirtelMoneyPayment(config, {
    amount,
    phoneNumber,
    reference,
    description: `Payment for shipment ${shipmentId}`,
  })
}

/**
 * Verify Airtel Money webhook signature
 * Expected by app/api/payments/webhook/airtel/route.ts
 */
export function verifyAirtelWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  const secret = process.env.AIRTEL_MONEY_WEBHOOK_SECRET
  if (!secret) {
    throw new Error("Webhook secret not configured. Payment webhooks cannot be verified.")
  }

  try {
    const crypto = require("crypto")
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    logger.error("Airtel webhook signature verification failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}
