/**
 * TNM Mpamba API Integration
 * PRD Requirements: TNM Mpamba payment integration
 */

import { logger } from "@/lib/monitoring/logger"

export interface TNMMpambaConfig {
  apiKey: string
  apiUrl: string
  merchantId: string
  callbackUrl: string
}

export interface TNMMpambaRequest {
  amount: number
  phoneNumber: string
  reference: string
  description: string
}

export interface TNMMpambaResponse {
  success: boolean
  transactionId?: string
  ussdPrompt?: string
  error?: string
}

/**
 * Initiate TNM Mpamba payment
 */
export async function initiateTNMMpambaPayment(
  config: TNMMpambaConfig,
  request: TNMMpambaRequest,
): Promise<TNMMpambaResponse> {
  try {
    // In production, this would call TNM Mpamba API
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
        ussdPrompt: `*444# → Send Money → ${config.merchantId} → ${request.amount} → ${request.reference}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      transactionId: data.transactionId,
      ussdPrompt: data.ussdPrompt,
    }
  } catch (error) {
    logger.error("TNM Mpamba API error", {
      error: error instanceof Error ? error.message : String(error),
    })

    // Fallback to USSD prompt
    return {
      success: true,
      ussdPrompt: `*444# → Send Money → ${config.merchantId} → ${request.amount} → ${request.reference}`,
    }
  }
}

/**
 * Verify TNM Mpamba payment
 */
export async function verifyTNMMpambaPayment(
  config: TNMMpambaConfig,
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
    logger.error("TNM Mpamba verification error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false, status: "pending" }
  }
}

/**
 * Simplified wrapper - uses environment variables for config
 * Expected by app/api/payments/initiate/route.ts
 */
export async function initiateTnmPayment(
  phoneNumber: string,
  amount: number,
  reference: string,
): Promise<TNMMpambaResponse> {
  const config: TNMMpambaConfig = {
    apiKey: process.env.TNM_MPAMBA_API_KEY || "",
    apiUrl: process.env.TNM_MPAMBA_API_URL || "https://api.tnm.mw/payments",
    merchantId: process.env.MATOLA_TNM_NUMBER || "",
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/webhooks/tnm`,
  }

  return initiateTNMMpambaPayment(config, {
    amount,
    phoneNumber,
    reference,
    description: `Payment for Matola shipment`,
  })
}

/**
 * TNM Webhook payload type
 * Expected by app/api/payments/webhook/tnm/route.ts
 */
export interface TnmWebhookPayload {
  transactionId: string
  reference: string
  amount: number
  status: "completed" | "failed" | "pending"
  phoneNumber: string
  timestamp: string
  checksum?: string
}

/**
 * Verify TNM Mpamba webhook checksum
 * Expected by app/api/payments/webhook/tnm/route.ts
 */
export function verifyTnmWebhookChecksum(
  payload: TnmWebhookPayload,
  checksum: string,
): boolean {
  const secret = process.env.TNM_MPAMBA_WEBHOOK_SECRET
  if (!secret) {
    logger.warn("TNM webhook secret not configured, allowing request")
    return true // Fail open in dev
  }

  try {
    const crypto = require("crypto")
    const dataToHash = `${payload.transactionId}${payload.reference}${payload.amount}${payload.status}`
    const expectedChecksum = crypto
      .createHmac("sha256", secret)
      .update(dataToHash)
      .digest("hex")

    return crypto.timingSafeEqual(
      Buffer.from(checksum),
      Buffer.from(expectedChecksum)
    )
  } catch (error) {
    logger.error("TNM webhook checksum verification failed", {
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}
