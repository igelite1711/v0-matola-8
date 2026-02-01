// Consistent error handling utility for API routes

import { NextResponse } from "next/server"
import { ZodError } from "zod"

export interface ApiErrorResponse {
  error: string
  code: string
  details?: unknown
  requestId?: string
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: unknown,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const errorCodes = {
  // Authentication (401)
  MISSING_TOKEN: "MISSING_TOKEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",

  // Validation (400)
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_REQUEST: "INVALID_REQUEST",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",

  // Authorization (403)
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_ROLE: "INSUFFICIENT_ROLE",

  // Not Found (404)
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",

  // Conflict (409)
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // Rate Limiting (429)
  RATE_LIMITED: "RATE_LIMITED",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Server Errors (500)
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",

  // Service-specific
  PAYMENT_ERROR: "PAYMENT_ERROR",
  SMS_ERROR: "SMS_ERROR",
  VERIFICATION_ERROR: "VERIFICATION_ERROR",
} as const

export function createErrorResponse(
  error: string,
  code: string,
  statusCode: number = 400,
  details?: unknown,
  requestId?: string,
): NextResponse {
  const response: ApiErrorResponse = {
    error,
    code,
    ...(details && { details }),
    ...(requestId && { requestId }),
  }

  return NextResponse.json(response, { status: statusCode })
}

export function handleRouteError(
  error: unknown,
  requestId?: string,
): NextResponse {
  // ZodError - validation error
  if (error instanceof ZodError) {
    return createErrorResponse(
      "Validation error",
      errorCodes.VALIDATION_ERROR,
      400,
      error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      })),
      requestId,
    )
  }

  // Custom ApiError
  if (error instanceof ApiError) {
    return createErrorResponse(
      error.message,
      error.code,
      error.statusCode,
      error.details,
      requestId,
    )
  }

  // Generic Error
  if (error instanceof Error) {
    // Log the error for debugging
    console.error("API Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      requestId,
    })

    // Don't expose internal error details in production
    return createErrorResponse(
      "Internal server error",
      errorCodes.INTERNAL_ERROR,
      500,
      process.env.NODE_ENV === "development" ? error.message : undefined,
      requestId,
    )
  }

  // Unknown error
  console.error("Unknown API Error:", { error, requestId })
  return createErrorResponse(
    "Internal server error",
    errorCodes.INTERNAL_ERROR,
    500,
    undefined,
    requestId,
  )
}

// Helper function to validate authentication result
export function isAuthenticated(result: unknown): result is { userId: string; phone: string; role: string } {
  return (
    typeof result === "object" &&
    result !== null &&
    "userId" in result &&
    "phone" in result &&
    "role" in result
  )
}

// Helper function for role checking
export function checkRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole)
}

// Helper function for rate limit error response
export function createRateLimitResponse(
  retryAfter?: number,
  requestId?: string,
): NextResponse {
  const response = createErrorResponse(
    "Too many requests",
    errorCodes.RATE_LIMITED,
    429,
    { retryAfter: retryAfter ?? 60 },
    requestId,
  )

  if (retryAfter) {
    response.headers.set("Retry-After", String(retryAfter))
    response.headers.set("X-RateLimit-Reset", String(Math.floor(Date.now() / 1000) + retryAfter))
  }

  return response
}
