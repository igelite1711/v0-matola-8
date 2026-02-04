import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify, SignJWT } from "jose"
import crypto from "crypto"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex"))
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET || (() => {
    throw new Error("REFRESH_SECRET environment variable is required")
  })()
)
const JWT_EXPIRY = "24h"
const JWT_EXPIRY_SECONDS = 86400
const REFRESH_EXPIRY = "7d"
const REFRESH_EXPIRY_SECONDS = 604800

export interface JWTPayload {
  userId: string
  phone: string
  role: "shipper" | "transporter" | "broker" | "admin"
  deviceHash?: string
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
  iat?: number
  exp?: number
}

// Token blacklist (use Redis in production)
const tokenBlacklist = new Set<string>()

export async function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)
}

export async function generateRefreshToken(userId: string): Promise<{ token: string; tokenId: string }> {
  const tokenId = crypto.randomUUID()
  const token = await new SignJWT({ userId, tokenId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .sign(REFRESH_SECRET)
  return { token, tokenId }
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    if (tokenBlacklist.has(token)) {
      return null
    }
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    if (tokenBlacklist.has(token)) {
      return null
    }
    const { payload } = await jwtVerify(token, REFRESH_SECRET)
    return payload as unknown as RefreshTokenPayload
  } catch {
    return null
  }
}

export function blacklistToken(token: string): void {
  tokenBlacklist.add(token)
}

export function getTokenExpirySeconds(): number {
  return JWT_EXPIRY_SECONDS
}

export function getRefreshExpirySeconds(): number {
  return REFRESH_EXPIRY_SECONDS
}

export async function authMiddleware(
  req: NextRequest,
  options?: { requiredRoles?: string[] },
): Promise<{ user: JWTPayload } | NextResponse> {
  const authHeader = req.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized", code: "MISSING_TOKEN" }, { status: 401 })
  }

  const token = authHeader.substring(7)
  const payload = await verifyToken(token)

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized", code: "INVALID_TOKEN" }, { status: 401 })
  }

  // Check role if required
  if (options?.requiredRoles && !options.requiredRoles.includes(payload.role)) {
    return NextResponse.json({ error: "Forbidden", code: "INSUFFICIENT_PERMISSIONS" }, { status: 403 })
  }

  return { user: payload }
}

// Helper to extract user from auth result
export function isAuthenticated(result: { user: JWTPayload } | NextResponse): result is { user: JWTPayload } {
  return "user" in result
}
