import { type NextRequest, NextResponse } from "next/server"

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyGenerator?: (req: NextRequest) => string // Custom key generator
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000) // Clean every minute

export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimit(req: NextRequest): Promise<NextResponse | null> {
    const key = config.keyGenerator
      ? config.keyGenerator(req)
      : req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous"

    const now = Date.now()
    const windowKey = `${key}:${Math.floor(now / config.windowMs)}`

    const current = rateLimitStore.get(windowKey) || {
      count: 0,
      resetAt: now + config.windowMs,
    }

    current.count++
    rateLimitStore.set(windowKey, current)

    if (current.count > config.maxRequests) {
      return NextResponse.json(
        {
          error: "Too many requests",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil((current.resetAt - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(current.resetAt),
          },
        },
      )
    }

    return null // Continue processing
  }
}

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 5,
})

export const otpRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 3,
  keyGenerator: (req) => {
    // Rate limit by phone number for OTP
    const url = new URL(req.url)
    return url.searchParams.get("phone") || "unknown"
  },
})

export const generalRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 60,
})

export const ussdRateLimiter = createRateLimiter({
  windowMs: 1000, // 1 second
  maxRequests: 10,
})

export const whatsappRateLimiter = createRateLimiter({
  windowMs: 1000,
  maxRequests: 50,
})
