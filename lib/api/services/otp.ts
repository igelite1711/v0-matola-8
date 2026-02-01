// OTP Service - In production, use Redis for storage and Africa's Talking for SMS
import crypto from "crypto"

interface OTPEntry {
  code: string
  expiresAt: number
  attempts: number
}

// In-memory store (use Redis in production)
const otpStore = new Map<string, OTPEntry>()

const OTP_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 3

export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function createOTP(phone: string): Promise<string> {
  const code = generateOTP()
  otpStore.set(phone, {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  })
  return code
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  const entry = otpStore.get(phone)

  if (!entry) {
    return false
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone)
    return false
  }

  entry.attempts++

  if (entry.attempts > MAX_ATTEMPTS) {
    otpStore.delete(phone)
    return false
  }

  if (entry.code !== code) {
    otpStore.set(phone, entry)
    return false
  }

  // Valid - remove OTP
  otpStore.delete(phone)
  return true
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  // TODO: Integrate with Africa's Talking API
  // For now, log to console in development
  console.log(`[SMS] To: ${phone}, Message: ${message}`)

  // Production implementation:
  // const AT = require('africastalking')({
  //   apiKey: process.env.AFRICASTALKING_API_KEY,
  //   username: process.env.AFRICASTALKING_USERNAME
  // })
  // const sms = AT.SMS
  // await sms.send({ to: [phone], message, from: 'MATOLA' })

  return true
}
