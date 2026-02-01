/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */

import { NextRequest, NextResponse } from "next/server"
import { verifyToken, generateAccessToken } from "@/lib/auth/jwt"
import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/monitoring/logger"
import { tokenBlacklist as redisTokenBlacklist } from "@/lib/redis/client"

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("X-Request-ID") || `req_${Date.now()}`

  try {
    // Get refresh token from cookie or body
    let refreshToken: string | undefined
    try {
      const body = await request.json()
      refreshToken = body.refreshToken
    } catch {
      // If no JSON body, that's fine
    }

    refreshToken = refreshToken || request.cookies.get("refreshToken")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token required" }, { status: 401 })
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisTokenBlacklist.isRevoked(refreshToken)
    if (isBlacklisted) {
      return NextResponse.json({ error: "Refresh token has been revoked" }, { status: 401 })
    }

    // Verify refresh token
    let payload
    try {
      payload = await verifyToken(refreshToken)
    } catch (error) {
      logger.warn("Invalid refresh token", { requestId, error: error instanceof Error ? error.message : String(error) })
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      logger.warn("User not found for refresh", { requestId, userId: payload.userId })
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })

    logger.info("Token refreshed", { requestId, userId: user.id })

    const response = NextResponse.json(
      {
        success: true,
        accessToken: newAccessToken,
      },
      { status: 200 },
    )

    // Update access token cookie
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
    })

    return response
  } catch (error) {
    logger.error("Token refresh error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
