/**
 * POST /api/auth/login
 * User login with phone and PIN
 * PRD Requirements: JWT with 24h expiry
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { verifyPin, validatePinFormat } from "@/lib/auth/password"
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt"
import { checkGeneralRateLimit, createRateLimitHeaders } from "@/lib/rate-limit/rate-limiter"
import { logger } from "@/lib/monitoring/logger"
import { loginSchema } from "@/lib/validators/api-schemas"
import { invariantEngine } from "@/lib/safety/invariant-engine"

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("X-Request-ID") || `req_${Date.now()}`
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"

  try {
    // Rate limiting
    const rateLimit = await checkGeneralRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimit),
        },
      )
    }

    // Parse and validate request
    const body = await request.json()
    const validated = loginSchema.parse(body)

    // Validate PIN format
    if (!validatePinFormat(validated.pin)) {
      return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 })
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone: validated.phone },
      include: {
        transporterProfile: true,
        shipperProfile: true,
        brokerProfile: true,
      },
    })

    if (!user) {
      logger.warn("Login attempt with non-existent phone", { requestId, phone: validated.phone, ip })
      return NextResponse.json({ error: "Invalid phone or PIN" }, { status: 401 })
    }

    // Verify PIN
    if (!user.pinHash) {
      return NextResponse.json({ error: "Account not set up. Please register first." }, { status: 401 })
    }

    const isValidPin = await verifyPin(validated.pin, user.pinHash)
    if (!isValidPin) {
      logger.warn("Login attempt with invalid PIN", { requestId, userId: user.id, ip })
      return NextResponse.json({ error: "Invalid phone or PIN" }, { status: 401 })
    }

    // Enforce Auth Suspension Invariant
    await invariantEngine.execute(
      ["INV-AUTH-SUSPEND"],
      { userStatus: user.status || 'active' },
      async () => { }
    )

    // Check role if specified
    if (validated.role && user.role !== validated.role) {
      return NextResponse.json({ error: "Invalid role for this account" }, { status: 403 })
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    }

    const accessToken = await generateAccessToken(tokenPayload)
    const refreshToken = await generateRefreshToken(tokenPayload)

    // Update last login (optional - add lastLoginAt field to schema if needed)

    logger.info("User logged in", { requestId, userId: user.id, role: user.role })

    // Return tokens
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
          verificationLevel: user.verificationLevel,
          rating: user.rating,
          preferredLanguage: user.preferredLanguage,
        },
        accessToken,
        refreshToken,
      },
      {
        status: 200,
        headers: createRateLimitHeaders(rateLimit),
      },
    )

    // Set HTTP-only cookies for tokens (more secure)
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    logger.error("Login error", { requestId, error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
