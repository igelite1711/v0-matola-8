/**
 * GET /api/auth/verify
 * Verify JWT token and return user info
 */

import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth/middleware"
import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/monitoring/logger"

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("X-Request-ID") || `req_${Date.now()}`

  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        transporterProfile: true,
        shipperProfile: true,
        brokerProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    logger.info("Token verified", { requestId, userId: user.id })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        whatsapp: user.whatsapp,
        role: user.role,
        verified: user.verified,
        verificationLevel: user.verificationLevel,
        rating: user.rating,
        totalRatings: user.totalRatings,
        preferredLanguage: user.preferredLanguage,
        transporterProfile: user.transporterProfile,
        shipperProfile: user.shipperProfile,
        brokerProfile: user.brokerProfile,
      },
    })
  } catch (error) {
    logger.error("Token verification error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
