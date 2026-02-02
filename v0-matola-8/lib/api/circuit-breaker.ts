// Circuit breaker pattern for resilient API calls
// Prevents cascade failures during connectivity issues

export type CircuitState = "closed" | "open" | "half-open"

export interface CircuitBreakerOptions {
  failureThreshold: number // Number of failures before opening
  successThreshold: number // Number of successes in half-open to close
  timeout: number // Time to wait before half-open (ms)
  monitorInterval?: number // Health check interval when open (ms)
}

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailure: number | null
  lastSuccess: number | null
  totalRequests: number
  totalFailures: number
}

export class CircuitBreaker {
  private state: CircuitState = "closed"
  private failures = 0
  private successes = 0
  private lastFailure: number | null = null
  private lastSuccess: number | null = null
  private totalRequests = 0
  private totalFailures = 0
  private nextRetry = 0
  private options: Required<CircuitBreakerOptions>

  constructor(
    private name: string,
    options: CircuitBreakerOptions,
  ) {
    this.options = {
      monitorInterval: 30000,
      ...options,
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++

    // Check if circuit should transition from open to half-open
    if (this.state === "open") {
      if (Date.now() >= this.nextRetry) {
        this.state = "half-open"
        console.log(`[CircuitBreaker:${this.name}] Transitioning to half-open`)
      } else {
        throw new CircuitOpenError(`Circuit breaker ${this.name} is open. Retry after ${this.nextRetry - Date.now()}ms`)
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.lastSuccess = Date.now()
    this.failures = 0

    if (this.state === "half-open") {
      this.successes++
      if (this.successes >= this.options.successThreshold) {
        this.state = "closed"
        this.successes = 0
        console.log(`[CircuitBreaker:${this.name}] Circuit closed`)
      }
    }
  }

  private onFailure(): void {
    this.lastFailure = Date.now()
    this.totalFailures++
    this.failures++
    this.successes = 0

    if (this.state === "half-open") {
      this.state = "open"
      this.nextRetry = Date.now() + this.options.timeout
      console.log(`[CircuitBreaker:${this.name}] Circuit reopened after half-open failure`)
    } else if (this.failures >= this.options.failureThreshold) {
      this.state = "open"
      this.nextRetry = Date.now() + this.options.timeout
      console.log(`[CircuitBreaker:${this.name}] Circuit opened after ${this.failures} failures`)
    }
  }

  isOpen(): boolean {
    return this.state === "open"
  }

  isClosed(): boolean {
    return this.state === "closed"
  }

  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
    }
  }

  reset(): void {
    this.state = "closed"
    this.failures = 0
    this.successes = 0
    console.log(`[CircuitBreaker:${this.name}] Circuit manually reset`)
  }
}

export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "CircuitOpenError"
  }
}

// Pre-configured circuit breakers for different services
export const circuitBreakers = {
  airtelMoney: new CircuitBreaker("airtel-money", {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000, // 30 seconds
  }),
  tnmMpamba: new CircuitBreaker("tnm-mpamba", {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 30000,
  }),
  database: new CircuitBreaker("database", {
    failureThreshold: 3,
    successThreshold: 1,
    timeout: 10000, // 10 seconds
  }),
  externalApi: new CircuitBreaker("external-api", {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 1 minute
  }),
}

// Wrapper function for easy use
export async function withCircuitBreaker<T>(
  breaker: CircuitBreaker,
  operation: () => Promise<T>,
  fallback?: () => T,
): Promise<T> {
  try {
    return await breaker.execute(operation)
  } catch (error) {
    if (error instanceof CircuitOpenError && fallback) {
      console.log(`[CircuitBreaker] Using fallback due to open circuit`)
      return fallback()
    }
    throw error
  }
}
