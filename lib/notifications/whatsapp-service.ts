/**
 * WhatsApp Notification Service
 * Uses Twilio WhatsApp Business API
 */

import twilio from "twilio"

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER

let twilioClient: twilio.Twilio | null = null

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
  if (!twilioClient || !TWILIO_WHATSAPP_NUMBER) {
    console.warn("Twilio credentials not configured, skipping WhatsApp")
    return false
  }

  try {
    // Ensure phone number is in E.164 format
    const phoneNumber = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`

    await twilioClient.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: phoneNumber,
      body: message,
    })

    return true
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    return false
  }
}
