/**
 * POST /api/matches - Accept a match
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { checkGeneralRateLimit, createRateLimitHeaders } from "@/lib/rate-limit/rate-limiter"
import { logger } from "@/lib/monitoring/logger"
import { acceptMatchSchema } from "@/lib/validators/api-schemas"

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("X-Request-ID") || `req_${Date.now()}`
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"

  try {
    // Rate limiting
    const rateLimit = await checkGeneralRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: createRateLimitHeaders(rateLimit) },
      )
    }

    const auth = await requireAuth(request)
    const body = await request.json()
    const { matchId } = acceptMatchSchema.parse(body)

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        shipment: true,
        transporter: true,
      },
    })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Verify ownership
    if (auth.role === "shipper" && match.shipment.shipperId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (auth.role === "transporter" && match.transporterId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update match status
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { status: "accepted" },
    })

    // Update shipment status
    await prisma.shipment.update({
      where: { id: match.shipmentId },
      data: { status: "matched" },
    })

    // Reject other matches for this shipment
    await prisma.match.updateMany({
      where: {
        shipmentId: match.shipmentId,
        id: { not: matchId },
        status: "pending",
      },
      data: { status: "rejected" },
    })

    logger.info("Match accepted", { requestId, matchId, userId: auth.userId })

    return NextResponse.json(
      { success: true, match: updatedMatch },
      { status: 200, headers: createRateLimitHeaders(rateLimit) },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Accept match error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
