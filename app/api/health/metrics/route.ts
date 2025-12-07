/**
 * Metrics Endpoint - Prometheus Format
 * PRD Requirement: GET /health/metrics → Prometheus-format metrics
 */
import { NextResponse } from "next/server"
import { metrics } from "@/lib/monitoring/metrics"

export async function GET() {
  const prometheusMetrics = metrics.toPrometheusFormat()

  return new NextResponse(prometheusMetrics, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
