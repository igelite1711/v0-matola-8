// USSD Callback Handler - Africa's Talking Integration
// PRD Requirements:
// - Rate limit: 10 req/sec
// - Response time: <1 second (target <2s p95)
// - Session timeout: 300 seconds
// - Redis-backed session state

import { type NextRequest, NextResponse } from "next/server"
import { ussdRateLimiter } from "@/lib/api/middleware/rate-limit"
import {
  getSession,
  createSession,
  updateSession,
  deleteSession,
  detectLanguageFromPhone,
} from "@/lib/ussd/redis-session"
import { processInput, generateResponse } from "@/lib/ussd/state-machine"
import { db } from "@/lib/api/services/db"

// PRD: USSD short code
const USSD_SHORT_CODE = "*384*628652#"

interface UssdRequest {
  sessionId: string
  serviceCode: string
  phoneNumber: string
  text: string
  networkCode?: string
}

// Cache for static menu responses (optimization)
const menuCache = new Map<string, { text: string; expiry: number }>()
const MENU_CACHE_TTL = 60000 // 1 minute

async function processUssdRequest(request: UssdRequest): Promise<{
  response: string
  isEnd: boolean
}> {
  const { sessionId, phoneNumber, text } = request
  const startTime = Date.now()

  // Get or create session
  let session = await getSession(sessionId)

  if (!session) {
    // New session - detect language from phone/user profile
    const language = detectLanguageFromPhone(phoneNumber)

    // Check if user exists and get their language preference
    const user = await db.getUserByPhone(phoneNumber)
    const userLanguage = user?.language || language

    session = await createSession(sessionId, phoneNumber, userLanguage)

    // Log session creation for audit
    await db.createAuditLog({
      action: "ussd_session_created",
      entity: "ussd_session",
      entity_id: sessionId,
      changes: { phone: phoneNumber },
    })
  }

  // Parse input - Africa's Talking sends cumulative text with * separator
  const inputs = text.split("*").filter(Boolean)
  const currentInput = inputs[inputs.length - 1] || ""

  // Process state machine
  const { newState, newContext, isEnd } = processInput(session, currentInput)

  // Handle special actions
  if (newState === "POST_CONFIRM" && currentInput === "1" && session.context.origin) {
    // Create shipment
    try {
      const shipment = await db.createShipment({
        shipper_id: session.context.userId,
        origin: session.context.origin,
        destination: session.context.destination,
        cargo_type:
          session.context.cargoType === 1 ? "food" : session.context.cargoType === 2 ? "building_materials" : "other",
        weight_kg: session.context.weightKg,
        price_mwk: session.context.priceMwk,
        status: "pending",
      })

      await db.createAuditLog({
        user_id: session.context.userId,
        action: "shipment_created_ussd",
        entity: "shipment",
        entity_id: shipment.id,
      })
    } catch (error) {
      console.error("Failed to create shipment via USSD:", error)
    }
  }

  if (newState === "FIND_LOAD_ACCEPT" && session.context.selectedLoadId) {
    // Create match
    try {
      const match = await db.createMatch({
        shipment_id: session.context.selectedLoadId,
        transporter_id: session.context.userId,
        status: "pending",
      })

      await db.createAuditLog({
        user_id: session.context.userId,
        action: "match_accepted_ussd",
        entity: "match",
        entity_id: match.id,
      })
    } catch (error) {
      console.error("Failed to create match via USSD:", error)
    }
  }

  // Update session
  await updateSession(sessionId, {
    state: newState,
    context: newContext,
  })

  // Generate response
  const response = generateResponse(newState, newContext, session.language)

  // Clean up ended sessions
  if (isEnd) {
    await deleteSession(sessionId)
  }

  // Log response time
  const responseTime = Date.now() - startTime
  if (responseTime > 1000) {
    console.warn(`[USSD] Response time exceeded 1s target: ${responseTime}ms for session ${sessionId}`)
  }

  return { response, isEnd }
}

export async function POST(req: NextRequest) {
  const requestStart = Date.now()

  // Rate limiting - 10 req/sec for USSD
  const rateLimitError = await ussdRateLimiter(req)
  if (rateLimitError) return rateLimitError

  try {
    // Parse form data (Africa's Talking format)
    const formData = await req.formData()

    const request: UssdRequest = {
      sessionId: formData.get("sessionId") as string,
      serviceCode: formData.get("serviceCode") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      text: (formData.get("text") as string) || "",
      networkCode: formData.get("networkCode") as string | undefined,
    }

    // Validate required fields
    if (!request.sessionId || !request.phoneNumber) {
      console.error("[USSD] Missing required fields:", {
        sessionId: !!request.sessionId,
        phoneNumber: !!request.phoneNumber,
      })
      return new Response("END Invalid request. Please try again.", {
        status: 200, // USSD requires 200 even on errors
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Validate service code
    if (request.serviceCode && request.serviceCode !== USSD_SHORT_CODE) {
      console.warn(`[USSD] Unexpected service code: ${request.serviceCode}`)
    }

    // Process USSD request
    const { response, isEnd } = await processUssdRequest(request)

    // Format response per Africa's Talking spec
    const formattedResponse = isEnd ? `END ${response}` : `CON ${response}`

    const responseTime = Date.now() - requestStart

    // Log metrics
    console.log(`[USSD] Session: ${request.sessionId}, Time: ${responseTime}ms, End: ${isEnd}`)

    return new Response(formattedResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "X-Response-Time": `${responseTime}ms`,
      },
    })
  } catch (error) {
    console.error("[USSD] Callback error:", error)

    // Always return 200 for USSD with END prefix
    return new Response("END An error occurred. Please dial *384*628652# to try again.", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  }
}

// Health check for USSD endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    shortCode: USSD_SHORT_CODE,
    version: "1.0.0",
  })
}
