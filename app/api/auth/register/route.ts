import { type NextRequest, NextResponse } from "next/server"
import { authRateLimiter } from "@/lib/api/middleware/rate-limit"
import { createValidator, isValidated } from "@/lib/api/middleware/validate"
import { registerSchema, type RegisterInput } from "@/lib/api/schemas/auth"
import { generateToken, getTokenExpirySeconds } from "@/lib/api/middleware/auth"
import { db } from "@/lib/api/services/db"
import { createOTP, sendSMS } from "@/lib/api/services/otp"

const validate = createValidator<RegisterInput>(registerSchema)

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await authRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Validation
  const validationResult = await validate(req)
  if (!isValidated(validationResult)) return validationResult

  const { phone, name, role } = validationResult.data

  try {
    // Check if user already exists
    const existingUser = await db.getUserByPhone(phone)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists", code: "USER_EXISTS" }, { status: 400 })
    }

    // Create user
    const user = await db.createUser({ phone, name, role })

    // Generate OTP for verification
    const otp = await createOTP(phone)
    await sendSMS(phone, `Your Matola verification code is: ${otp}. Valid for 5 minutes.`)

    // Generate token
    const token = await generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })

    // Audit log
    await db.createAuditLog({
      user_id: user.id,
      action: "register",
      entity: "user",
      entity_id: user.id,
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          verified: user.verified,
        },
        expiresIn: getTokenExpirySeconds(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
