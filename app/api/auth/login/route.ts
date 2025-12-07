import { type NextRequest, NextResponse } from "next/server"
import { authRateLimiter } from "@/lib/api/middleware/rate-limit"
import { createValidator, isValidated } from "@/lib/api/middleware/validate"
import { loginSchema, type LoginInput } from "@/lib/api/schemas/auth"
import { generateToken } from "@/lib/api/middleware/auth"
import { db } from "@/lib/api/services/db"
import { verifyOTP } from "@/lib/api/services/otp"

const validate = createValidator<LoginInput>(loginSchema)

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await authRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Validation
  const validationResult = await validate(req)
  if (!isValidated(validationResult)) return validationResult

  const { phone, otp } = validationResult.data

  try {
    // Get user
    const user = await db.getUserByPhone(phone)
    if (!user) {
      return NextResponse.json({ error: "User not found", code: "USER_NOT_FOUND" }, { status: 404 })
    }

    // Verify OTP
    const otpValid = await verifyOTP(phone, otp)
    if (!otpValid) {
      return NextResponse.json({ error: "Invalid or expired OTP", code: "INVALID_OTP" }, { status: 401 })
    }

    // Generate token
    const token = await generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })

    // Audit log
    await db.createAuditLog({
      user_id: user.id,
      action: "login",
      entity: "user",
      entity_id: user.id,
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
