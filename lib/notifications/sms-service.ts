/**
 * SMS Notification Service
 * Uses Africa's Talking API for SMS
 */

import { logger } from "@/lib/monitoring/logger"

const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME
const AFRICASTALKING_SMS_URL = "https://api.africastalking.com/version1/messaging"

export async function sendSMS(to: string, message: string): Promise<boolean> {
  if (!AFRICASTALKING_API_KEY || !AFRICASTALKING_USERNAME) {
    logger.warn("Africa's Talking credentials not configured, skipping SMS", { phone: to })
    return false
  }

  try {
    // Remove + from phone number if present
    const phoneNumber = to.replace(/^\+/, "")

    const response = await fetch(AFRICASTALKING_SMS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "apiKey": AFRICASTALKING_API_KEY,
      },
      body: new URLSearchParams({
        username: AFRICASTALKING_USERNAME,
        to: phoneNumber,
        message: message,
        from: "MATOLA",
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error("SMS send failed", { phone: to, error, status: response.status })
      return false
    }

    const result = await response.json()
    const success = result.SMSMessageData?.Recipients?.[0]?.statusCode === 101
    
    if (success) {
      logger.info("SMS sent successfully", { phone: to, messageLength: message.length })
    } else {
      logger.warn("SMS send returned non-success status", { phone: to, result })
    }
    
    return success
  } catch (error) {
    logger.error("Error sending SMS", {
      phone: to,
      error: error instanceof Error ? error.message : String(error),
    })
    return false
  }
}
