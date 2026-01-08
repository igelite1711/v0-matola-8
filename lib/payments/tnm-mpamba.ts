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
