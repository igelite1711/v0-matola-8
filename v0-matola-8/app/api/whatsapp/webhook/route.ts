/**
 * POST /api/whatsapp/webhook
 * WhatsApp Business API Webhook Handler (Twilio)
 * PRD Requirements: WhatsApp Business integration with full conversation flows
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { checkGeneralRateLimit } from "@/lib/rate-limit/rate-limiter"
import { logger } from "@/lib/monitoring/logger"
import { processWhatsAppMessage } from "@/lib/whatsapp/whatsapp-service"
import { Redis } from "@upstash/redis"
import twilio from "twilio"

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// Initialize Twilio client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

const WHATSAPP_SESSION_TTL = 3600 // 1 hour

/**
 * Get or create WhatsApp conversation context
 */
async function getWhatsAppContext(phone: string): Promise<any> {
  if (!redis) {
    return null
  }

  const key = `whatsapp:context:${phone}`
  return await redis.get(key)
}

/**
 * Update WhatsApp conversation context
 */
async function updateWhatsAppContext(phone: string, context: any): Promise<void> {
  if (!redis) return

  const key = `whatsapp:context:${phone}`
  await redis.set(key, context, { ex: WHATSAPP_SESSION_TTL })
}

/**
 * Send WhatsApp message via Twilio
 */
async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  if (!twilioClient || !process.env.TWILIO_WHATSAPP_NUMBER) {
    logger.warn("Twilio not configured, message not sent", { to })
    return
  }

  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message,
    })
  } catch (error) {
    logger.error("Failed to send WhatsApp message", {
      error: error instanceof Error ? error.message : String(error),
      to,
    })
  }
}

/**
 * Verify Twilio webhook signature
 */
function verifyTwilioSignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get("x-twilio-signature")
  if (!signature || !process.env.TWILIO_AUTH_TOKEN) {
    return false // Skip verification in development
  }

  try {
    return twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      signature,
      request.url,
      body,
    )
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const requestId = `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const startTime = Date.now()

  try {
    // Parse Twilio webhook format
    const formData = await request.formData()
    const from = formData.get("From")?.toString() || ""
    const body = formData.get("Body")?.toString() || ""
    const mediaUrl = formData.get("MediaUrl0")?.toString()
    const messageSid = formData.get("MessageSid")?.toString()

    if (!from || !body) {
      logger.warn("WhatsApp webhook missing required fields", { requestId, from, hasBody: !!body })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify Twilio signature (in production)
    const bodyString = Array.from(formData.entries())
      .map(([key, value]) => `${key}=${encodeURIComponent(value.toString())}`)
      .join("&")
    
    if (process.env.NODE_ENV === "production" && !verifyTwilioSignature(request, bodyString)) {
      logger.warn("Invalid Twilio signature", { requestId })
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Extract phone number
    const phoneNumber = from.replace("whatsapp:", "").replace("+", "")

    // Rate limiting
    const rateLimit = await checkGeneralRateLimit(phoneNumber)
    if (!rateLimit.allowed) {
      await sendWhatsAppMessage(
        phoneNumber,
        "Too many requests. Please wait a moment and try again.",
      )
      return NextResponse.json({ error: "Rate limited" }, { status: 429 })
    }

    // Get conversation context
    const context = await getWhatsAppContext(phoneNumber)

    // Process message
    const result = await processWhatsAppMessage(phoneNumber, body, context)

    // Update context
    await updateWhatsAppContext(phoneNumber, {
      phone: phoneNumber,
      state: result.newState,
      newContext: result.newContext,
      language: result.newContext.language || "en",
      updatedAt: Date.now(),
    })

    // Send response via Twilio
    await sendWhatsAppMessage(phoneNumber, result.response)

    logger.info("WhatsApp message processed", {
      requestId,
      from: phoneNumber.slice(-4), // Last 4 digits only
      messageLength: body.length,
      state: result.newState,
      duration: Date.now() - startTime,
    })

    // Return TwiML response (Twilio expects this)
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${result.response}</Message>
</Response>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/xml",
          "X-Request-ID": requestId,
        },
      },
    )
  } catch (error) {
    logger.error("WhatsApp webhook error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * GET endpoint for webhook verification (Twilio requirement)
 */
export async function GET(request: NextRequest) {
  // Twilio webhook verification
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get("hub.challenge")

  if (challenge) {
    // Facebook/Meta webhook verification
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ status: "ok", service: "matola-whatsapp" })
}
