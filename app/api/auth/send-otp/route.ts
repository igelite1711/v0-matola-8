import { type NextRequest, NextResponse } from "next/server"
import { createRateLimiter } from "@/lib/api/middleware/rate-limit"
import { createValidator, isValidated } from "@/lib/api/middleware/validate"
import { sendOtpSchema, type SendOtpInput } from "@/lib/api/schemas/auth"
import { db } from "@/lib/api/services/db"
import { createOTP, sendSMS } from "@/lib/api/services/otp"
import { OTPRateLimiter } from "@/lib/request-validator"
import { PhoneNormalizer } from "@/lib/phone-normalizer"

const validate = createValidator<SendOtpInput>(sendOtpSchema)

// Special rate limiter for OTP - 3 per minute per phone
const otpPhoneRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 3,
  keyGenerator: async (req) => {
    try {
      const body = await req.clone().json()
      return `otp:${body.phone || "unknown"}`
    } catch {
      return "otp:unknown"
    }
  },
})

export async function POST(req: NextRequest) {
  // Rate limiting by phone
  const rateLimitError = await otpPhoneRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Validation
  const validationResult = await validate(req)
  if (!isValidated(validationResult)) return validationResult

  let { phone } = validationResult.data

  try {
    // Normalize phone number
    const normalizedPhone = PhoneNormalizer.normalize(phone)

    // Check OTP rate limiting (3 per 15 minutes)
    if (!OTPRateLimiter.canRequestOTP(normalizedPhone)) {
      const remaining = OTPRateLimiter.getRemainingAttempts(normalizedPhone)
      return NextResponse.json(
        {
          error: `Too many OTP requests. Try again later.`,
          code: "RATE_LIMIT_EXCEEDED",
          remaining_attempts: remaining,
        },
        { status: 429 },
      )
    }

    // Check if user exists (using normalized phone)
    const user = await db.getUserByPhone(normalizedPhone)
    if (!user) {
      return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 })
    }

    // Record attempt
    OTPRateLimiter.recordAttempt(normalizedPhone)

    // Generate and send OTP
    const otp = await createOTP(normalizedPhone)
    await sendSMS(normalizedPhone, `Your Matola login code is: ${otp}. Valid for 5 minutes.`)

    return NextResponse.json({
      message: "OTP sent successfully",
      phone: normalizedPhone.replace(/(\+265\d{2})\d{4}(\d{4})/, "$1****$2"), // Mask phone
      remaining_attempts: OTPRateLimiter.getRemainingAttempts(normalizedPhone),
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
