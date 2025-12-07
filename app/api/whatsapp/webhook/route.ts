import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { whatsappRateLimiter } from "@/lib/api/middleware/rate-limit"
import { db } from "@/lib/api/services/db"

// Verify WhatsApp webhook signature
function verifyWhatsAppSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")
  return `sha256=${expectedSignature}` === signature
}

// Handle webhook verification (GET request from WhatsApp)
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const mode = url.searchParams.get("hub.mode")
  const token = url.searchParams.get("hub.verify_token")
  const challenge = url.searchParams.get("hub.challenge")

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified")
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// Handle incoming messages (POST request from WhatsApp)
export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await whatsappRateLimiter(req)
  if (rateLimitError) return rateLimitError

  const rawBody = await req.text()
  const signature = req.headers.get("x-hub-signature-256") || ""
  const secret = process.env.WHATSAPP_APP_SECRET || ""

  // Verify signature
  if (!verifyWhatsAppSignature(rawBody, signature, secret)) {
    console.error("Invalid WhatsApp webhook signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  try {
    const payload = JSON.parse(rawBody)

    // Process each entry
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === "messages") {
          const value = change.value
          const messages = value.messages || []

          for (const message of messages) {
            await processWhatsAppMessage({
              from: message.from,
              type: message.type,
              text: message.text?.body,
              timestamp: message.timestamp,
              messageId: message.id,
            })
          }
        }
      }
    }

    // Audit log
    await db.createAuditLog({
      action: "webhook_received",
      entity: "whatsapp",
      changes: { messageCount: payload.entry?.length || 0 },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("WhatsApp webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

interface WhatsAppMessage {
  from: string
  type: string
  text?: string
  timestamp: string
  messageId: string
}

async function processWhatsAppMessage(message: WhatsAppMessage) {
  console.log("Processing WhatsApp message:", message)

  // TODO: Implement message processing logic
  // 1. Parse user intent
  // 2. Look up user by phone
  // 3. Generate appropriate response
  // 4. Send reply via WhatsApp Business API

  // For now, log the message
  const { from, text, type } = message

  if (type === "text" && text) {
    // Simple command handling
    const lowerText = text.toLowerCase()

    if (lowerText.includes("help") || lowerText === "hi") {
      await sendWhatsAppMessage(
        from,
        "Welcome to Matola! 🚛\n\nCommands:\n• LOADS - View available loads\n• POST - Post a new shipment\n• TRIPS - View your trips\n• BALANCE - Check wallet balance",
      )
    } else if (lowerText.includes("loads")) {
      await sendWhatsAppMessage(
        from,
        "Available Loads:\n\n1. Lilongwe → Blantyre\n   500kg | MWK 45,000\n\n2. Mzuzu → Lilongwe\n   300kg | MWK 35,000\n\nReply with load number to accept.",
      )
    } else if (lowerText.includes("balance")) {
      await sendWhatsAppMessage(
        from,
        "💰 Your Matola Balance\n\nAvailable: MWK 0\nPending: MWK 0\n\nReply WITHDRAW to cash out.",
      )
    }
  }
}

async function sendWhatsAppMessage(to: string, message: string) {
  // TODO: Integrate with WhatsApp Business API
  console.log(`[WhatsApp] To: ${to}, Message: ${message}`)

  // Production implementation:
  // const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     messaging_product: 'whatsapp',
  //     to,
  //     type: 'text',
  //     text: { body: message }
  //   })
  // })
}
