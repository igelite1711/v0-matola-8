// CSRF Validation Middleware
// Validates CSRF tokens on state-changing operations (POST, PUT, PATCH, DELETE)

import { NextRequest, NextResponse } from "next/server"
import {
  validateCSRFToken,
  requiresCSRFValidation,
  getCSRFHeaderName,
} from "@/lib/security/csrf"
import { createErrorResponse, errorCodes } from "@/lib/api/utils/error-handler"

export async function validateCSRF(
  request: NextRequest,
): Promise<NextResponse | null> {
  // Only validate state-changing operations
  if (!requiresCSRFValidation(request.method)) {
    return null // No error, continue processing
  }

  // Skip CSRF validation for certain endpoints (webhooks, etc)
  const { pathname } = new URL(request.url)
  const skipCSRFPaths = [
    "/api/payments/webhook",
    "/api/ussd/webhook",
    "/api/ussd/callback",
    "/api/whatsapp/webhook",
  ]

  if (skipCSRFPaths.some((path) => pathname.startsWith(path))) {
    return null // No CSRF validation needed for webhooks
  }

  // Get CSRF token from request header
  const token = request.headers.get(getCSRFHeaderName())

  if (!token) {
    console.warn("CSRF token missing for", {
      method: request.method,
      path: pathname,
    })

    return createErrorResponse(
      "CSRF token is required",
      errorCodes.FORBIDDEN,
      403,
      { message: "Missing or invalid CSRF token" },
    )
  }

  // Validate the CSRF token
  const isValid = await validateCSRFToken(token)

  if (!isValid) {
    console.warn("CSRF token validation failed", {
      method: request.method,
      path: pathname,
      token: token.substring(0, 10) + "...",
    })

    return createErrorResponse(
      "CSRF validation failed",
      errorCodes.FORBIDDEN,
      403,
      { message: "Invalid or expired CSRF token" },
    )
  }

  // Token is valid, continue processing
  return null
}

// Helper to apply CSRF middleware in route handlers
export async function withCSRFProtection(
  request: NextRequest,
): Promise<NextResponse | null> {
  return await validateCSRF(request)
}
