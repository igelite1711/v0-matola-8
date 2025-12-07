// Network timeout configuration for Malawi's connectivity
// PRD Requirements: USSD <1s, API 5s, Payments 30s, DB 3s

export const TIMEOUT_CONFIG = {
  // USSD must respond within 1 second
  ussd: 1000,

  // Standard API calls
  api: 5000,

  // Payment provider calls (Airtel/TNM)
  payment: 30000,

  // Database queries
  database: 3000,

  // External API calls
  external: 10000,

  // File uploads (larger timeout)
  upload: 60000,

  // Health checks
  health: 2000,
} as const

export type TimeoutType = keyof typeof TIMEOUT_CONFIG

// Create abort signal with configured timeout
export function createTimeoutSignal(type: TimeoutType): AbortSignal {
  return AbortSignal.timeout(TIMEOUT_CONFIG[type])
}

// Wrapper for fetch with configured timeout
export async function fetchWithTimeout(url: string, options: RequestInit, timeoutType: TimeoutType): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_CONFIG[timeoutType])

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// Log slow operations for monitoring
export function logSlowOperation(operation: string, duration: number, threshold: number): void {
  if (duration > threshold) {
    console.warn(`[Performance] ${operation} exceeded threshold: ${duration}ms (limit: ${threshold}ms)`)
  }
}
