/**
 * AES-256 Encryption Service for data at rest
 * PRD Requirement: AES-256 for sensitive data encryption
 */
import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 64
const KEY_LENGTH = 32

// Get encryption key from environment (must be 32 bytes for AES-256)
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required")
  }
  // Hash the key to ensure it's exactly 32 bytes
  return crypto.scryptSync(key, "matola-salt", KEY_LENGTH)
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, "utf8", "hex")
  encrypted += cipher.final("hex")

  const authTag = cipher.getAuthTag()

  // Return IV + AuthTag + Encrypted data as base64
  return Buffer.concat([iv, authTag, Buffer.from(encrypted, "hex")]).toString("base64")
}

export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey()
  const data = Buffer.from(ciphertext, "base64")

  const iv = data.subarray(0, IV_LENGTH)
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

// For encrypting sensitive fields like phone numbers, national IDs
export function encryptField(value: string): string {
  if (!value) return value
  return encrypt(value)
}

export function decryptField(value: string): string {
  if (!value) return value
  try {
    return decrypt(value)
  } catch {
    // Return original if decryption fails (backwards compatibility)
    return value
  }
}

// Password hashing with bcrypt-like security using scrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const hash = crypto.scryptSync(password, salt, 64)
  return `${salt.toString("hex")}:${hash.toString("hex")}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":")
  if (!saltHex || !hashHex) return false

  const salt = Buffer.from(saltHex, "hex")
  const hash = Buffer.from(hashHex, "hex")
  const verifyHash = crypto.scryptSync(password, salt, 64)

  return crypto.timingSafeEqual(hash, verifyHash)
}
