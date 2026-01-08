/**
 * Rate Limiting Middleware
 * PRD Requirements: 60 req/min (general), 10 req/sec (USSD)
 */

import { Redis } from "@upstash/redis"

// Initialize Redis client (works with Upstash or local Redis)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyPrefix: string // Redis key prefix
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

/**
 * Rate limit check using sliding window algorithm
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  // Fallback to in-memory if Redis not available (development)
  if (!redis) {
    return { allowed: true, remaining: config.maxRequests, resetTime: Date.now() + config.windowMs }
  }

  const key = `${config.keyPrefix}:${identifier}`
  const now = Date.now()
  const windowStart = now - config.windowMs

  try {
    // Get current count
    const count = await redis.zcount(key, windowStart, now)

    if (count >= config.maxRequests) {
      // Get oldest request time to calculate reset
      const oldest = await redis.zrange(key, 0, 0, { withScores: true })
      const resetTime = oldest.length > 0 ? Number(oldest[0].score) + config.windowMs : now + config.windowMs

      return {
        allowed: false,
        remaining: 0,
        resetTime,
      }
    }

    // Add current request
    await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    // Set expiry
    await redis.expire(key, Math.ceil(config.windowMs / 1000))

    return {
      allowed: true,
      remaining: config.maxRequests - count - 1,
      resetTime: now + config.windowMs,
    }
  } catch (error) {
    // On error, allow request (fail open)
    console.error("Rate limit error:", error)
    return { allowed: true, remaining: config.maxRequests, resetTime: now + config.windowMs }
  }
}

/**
 * General API rate limit: 60 requests per minute
 */
export async function checkGeneralRateLimit(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(identifier, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyPrefix: "ratelimit:general",
  })
}

/**
 * USSD rate limit: 10 requests per second
 */
export async function checkUSSDRateLimit(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(identifier, {
    windowMs: 1000, // 1 second
    maxRequests: 10,
    keyPrefix: "ratelimit:ussd",
  })
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": "60",
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
  }
}

