import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { matchingApiService } from "@/lib/api/services/matching"
import type { TransporterCandidate } from "@/lib/matching-service"
import type { Shipment } from "@/lib/types"

/**
 * POST /api/matching
 * Find matches for a shipment
 */
export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  try {
    const body = await req.json()
    const { shipment, transporters, options } = body as {
      shipment: Shipment
      transporters: TransporterCandidate[]
      options?: {
        maxMatches?: number
        excludeTransporters?: string[]
        requireVerified?: boolean
        minScore?: number
      }
    }

    if (!shipment || !transporters) {
      return NextResponse.json({ error: "Missing shipment or transporters", code: "INVALID_REQUEST" }, { status: 400 })
    }

    const matches = await matchingApiService.findAndCreateMatches(shipment, transporters, options)

    // Get notification groups
    const notificationGroups = matchingApiService.getNotificationGroups(matches)

    return NextResponse.json({
      matches,
      total: matches.length,
      needsReview: matches.filter((m) => m.needsReview).length,
      notifications: {
        smsAndWhatsapp: notificationGroups.smsAndWhatsapp.length,
        whatsappOnly: notificationGroups.whatsappOnly.length,
      },
    })
  } catch (error) {
    console.error("Matching error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}

/**
 * GET /api/matching
 * Get matches for current user
 */
export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  try {
    const { user } = authResult
    const { searchParams } = new URL(req.url)
    const shipmentId = searchParams.get("shipmentId")

    let matches

    if (shipmentId) {
      matches = matchingApiService.getMatchesByShipment(shipmentId)
    } else if (user.role === "transporter") {
      matches = matchingApiService.getMatchesByTransporter(user.userId)
    } else {
      return NextResponse.json(
        { error: "Specify shipmentId or use as transporter", code: "INVALID_REQUEST" },
        { status: 400 },
      )
    }

    return NextResponse.json({
      items: matches,
      total: matches.length,
    })
  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
