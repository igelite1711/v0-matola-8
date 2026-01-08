/**
 * POST /api/ussd/webhook
 * Africa's Talking USSD Webhook Handler
 * PRD Requirements: <1s response time, Redis session storage, full state machine
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { checkUSSDRateLimit } from "@/lib/rate-limit/rate-limiter"
import { logger } from "@/lib/monitoring/logger"
import { Redis } from "@upstash/redis"
import {
  type USSDSession,
  getOrCreateUser,
  handleMainMenu,
  handlePostShipmentOrigin,
  handlePostShipmentDestination,
  handlePostShipmentCargoType,
  handlePostShipmentWeight,
  handlePostShipmentPrice,
  handlePostShipmentConfirm,
  handleFindTransportOrigin,
  handleFindTransportDestination,
  handleMyShipments,
} from "@/lib/ussd/ussd-service"

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

const USSD_SESSION_TTL = 300 // 5 minutes

/**
 * Get or create USSD session from Redis
 */
async function getSession(sessionId: string, phoneNumber: string): Promise<USSDSession | null> {
  if (!redis) {
    // Fallback for development - in-memory (not persistent)
    return {
      phone: phoneNumber,
      state: "MAIN_MENU",
      context: {},
      stepCount: 0,
      language: "en",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  }

  const key = `ussd:session:${sessionId}`
  const session = await redis.get<USSDSession>(key)

  if (session) {
    return session
  }

  // Create new session
  const newSession: USSDSession = {
    phone: phoneNumber,
    state: "MAIN_MENU",
    context: {},
    stepCount: 0,
    language: "en",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  await redis.set(key, newSession, { ex: USSD_SESSION_TTL })
  return newSession
}

/**
 * Update USSD session in Redis
 */
async function updateSession(sessionId: string, session: USSDSession): Promise<void> {
  if (!redis) return

  const key = `ussd:session:${sessionId}`
  session.updatedAt = Date.now()
  await redis.set(key, session, { ex: USSD_SESSION_TTL })
}

/**
 * Parse user input from Africa's Talking format
 * Input format: "1*2*3" where last part is current input
 */
function parseInput(text: string): string {
  if (!text) return ""
  const parts = text.split("*")
  return parts[parts.length - 1] || ""
}

/**
 * Process USSD state machine
 */
async function processUSSDState(
  state: string,
  input: string,
  session: USSDSession,
): Promise<{ response: string; newState: string; context: Record<string, any> }> {
  const { language, context, phone } = session

  // Get or create user
  const user = await getOrCreateUser(phone)
  if (!user) {
    return {
      response: "END Error. Please try again.",
      newState: "ENDED",
      context: {},
    }
  }

  // Update session with user ID
  session.userId = user.id
  session.language = (user.preferredLanguage as "en" | "ny") || language

  // Route to appropriate handler based on state
  switch (state) {
    case "MAIN_MENU":
      // Get user shipment count for menu
      const shipmentCount = await prisma.shipment.count({
        where: { shipperId: user.id, status: { in: ["posted", "matched", "in_transit"] } },
      })
      return handleMainMenu(input, session.language, shipmentCount)

    case "POST_SHIPMENT_ORIGIN":
      return handlePostShipmentOrigin(input, context, session.language)

    case "POST_SHIPMENT_DESTINATION":
      return handlePostShipmentDestination(input, context, session.language)

    case "POST_SHIPMENT_CARGO_TYPE":
      return handlePostShipmentCargoType(input, context, session.language)

    case "POST_SHIPMENT_WEIGHT":
      return handlePostShipmentWeight(input, context, session.language)

    case "POST_SHIPMENT_PRICE":
      return handlePostShipmentPrice(input, context, session.language)

    case "POST_SHIPMENT_CONFIRM":
      return await handlePostShipmentConfirm(input, context, session.language, phone, user.id)

    case "FIND_TRANSPORT_ORIGIN":
      return handleFindTransportOrigin(input, context, session.language)

    case "FIND_TRANSPORT_DESTINATION":
      return await handleFindTransportDestination(input, context, session.language, phone)

    case "MY_SHIPMENTS_LOADING":
    case "MY_SHIPMENTS_LIST":
      const page = context.page || 0
      return await handleMyShipments(phone, session.language, page)

    case "ACCOUNT_MENU":
      return {
        response: session.language === "ny"
          ? "END Akaunti yanu:\nDzina: " + user.name + "\nNambala: " + phone + "\n\nDial *384*628652# kuti muwone zambiri."
          : `END Your account:\nName: ${user.name}\nPhone: ${phone}\n\nDial *384*628652# for more.`,
        newState: "ENDED",
        context: {},
      }

    case "HELP_MENU":
      return {
        response: session.language === "ny"
          ? "END Thandizo:\n1. Lembani katundu\n2. Pezani galimoto\n3. Tsatani katundu\n\nLumikizanani: +265 999 123 456"
          : "END Help:\n1. Post shipment\n2. Find transport\n3. Track shipment\n\nContact: +265 999 123 456",
        newState: "ENDED",
        context: {},
      }

    default:
      return handleMainMenu("", session.language)
  }
}

/**
 * Africa's Talking USSD Webhook Handler
 * 
 * Expected format from Africa's Talking:
 * - sessionId: Unique session identifier
 * - phoneNumber: User's phone number
 * - text: User input (can be empty for first request, or "1*2*3" format)
 * - serviceCode: USSD service code (e.g., "*384*628652#")
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `ussd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    // Parse Africa's Talking webhook format
    // Can be form-data or JSON depending on configuration
    let sessionId: string
    let phoneNumber: string
    let text: string
    let serviceCode: string

    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const body = await request.json()
      sessionId = body.sessionId || body.session_id || ""
      phoneNumber = body.phoneNumber || body.phone_number || ""
      text = body.text || body.userInput || ""
      serviceCode = body.serviceCode || body.service_code || ""
    } else {
      // Form data (default for Africa's Talking)
      const formData = await request.formData()
      sessionId = formData.get("sessionId")?.toString() || formData.get("session_id")?.toString() || ""
      phoneNumber = formData.get("phoneNumber")?.toString() || formData.get("phone_number")?.toString() || ""
      text = formData.get("text")?.toString() || formData.get("userInput")?.toString() || ""
      serviceCode = formData.get("serviceCode")?.toString() || formData.get("service_code")?.toString() || ""
    }

    if (!sessionId || !phoneNumber) {
      logger.warn("USSD webhook missing required fields", { requestId, sessionId, phoneNumber })
      return new NextResponse("END Invalid request", { status: 200 })
    }

    // Normalize phone number
    phoneNumber = phoneNumber.replace(/^\+/, "") // Remove leading +
    if (phoneNumber.startsWith("265")) {
      phoneNumber = "+" + phoneNumber
    } else if (phoneNumber.startsWith("0")) {
      phoneNumber = "+265" + phoneNumber.substring(1)
    } else {
      phoneNumber = "+265" + phoneNumber
    }

    // Rate limiting (10 req/sec for USSD)
    const rateLimit = await checkUSSDRateLimit(phoneNumber)
    if (!rateLimit.allowed) {
      logger.warn("USSD rate limit exceeded", { requestId, phoneNumber })
      return new NextResponse("END Service busy. Please try again.", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Get or create session
    const session = await getSession(sessionId, phoneNumber)
    if (!session) {
      logger.error("Failed to get/create USSD session", { requestId, sessionId, phoneNumber })
      return new NextResponse("END Session error. Please dial again.", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Parse user input
    const userInput = parseInput(text)

    // Process state machine
    const result = await processUSSDState(session.state, userInput, session)

    // Update session
    session.state = result.newState
    session.context = result.context
    session.stepCount += 1
    await updateSession(sessionId, session)

    // Store in database for analytics (non-blocking)
    try {
      await prisma.uSSDSession.upsert({
        where: { sessionId },
        create: {
          sessionId,
          phoneNumber,
          userId: session.userId,
          state: result.newState,
          context: result.context as any,
          stepCount: session.stepCount,
          language: session.language,
          expiresAt: new Date(Date.now() + USSD_SESSION_TTL * 1000),
        },
        update: {
          state: result.newState,
          context: result.context as any,
          stepCount: session.stepCount,
          updatedAt: new Date(),
        },
      })
    } catch (dbError) {
      // Non-critical, log and continue
      logger.warn("USSD session DB error", { requestId, error: String(dbError) })
    }

    const duration = Date.now() - startTime
    logger.info("USSD request processed", {
      requestId,
      sessionId,
      phoneNumber: phoneNumber.slice(-4), // Last 4 digits only for privacy
      state: result.newState,
      stepCount: session.stepCount,
      duration,
    })

    // Return USSD response (must be plain text, "CON" or "END")
    return new NextResponse(result.response, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "X-Request-ID": requestId,
      },
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error("USSD webhook error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration,
    })

    // Return user-friendly error message
    return new NextResponse("END Error. Please try again.", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  }
}

/**
 * GET endpoint for webhook verification (some providers require this)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "ok", service: "matola-ussd" })
}
