/**
 * DEPRECATED - Use lib/validators/api-schemas.ts instead
 * 
 * This file is kept for reference only.
 * All validation schemas have been consolidated in lib/validators/api-schemas.ts
 * 
 * The schemas in this file are OUTDATED:
 * - loginSchema expects "otp" (WRONG - should be "pin")
 * - registerSchema is incomplete
 * 
 * DO NOT USE - Import from lib/validators/api-schemas.ts instead
 */

import { z } from "zod"

/**
 * @deprecated Use lib/validators/api-schemas.ts#loginSchema instead
 * This schema incorrectly expects OTP instead of PIN
 */
export const loginSchema = z.object({
  phone: z.string(),
  otp: z.string(), // ⚠️ WRONG - Should be PIN!
})

/**
 * @deprecated Use lib/validators/api-schemas.ts#registerSchema instead
 */
export const registerSchema = z.object({
  phone: z.string(),
  name: z.string(),
  role: z.enum(["transporter", "shipper"]),
})

/**
 * @deprecated Use lib/validators/api-schemas.ts#sendOtpSchema instead
 */
export const sendOtpSchema = z.object({
  phone: z.string(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SendOtpInput = z.infer<typeof sendOtpSchema>
