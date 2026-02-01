/**
 * Token Refresh Endpoint
 * PRD Requirement: Refresh token rotation
 */
import { type NextRequest, NextResponse } from "next/server"
import {
  verifyRefreshToken,
  generateToken,
  generateRefreshToken,
  blacklistToken,
  getTokenExpirySeconds,
} from "@/lib/api/middleware/auth"
import { db } from "@/lib/api/services/db"
import { logger } from "@/lib/monitoring/logger"

export async function POST(request: NextRequest) {
  // Get refresh token from cookie or body
  const refreshTokenCookie = request.cookies.get("refresh_token")?.value
  let refreshToken = refreshTokenCookie

  if (!refreshToken) {
    try {
      const body = await request.json()
      refreshToken = body.refreshToken
    } catch {
      // No body, continue with cookie check
    }
  }

  if (!refreshToken) {
    return NextResponse.json({ error: "Refresh token required", code: "MISSING_REFRESH_TOKEN" }, { status: 401 })
  }

  const payload = await verifyRefreshToken(refreshToken)

  if (!payload) {
    return NextResponse.json({ error: "Invalid refresh token", code: "INVALID_REFRESH_TOKEN" }, { status: 401 })
  }

  // Get user from database
  const user = await db.users.findById(payload.userId)

  if (!user) {
    return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 })
  }

  // Blacklist old refresh token (rotation)
  blacklistToken(refreshToken)

  // Generate new tokens
  const newAccessToken = await generateToken({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  })

  const { token: newRefreshToken } = await generateRefreshToken(user.id)

  logger.info("Token refreshed", {
    userId: user.id,
    ip: request.headers.get("x-forwarded-for") || "unknown",
  })

  const response = NextResponse.json({
    token: newAccessToken,
    expiresIn: getTokenExpirySeconds(),
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
  })

  // Set new refresh token as HTTP-only cookie
  response.cookies.set("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })

  return response
}
