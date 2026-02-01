import { z } from "zod"
import { phoneSchema } from "../middleware/validate"

export const registerSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(2).max(255),
  role: z.enum(["transporter", "shipper"]),
})

export const loginSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6).regex(/^\d+$/, "OTP must be 6 digits"),
})

export const sendOtpSchema = z.object({
  phone: phoneSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SendOtpInput = z.infer<typeof sendOtpSchema>
