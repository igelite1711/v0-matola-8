/**
 * POST /api/auth/logout
 * Logout user (clear cookies and blacklist tokens)
 */

import { NextRequest, NextResponse } from "next/server"
import { blacklistToken } from "@/lib/api/middleware/auth"
import { logger } from "@/lib/monitoring/logger"

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("X-Request-ID") || `req_${Date.now()}`

  try {
    // Get tokens from cookies or Authorization header
    const accessToken = request.cookies.get("accessToken")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "")
    const refreshToken = request.cookies.get("refreshToken")?.value

    // Blacklist tokens to prevent reuse
    if (accessToken) {
      try {
        await blacklistToken(accessToken)
      } catch (error) {
        console.error("Failed to blacklist access token:", error)
      }
    }

    if (refreshToken) {
      try {
        await blacklistToken(refreshToken)
      } catch (error) {
        console.error("Failed to blacklist refresh token:", error)
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear auth cookies
    response.cookies.delete("accessToken")
    response.cookies.delete("refreshToken")

    logger.info("User logged out", { requestId })

    return response
  } catch (error) {
    logger.error("Logout error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })

    // Clear cookies anyway even if blacklist fails
    response.cookies.delete("accessToken")
    response.cookies.delete("refreshToken")

    return response
  }
}
