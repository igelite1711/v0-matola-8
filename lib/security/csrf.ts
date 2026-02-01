// CSRF (Cross-Site Request Forgery) Protection
// Generates and validates CSRF tokens stored in Redis

import crypto from "crypto"
import { redis, cache } from "@/lib/redis/client"

const CSRF_TOKEN_EXPIRY = 3600 // 1 hour in seconds
const CSRF_COOKIE_NAME = "csrf-token"
const CSRF_HEADER_NAME = "X-CSRF-Token"

export interface CSRFTokenPayload {
  token: string
  createdAt: number
  expiresAt: number
}

export async function generateCSRFToken(): Promise<string> {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex")
  
  // Store in Redis with expiry
  const payload: CSRFTokenPayload = {
    token,
    createdAt: Date.now(),
    expiresAt: Date.now() + CSRF_TOKEN_EXPIRY * 1000,
  }
  
  await cache.set(`csrf:${token}`, payload, CSRF_TOKEN_EXPIRY)
  
  return token
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  try {
    if (!token) {
      return false
    }

    // Check if token exists and is not expired
    const payload = await cache.get<CSRFTokenPayload>(`csrf:${token}`)
    
    if (!payload) {
      return false
    }

    // Token is valid - optionally consume it (one-time use)
    // Uncomment if you want one-time use tokens:
    // await redis.del(`csrf:${token}`)
    
    return true
  } catch (error) {
    console.error("CSRF token validation error:", error)
    return false
  }
}

export async function revokeCSRFToken(token: string): Promise<void> {
  try {
    await redis.del(`csrf:${token}`)
  } catch (error) {
    console.error("Failed to revoke CSRF token:", error)
  }
}

export function getCSRFCookieName(): string {
  return CSRF_COOKIE_NAME
}

export function getCSRFHeaderName(): string {
  return CSRF_HEADER_NAME
}

// Middleware helper to check if request requires CSRF validation
export function requiresCSRFValidation(method: string): boolean {
  // State-changing operations require CSRF validation
  const statelessMethods = ["GET", "HEAD", "OPTIONS"]
  return !statelessMethods.includes(method.toUpperCase())
}
