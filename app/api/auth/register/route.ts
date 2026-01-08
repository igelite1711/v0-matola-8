/**
 * POST /api/auth/register
 * User registration
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { hashPin, validatePinFormat } from "@/lib/auth/password"
import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt"
import { checkGeneralRateLimit, createRateLimitHeaders } from "@/lib/rate-limit/rate-limiter"
import { logger } from "@/lib/monitoring/logger"
import { registerSchema } from "@/lib/validators/api-schemas"

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

    // Parse and validate
    const body = await request.json()
    const validated = registerSchema.parse(body)

    // Validate PIN format
    if (!validatePinFormat(validated.pin)) {
      return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone: validated.phone },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 409 })
    }

    // Hash PIN
    const pinHash = await hashPin(validated.pin)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        whatsapp: validated.whatsapp,
        pinHash,
        role: validated.role,
        preferredLanguage: validated.preferredLanguage,
        verificationLevel: "phone", // Phone verified on registration
        verified: false, // Full verification pending
      },
    })

    // Create role-specific profile
    if (validated.role === "transporter" && validated.vehicleType && validated.vehiclePlate && validated.vehicleCapacity) {
      await prisma.transporterProfile.create({
        data: {
          userId: user.id,
          vehicleType: validated.vehicleType,
          vehiclePlate: validated.vehiclePlate,
          vehicleCapacity: validated.vehicleCapacity,
          isAvailable: true,
        },
      })
    } else if (validated.role === "shipper") {
      await prisma.shipperProfile.create({
        data: {
          userId: user.id,
          businessName: validated.businessName,
          businessType: validated.businessType,
        },
      })
    } else if (validated.role === "broker") {
      await prisma.brokerProfile.create({
        data: {
          userId: user.id,
        },
      })
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      phone: user.phone,
      role: user.role,
    }

    const accessToken = await generateAccessToken(tokenPayload)
    const refreshToken = await generateRefreshToken(tokenPayload)

    logger.info("User registered", { requestId, userId: user.id, role: user.role })

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
          preferredLanguage: user.preferredLanguage,
        },
        accessToken,
        refreshToken,
      },
      {
        status: 201,
        headers: createRateLimitHeaders(rateLimit),
      },
    )

    // Set HTTP-only cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }

    logger.error("Registration error", { requestId, error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
