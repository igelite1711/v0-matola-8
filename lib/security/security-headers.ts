/**
 * Security Headers Middleware
 * PRD Requirements: Helmet.js equivalent, CSP, HSTS, etc.
 */
import type { NextResponse, NextRequest } from "next/server"

export interface SecurityHeadersConfig {
  isDevelopment?: boolean
  allowedOrigins?: string[]
}

export function getSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const isDev = config.isDevelopment ?? process.env.NODE_ENV === "development"

  return {
    // Strict Transport Security - enforce HTTPS
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Prevent clickjacking
    "X-Frame-Options": "DENY",

    // XSS Protection (legacy but still useful)
    "X-XSS-Protection": "1; mode=block",

    // Referrer Policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Permissions Policy (formerly Feature-Policy)
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=(self)",

    // Content Security Policy
    "Content-Security-Policy": isDev
      ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: blob: https:; connect-src 'self' https: wss:;"
      : [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline'", // Next.js requires unsafe-inline
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' https://fonts.gstatic.com",
          "connect-src 'self' https://api.matola.mw https://*.airtel.africa https://openapi.tnm.co.mw",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),

    // Prevent IE from executing downloads in site's context
    "X-Download-Options": "noopen",

    // DNS Prefetch Control
    "X-DNS-Prefetch-Control": "on",
  }
}

export function applyCORSHeaders(
  response: NextResponse,
  request: NextRequest,
  config: SecurityHeadersConfig = {},
): NextResponse {
  const origin = request.headers.get("origin") || ""

  // Get allowed origins from environment variable or use provided config
  let allowedOrigins = config.allowedOrigins

  if (!allowedOrigins) {
    // Parse ALLOWED_ORIGINS from env var (comma-separated)
    const envOrigins = process.env.ALLOWED_ORIGINS
    allowedOrigins = envOrigins ? envOrigins.split(",").map((o) => o.trim()) : []
  }

  // Always add localhost in development
  const isDev = config.isDevelopment ?? process.env.NODE_ENV === "development"
  if (isDev) {
    if (!allowedOrigins.includes("http://localhost:3000")) {
      allowedOrigins.push("http://localhost:3000")
    }
    if (!allowedOrigins.includes("http://localhost:3001")) {
      allowedOrigins.push("http://localhost:3001")
    }
  }

  if (allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  }

  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID, X-CSRF-Token")
  response.headers.set("Access-Control-Max-Age", "86400")

  return response
}

export function applySecurityHeaders(response: NextResponse, config: SecurityHeadersConfig = {}): NextResponse {
  const headers = getSecurityHeaders(config)

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }

  return response
}
