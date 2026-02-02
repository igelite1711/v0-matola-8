/**
 * Password/PIN Hashing Utilities
 * PRD Requirements: AES-256 encryption for sensitive data, bcrypt for PINs
 */

import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

/**
 * Hash PIN using bcrypt
 */
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS)
}

/**
 * Verify PIN against hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

/**
 * Validate PIN format (4 digits for Malawi)
 */
export function validatePinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

