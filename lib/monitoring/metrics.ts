/**
 * Application Metrics Collection
 * Tracks key performance indicators and business metrics
 */

import { logger } from './logger'

export interface Metric {
  name: string
  value: number
  timestamp: Date
  tags?: Record<string, string>
}

class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map()
  private counters: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()

  /**
   * Increment a counter metric
   */
  increment(name: string, value: number = 1, tags?: Record<string, string>) {
    const current = this.counters.get(name) || 0
    this.counters.set(name, current + value)

    this.record({
      name,
      value: current + value,
      timestamp: new Date(),
      tags,
    })
  }

  /**
   * Record a gauge (current value)
   */
  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.record({
      name,
      value,
      timestamp: new Date(),
      tags,
    })
  }

  /**
   * Record a histogram value (for response times, etc.)
   */
  histogram(name: string, value: number, tags?: Record<string, string>) {
    const values = this.histograms.get(name) || []
    values.push(value)
    this.histograms.set(name, values.slice(-1000)) // Keep last 1000 values

    this.record({
      name: `${name}.histogram`,
      value,
      timestamp: new Date(),
      tags,
    })
  }

  /**
   * Get counter value
   */
  getCounter(name: string): number {
    return this.counters.get(name) || 0
  }

  /**
   * Get histogram statistics
   */
  getHistogramStats(name: string): {
    count: number
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
  } | null {
    const values = this.histograms.get(name)
    if (!values || values.length === 0) {
      return null
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)

    return {
      count: sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }

  /**
   * Get all metrics for export
   */
  getAllMetrics(): Metric[] {
    const all: Metric[] = []
    this.metrics.forEach((metrics) => {
      all.push(...metrics)
    })
    return all
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = []

    // Counters
    this.counters.forEach((value, name) => {
      lines.push(`# TYPE ${name} counter`)
      lines.push(`${name} ${value}`)
    })

    // Histograms
    this.histograms.forEach((values, name) => {
      const stats = this.getHistogramStats(name)
      if (stats) {
        lines.push(`# TYPE ${name}_histogram histogram`)
        lines.push(`${name}_count ${stats.count}`)
        lines.push(`${name}_sum ${stats.avg * stats.count}`)
        lines.push(`${name}_min ${stats.min}`)
        lines.push(`${name}_max ${stats.max}`)
        lines.push(`${name}_avg ${stats.avg}`)
        lines.push(`${name}_p50 ${stats.p50}`)
        lines.push(`${name}_p95 ${stats.p95}`)
        lines.push(`${name}_p99 ${stats.p99}`)
      }
    })

    return lines.join('\n')
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics.clear()
    this.counters.clear()
    this.histograms.clear()
  }

  private record(metric: Metric) {
    const metrics = this.metrics.get(metric.name) || []
    metrics.push(metric)
    // Keep last 1000 metrics per name
    this.metrics.set(metric.name, metrics.slice(-1000))

    // Log important metrics
    if (metric.name.includes('error') || metric.name.includes('latency')) {
      logger.warn('Metric recorded', { metric })
    }
  }
}

export const metrics = new MetricsCollector()

// Business metrics helpers
export const businessMetrics = {
  shipmentCreated: (userId: string) => {
    metrics.increment('shipments.created', 1, { userId })
  },
  shipmentMatched: (shipmentId: string) => {
    metrics.increment('shipments.matched', 1, { shipmentId })
  },
  paymentProcessed: (amount: number, method: string) => {
    metrics.increment('payments.processed', 1, { method })
    metrics.gauge('payments.amount', amount, { method })
  },
  userRegistered: (role: string) => {
    metrics.increment('users.registered', 1, { role })
  },
  apiRequest: (path: string, method: string, duration: number, statusCode: number) => {
    metrics.histogram('api.request.duration', duration, { path, method, status: statusCode.toString() })
    metrics.increment('api.requests', 1, { path, method, status: statusCode.toString() })
  },
}

// API metrics helpers for middleware
export const apiMetrics = {
  recordResponseTime: (path: string, method: string, duration: number) => {
    metrics.histogram('api.response_time', duration, { path, method })
  },
  incrementRequests: (path: string, method: string, statusCode: string) => {
    metrics.increment('api.request_count', 1, { path, method, status: statusCode })
  },
}
