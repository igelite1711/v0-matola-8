/**
 * CSRF Protection
 * PRD Requirement: CSRF tokens for state-changing operations
 */
import crypto from "crypto"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = "__csrf_token"
const CSRF_HEADER_NAME = "x-csrf-token"
const CSRF_EXPIRY_SECONDS = 3600 // 1 hour

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex")
}

export async function setCSRFCookie(): Promise<string> {
  const token = generateCSRFToken()
  const cookieStore = await cookies()

  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: CSRF_EXPIRY_SECONDS,
    path: "/",
  })

  return token
}

export async function validateCSRF(request: NextRequest): Promise<boolean> {
  // Skip CSRF for GET, HEAD, OPTIONS
  const method = request.method.toUpperCase()
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true
  }

  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value
  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) {
    return false
  }

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  } catch {
    return false
  }
}

export function csrfErrorResponse(): NextResponse {
  return NextResponse.json({ error: "CSRF token invalid", code: "CSRF_ERROR" }, { status: 403 })
}
