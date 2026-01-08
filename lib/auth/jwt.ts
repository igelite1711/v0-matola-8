/**
 * JWT Authentication Utilities
 * PRD Requirements: JWT with 24h expiry, refresh tokens
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "matola-secret-key-change-in-production")
const ACCESS_TOKEN_EXPIRY = "24h" // 24 hours as per PRD
const REFRESH_TOKEN_EXPIRY = "7d"

export interface TokenPayload extends JWTPayload {
  userId: string
  phone: string
  role: string
}

/**
 * Generate access token (24h expiry)
 */
export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer("matola")
    .setAudience("matola-users")
    .sign(SECRET)
}

/**
 * Generate refresh token (7 days)
 */
export async function generateRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuer("matola")
    .setAudience("matola-users")
    .sign(SECRET)
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, SECRET, {
    issuer: "matola",
    audience: "matola-users",
  })
  return payload as TokenPayload
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7)
}

