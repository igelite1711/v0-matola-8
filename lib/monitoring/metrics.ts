/**
 * Metrics Collection Service
 * PRD Requirements: API response times, error rates, business metrics
 */

interface MetricValue {
  value: number
  timestamp: number
  labels: Record<string, string>
}

interface HistogramBuckets {
  values: number[]
  count: number
  sum: number
}

class MetricsService {
  private counters = new Map<string, MetricValue[]>()
  private histograms = new Map<string, HistogramBuckets>()
  private gauges = new Map<string, MetricValue>()

  // Counter operations
  increment(name: string, value = 1, labels: Record<string, string> = {}): void {
    const key = this.getKey(name, labels)
    const existing = this.counters.get(key) || []
    existing.push({ value, timestamp: Date.now(), labels })
    this.counters.set(key, existing)
  }

  // Histogram operations (for response times)
  recordHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getKey(name, labels)
    const bucket = this.histograms.get(key) || { values: [], count: 0, sum: 0 }
    bucket.values.push(value)
    bucket.count++
    bucket.sum += value
    this.histograms.set(key, bucket)
  }

  // Gauge operations
  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getKey(name, labels)
    this.gauges.set(key, { value, timestamp: Date.now(), labels })
  }

  // Get percentile from histogram
  getPercentile(name: string, percentile: number, labels: Record<string, string> = {}): number {
    const key = this.getKey(name, labels)
    const bucket = this.histograms.get(key)
    if (!bucket || bucket.values.length === 0) return 0

    const sorted = [...bucket.values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  private getKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(",")
    return labelStr ? `${name}{${labelStr}}` : name
  }

  // Export metrics in Prometheus format
  toPrometheusFormat(): string {
    const lines: string[] = []

    // Counters
    for (const [key, values] of this.counters.entries()) {
      const total = values.reduce((sum, v) => sum + v.value, 0)
      lines.push(`# TYPE ${key.split("{")[0]} counter`)
      lines.push(`${key} ${total}`)
    }

    // Histograms
    for (const [key, bucket] of this.histograms.entries()) {
      const baseName = key.split("{")[0]
      lines.push(`# TYPE ${baseName} histogram`)
      lines.push(`${baseName}_count${key.includes("{") ? key.substring(key.indexOf("{")) : ""} ${bucket.count}`)
      lines.push(`${baseName}_sum${key.includes("{") ? key.substring(key.indexOf("{")) : ""} ${bucket.sum}`)
    }

    // Gauges
    for (const [key, metric] of this.gauges.entries()) {
      lines.push(`# TYPE ${key.split("{")[0]} gauge`)
      lines.push(`${key} ${metric.value}`)
    }

    return lines.join("\n")
  }

  // Get summary for dashboard
  getSummary(): Record<string, unknown> {
    return {
      api_response_time_p50: this.getPercentile("api.response_time", 50),
      api_response_time_p95: this.getPercentile("api.response_time", 95),
      api_response_time_p99: this.getPercentile("api.response_time", 99),
      counters: Object.fromEntries(
        [...this.counters.entries()].map(([k, v]) => [k, v.reduce((sum, val) => sum + val.value, 0)]),
      ),
      gauges: Object.fromEntries([...this.gauges.entries()].map(([k, v]) => [k, v.value])),
    }
  }

  // Reset metrics (for testing or periodic cleanup)
  reset(): void {
    this.counters.clear()
    this.histograms.clear()
    this.gauges.clear()
  }
}

export const metrics = new MetricsService()

// Pre-defined metric helpers
export const apiMetrics = {
  recordResponseTime: (path: string, method: string, duration: number) => {
    metrics.recordHistogram("api.response_time", duration, { path, method })
  },

  incrementRequests: (path: string, method: string, status: string) => {
    metrics.increment("api.requests", 1, { path, method, status })
  },

  incrementErrors: (path: string, method: string, errorType: string) => {
    metrics.increment("api.errors", 1, { path, method, error_type: errorType })
  },
}

export const businessMetrics = {
  incrementShipmentsCreated: () => {
    metrics.increment("shipments.created", 1)
  },

  incrementPaymentsCompleted: (method: string) => {
    metrics.increment("payments.completed", 1, { method })
  },

  incrementMatchesSuccessful: () => {
    metrics.increment("matches.successful", 1)
  },

  incrementUssdSessions: (language: string) => {
    metrics.increment("ussd.sessions", 1, { language })
  },

  setActiveUsers: (channel: string, count: number) => {
    metrics.setGauge("users.active", count, { channel })
  },
}
