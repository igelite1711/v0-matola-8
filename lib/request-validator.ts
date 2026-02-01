// Request Validator - Ensures resource ownership and tenant isolation
// Prevents users from modifying other users' resources

import { db } from "@/lib/api/services/db"

export class ResourceValidator {
  /**
   * Verify user owns the shipment
   */
  static async validateShipmentOwnership(userId: string, shipmentId: string): Promise<boolean> {
    const shipment = await db.getShipmentById(shipmentId)
    if (!shipment) return false
    return shipment.shipper_id === userId || shipment.transporter_id === userId
  }

  /**
   * Verify user owns the match
   */
  static async validateMatchOwnership(userId: string, matchId: string): Promise<boolean> {
    const match = await db.getMatchById(matchId)
    if (!match) return false
    return match.shipper_id === userId || match.transporter_id === userId
  }

  /**
   * Verify user owns the payment
   */
  static async validatePaymentOwnership(userId: string, paymentId: string): Promise<boolean> {
    const payment = await db.getPaymentById(paymentId)
    if (!payment) return false
    return payment.user_id === userId
  }

  /**
   * Verify user can access resource based on role
   */
  static async validateRoleAccess(
    userId: string,
    requiredRole: "shipper" | "transporter" | "admin",
  ): Promise<boolean> {
    const user = await db.getUserById(userId)
    if (!user) return false

    if (requiredRole === "admin") {
      return user.role === "admin"
    }

    return user.role === requiredRole || user.role === "admin"
  }
}

// OTP Rate Limiting
const otpAttempts = new Map<string, { count: number; timestamp: number }>()
const MAX_OTP_ATTEMPTS = 3
const OTP_WINDOW = 15 * 60 * 1000 // 15 minutes

export class OTPRateLimiter {
  /**
   * Check if phone can request OTP
   */
  static canRequestOTP(phone: string): boolean {
    const record = otpAttempts.get(phone)
    if (!record) return true

    const elapsed = Date.now() - record.timestamp
    if (elapsed > OTP_WINDOW) {
      otpAttempts.delete(phone)
      return true
    }

    return record.count < MAX_OTP_ATTEMPTS
  }

  /**
   * Record OTP attempt
   */
  static recordAttempt(phone: string): void {
    const record = otpAttempts.get(phone)
    if (!record) {
      otpAttempts.set(phone, { count: 1, timestamp: Date.now() })
    } else {
      record.count++
    }
  }

  /**
   * Get remaining attempts
   */
  static getRemainingAttempts(phone: string): number {
    const record = otpAttempts.get(phone)
    if (!record) return MAX_OTP_ATTEMPTS

    const elapsed = Date.now() - record.timestamp
    if (elapsed > OTP_WINDOW) {
      return MAX_OTP_ATTEMPTS
    }

    return Math.max(0, MAX_OTP_ATTEMPTS - record.count)
  }

  /**
   * Clear attempts
   */
  static clearAttempts(phone: string): void {
    otpAttempts.delete(phone)
  }
}
