import { type NextRequest, NextResponse } from "next/server"
import { createRateLimiter } from "@/lib/api/middleware/rate-limit"
import { createValidator, isValidated } from "@/lib/api/middleware/validate"
import { sendOtpSchema, type SendOtpInput } from "@/lib/validators/api-schemas"
import { db } from "@/lib/api/services/db"
import { createOTP, sendSMS } from "@/lib/api/services/otp"
import { logger } from "@/lib/monitoring/logger"

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

  const { phone } = validationResult.data

  try {
    // Check if user exists
    const user = await db.getUserByPhone(phone)
    if (!user) {
      return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 })
    }

    // Generate and send OTP
    const otp = await createOTP(phone)
    await sendSMS(phone, `Your Matola login code is: ${otp}. Valid for 5 minutes.`)

    return NextResponse.json({
      message: "OTP sent successfully",
      phone: phone.replace(/(\+265\d{2})\d{4}(\d{4})/, "$1****$2"), // Mask phone
    })
  } catch (error) {
    logger.error("Send OTP error", {
      phone: phone?.replace(/(\+265\d{2})\d{4}(\d{4})/, "$1****$2"),
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
