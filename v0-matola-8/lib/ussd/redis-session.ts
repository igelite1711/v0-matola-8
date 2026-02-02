// Redis-backed USSD session management
// PRD: Session timeout 300 seconds, Key format: ussd:session:{sessionId}

import type { UssdSession } from "./state-machine"
import type { Language } from "@/lib/translations"

// Session configuration from PRD
const SESSION_TTL_SECONDS = 300 // 5 minutes
const SESSION_KEY_PREFIX = "ussd:session:"
const MAX_RETRY_COUNT = 3

// In-memory fallback for development (use Redis in production)
const sessionStore = new Map<string, { data: UssdSession; expiry: number }>()

// Cleanup expired sessions periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of sessionStore.entries()) {
      if (value.expiry < now) {
        sessionStore.delete(key)
      }
    }
  }, 60000) // Every minute
}

export interface RedisClient {
  get(key: string): Promise<string | null>
  setex(key: string, seconds: number, value: string): Promise<void>
  del(key: string): Promise<void>
}

// Default in-memory implementation
const inMemoryRedis: RedisClient = {
  async get(key: string) {
    const entry = sessionStore.get(key)
    if (entry && entry.expiry > Date.now()) {
      return JSON.stringify(entry.data)
    }
    return null
  },
  async setex(key: string, seconds: number, value: string) {
    sessionStore.set(key, {
      data: JSON.parse(value),
      expiry: Date.now() + seconds * 1000,
    })
  },
  async del(key: string) {
    sessionStore.delete(key)
  },
}

// Redis client singleton (inject real Redis in production)
let redisClient: RedisClient = inMemoryRedis

export function setRedisClient(client: RedisClient) {
  redisClient = client
}

// Get session from Redis
export async function getSession(sessionId: string): Promise<UssdSession | null> {
  const key = `${SESSION_KEY_PREFIX}${sessionId}`
  const data = await redisClient.get(key)

  if (!data) return null

  try {
    const session = JSON.parse(data) as UssdSession

    // Check if session has timed out
    const elapsed = Date.now() - session.updatedAt
    if (elapsed > SESSION_TTL_SECONDS * 1000) {
      await deleteSession(sessionId)
      return null
    }

    return session
  } catch {
    return null
  }
}

// Create new session
export async function createSession(sessionId: string, phone: string, language: Language = "en"): Promise<UssdSession> {
  const now = Date.now()

  const session: UssdSession = {
    sessionId,
    phone,
    state: "WELCOME",
    language,
    context: {
      history: [],
    },
    retryCount: 0,
    createdAt: now,
    updatedAt: now,
  }

  await saveSession(session)
  return session
}

// Save session to Redis
export async function saveSession(session: UssdSession): Promise<void> {
  const key = `${SESSION_KEY_PREFIX}${session.sessionId}`
  session.updatedAt = Date.now()

  await redisClient.setex(key, SESSION_TTL_SECONDS, JSON.stringify(session))
}

// Update session state
export async function updateSession(sessionId: string, updates: Partial<UssdSession>): Promise<UssdSession | null> {
  const session = await getSession(sessionId)
  if (!session) return null

  const updated: UssdSession = {
    ...session,
    ...updates,
    updatedAt: Date.now(),
  }

  await saveSession(updated)
  return updated
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  const key = `${SESSION_KEY_PREFIX}${sessionId}`
  await redisClient.del(key)
}

// Increment retry count and check if exceeded
export async function incrementRetry(sessionId: string): Promise<boolean> {
  const session = await getSession(sessionId)
  if (!session) return true // Session expired

  session.retryCount++
  await saveSession(session)

  return session.retryCount >= MAX_RETRY_COUNT
}

// Detect language from phone number (Malawi: +265 or 0)
export function detectLanguageFromPhone(phone: string): Language {
  // Default to English, but could be enhanced with user preferences
  // Malawian numbers typically start with +265 or 0
  return "en"
}

// Get session statistics for monitoring
export async function getSessionStats(): Promise<{
  activeSessions: number
  avgSessionAge: number
}> {
  let count = 0
  let totalAge = 0
  const now = Date.now()

  for (const [, value] of sessionStore.entries()) {
    if (value.expiry > now) {
      count++
      totalAge += now - value.data.createdAt
    }
  }

  return {
    activeSessions: count,
    avgSessionAge: count > 0 ? totalAge / count : 0,
  }
}
