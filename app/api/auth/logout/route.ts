/**
 * Logout Endpoint - Blacklists token
 * PRD Requirement: Token blacklist on logout
 */
import { type NextRequest, NextResponse } from "next/server"
import { blacklistToken, verifyToken } from "@/lib/api/middleware/auth"
import { logger } from "@/lib/monitoring/logger"

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "No token provided" }, { status: 400 })
  }

  const token = authHeader.substring(7)
  const payload = await verifyToken(token)

  if (payload) {
    blacklistToken(token)

    logger.audit("User logged out", {
      userId: payload.userId,
      ip: request.headers.get("x-forwarded-for") || "unknown",
    })
  }

  // Also clear refresh token cookie if present
  const response = NextResponse.json({ success: true })
  response.cookies.delete("refresh_token")

  return response
}
