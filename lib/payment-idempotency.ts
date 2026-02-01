// Payment Idempotency - Prevents duplicate charges
// Uses idempotency keys to ensure payments are processed exactly once

import { createHash } from "crypto"

const processedKeys = new Map<string, { paymentId: string; timestamp: number }>()

export class IdempotencyManager {
  private ttl: number = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Generate idempotency key from payment request
   */
  generateKey(request: {
    userId: string
    amount: number
    reference: string
  }): string {
    const data = `${request.userId}:${request.amount}:${request.reference}`
    return createHash("sha256").update(data).digest("hex")
  }

  /**
   * Check if payment with this key was already processed
   */
  isDuplicate(key: string): boolean {
    const record = processedKeys.get(key)
    if (!record) return false

    // Check if TTL expired
    if (Date.now() - record.timestamp > this.ttl) {
      processedKeys.delete(key)
      return false
    }

    return true
  }

  /**
   * Get cached result for duplicate request
   */
  getCachedResult(key: string): { paymentId: string } | null {
    const record = processedKeys.get(key)
    if (!record) return null

    // Check TTL
    if (Date.now() - record.timestamp > this.ttl) {
      processedKeys.delete(key)
      return null
    }

    return { paymentId: record.paymentId }
  }

  /**
   * Record successful payment processing
   */
  recordPayment(key: string, paymentId: string): void {
    processedKeys.set(key, {
      paymentId,
      timestamp: Date.now(),
    })
  }

  /**
   * Clear expired entries (should be called periodically)
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, record] of processedKeys.entries()) {
      if (now - record.timestamp > this.ttl) {
        processedKeys.delete(key)
      }
    }
  }
}

export const idempotencyManager = new IdempotencyManager()
