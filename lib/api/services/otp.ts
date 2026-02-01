// OTP Service - Uses Redis for persistent storage across server restarts

import crypto from "crypto"
import { cache } from "@/lib/redis/client"

interface OTPEntry {
  code: string
  expiresAt: number
  attempts: number
  createdAt: number
}

const OTP_EXPIRY_SECONDS = 5 * 60 // 5 minutes
const MAX_ATTEMPTS = 3

export function generateOTP(): string {
  return crypto.randomInt(1000, 9999).toString()
}

export async function createOTP(phone: string): Promise<string> {
  try {
    const code = generateOTP()
    const entry: OTPEntry = {
      code,
      expiresAt: Date.now() + OTP_EXPIRY_SECONDS * 1000,
      attempts: 0,
      createdAt: Date.now(),
    }

    // Store OTP in Redis with TTL
    await cache.set(`otp:${phone}`, entry, OTP_EXPIRY_SECONDS)

    return code
  } catch (error) {
    console.error("Failed to create OTP:", error)
    throw error
  }
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  try {
    const entry = await cache.get<OTPEntry>(`otp:${phone}`)

    if (!entry) {
      return false
    }

    // Check if OTP has expired
    if (Date.now() > entry.expiresAt) {
      await cache.del(`otp:${phone}`)
      return false
    }

    // Increment attempts
    entry.attempts++

    // Check if max attempts exceeded
    if (entry.attempts > MAX_ATTEMPTS) {
      await cache.del(`otp:${phone}`)
      return false
    }

    // Check if code matches
    if (entry.code !== code) {
      // Update attempts in Redis
      await cache.set(`otp:${phone}`, entry, OTP_EXPIRY_SECONDS)
      return false
    }

    // Valid OTP - delete it to prevent reuse
    await cache.del(`otp:${phone}`)
    return true
  } catch (error) {
    console.error("Failed to verify OTP:", error)
    return false
  }
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  // Use the SMS service from notifications
  try {
    const { sendSMS: sendSMSNotification } = await import("@/lib/notifications/sms-service")
    return await sendSMSNotification(phone, message)
  } catch (error) {
    // Fallback: log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[SMS] To: ${phone}, Message: ${message}`)
    }
    return false
  }
}
