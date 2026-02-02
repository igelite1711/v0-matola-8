/**
 * Next.js Middleware - Security Headers, CORS, Request Logging
 * PRD Requirements: Security headers, CORS, request logging
 */
import { NextResponse, type NextRequest } from "next/server"
import { applySecurityHeaders, applyCORSHeaders } from "@/lib/security/security-headers"
import { logger } from "@/lib/monitoring/logger"
import { apiMetrics } from "@/lib/monitoring/metrics"

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // Create response
  let response = NextResponse.next()

  // Add request ID to headers
  response.headers.set("X-Request-ID", requestId)

  // Apply security headers
  response = applySecurityHeaders(response)

  // Apply CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response = applyCORSHeaders(response, request)

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: response.headers,
      })
    }
  }

  // Log API requests
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const duration = Date.now() - startTime
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"

    logger.info("API Request", {
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
      ip,
      duration,
      userAgent: request.headers.get("user-agent") || undefined,
    })

    // Record metrics
    apiMetrics.recordResponseTime(request.nextUrl.pathname, request.method, duration)
    apiMetrics.incrementRequests(request.nextUrl.pathname, request.method, "2xx")
  }

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
