/**
 * Metrics Endpoint
 * Exposes application metrics in Prometheus format
 */

import { NextResponse } from 'next/server'
import { metrics } from '@/lib/monitoring/metrics'

export const dynamic = 'force-dynamic'

export async function GET() {
  const prometheusMetrics = metrics.exportPrometheus()

  return new NextResponse(prometheusMetrics, {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4',
    },
  })
}
