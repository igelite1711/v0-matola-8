// Redis client utility
// Uses Upstash for managed Redis in production, local Redis in development

import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL || "redis://localhost:6379",
})

export { redis }

// Token blacklist functions
export const tokenBlacklist = {
  // Add a token to the blacklist with expiration
  async revoke(token: string, expirySeconds: number): Promise<void> {
    try {
      const key = `blacklist:${token}`
      // Store with TTL equal to token expiry
      await redis.setex(key, expirySeconds, "1")
    } catch (error) {
      console.error("Failed to revoke token:", error)
      throw error
    }
  },

  // Check if a token is blacklisted
  async isRevoked(token: string): Promise<boolean> {
    try {
      const key = `blacklist:${token}`
      const value = await redis.get(key)
      return value === "1"
    } catch (error) {
      console.error("Failed to check token blacklist:", error)
      return false // Fail open - don't reject token if Redis is down
    }
  },

  // Clear a token from blacklist (optional)
  async clear(token: string): Promise<void> {
    try {
      const key = `blacklist:${token}`
      await redis.del(key)
    } catch (error) {
      console.error("Failed to clear token from blacklist:", error)
    }
  },
}

// Session cache functions (used for rate limiting, OTP storage, etc)
export const cache = {
  // Set a value with expiration
  async set<T>(key: string, value: T, expirySeconds?: number): Promise<void> {
    try {
      if (expirySeconds) {
        await redis.setex(key, expirySeconds, JSON.stringify(value))
      } else {
        await redis.set(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Failed to set cache for key ${key}:`, error)
      throw error
    }
  },

  // Get a value from cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get(key)
      if (value === null) return null
      return JSON.parse(String(value))
    } catch (error) {
      console.error(`Failed to get cache for key ${key}:`, error)
      return null
    }
  },

  // Delete a value from cache
  async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error(`Failed to delete cache for key ${key}:`, error)
    }
  },

  // Increment a counter (for rate limiting)
  async increment(key: string, expirySeconds?: number): Promise<number> {
    try {
      let count = await redis.incr(key)
      if (expirySeconds && count === 1) {
        // Only set expiry on first increment
        await redis.expire(key, expirySeconds)
      }
      return count
    } catch (error) {
      console.error(`Failed to increment counter ${key}:`, error)
      throw error
    }
  },

  // Check if rate limit exceeded
  async isRateLimited(
    key: string,
    maxAttempts: number,
    windowSeconds: number,
  ): Promise<boolean> {
    try {
      const count = await this.increment(key, windowSeconds)
      return count > maxAttempts
    } catch {
      return false // Fail open - don't rate limit if Redis is down
    }
  },
}
