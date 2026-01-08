/**
 * Health Check Endpoint
 * Provides comprehensive health status for monitoring
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/monitoring/logger'

// Initialize Redis client for health check
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

export const dynamic = 'force-dynamic'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: ServiceHealth
    redis: ServiceHealth
    api: ServiceHealth
  }
  metrics: {
    uptime: number
    memory: NodeJS.MemoryUsage
  }
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded'
  responseTime?: number
  error?: string
}

const startTime = Date.now()

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      api: { status: 'up' },
    },
    metrics: {
      uptime: Math.floor((Date.now() - startTime) / 1000),
      memory: process.memoryUsage(),
    },
  }

  // Determine overall status
  const serviceStatuses = Object.values(health.services).map((s) => s.status)
  if (serviceStatuses.some((s) => s === 'down')) {
    health.status = 'unhealthy'
  } else if (serviceStatuses.some((s) => s === 'degraded')) {
    health.status = 'degraded'
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503

  // Log health check
  logger.info('Health check', {
    status: health.status,
    services: health.services,
  })

  return NextResponse.json(health, { status: statusCode })
}

async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - start

    if (responseTime > 1000) {
      return { status: 'degraded', responseTime }
    }

    return { status: 'up', responseTime }
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    if (!redis) {
      return { status: 'down', error: 'Redis client not initialized' }
    }

    await redis.ping()
    const responseTime = Date.now() - start

    if (responseTime > 500) {
      return { status: 'degraded', responseTime }
    }

    return { status: 'up', responseTime }
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
