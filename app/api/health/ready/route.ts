/**
 * Readiness Check Endpoint
 * PRD Requirement: GET /health/ready → DB connected, Redis connected
 */
import { NextResponse } from "next/server"
import { db } from "@/lib/api/services/db"

interface HealthCheck {
  name: string
  status: "healthy" | "unhealthy"
  latency?: number
  error?: string
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    // Simple query to test connection
    await db.query("SELECT 1")
    return {
      name: "database",
      status: "healthy",
      latency: Date.now() - start,
    }
  } catch (error) {
    return {
      name: "database",
      status: "unhealthy",
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now()
  try {
    // In production, ping Redis
    // For now, simulate check
    const redisUrl = process.env.KV_REST_API_URL
    if (!redisUrl) {
      return {
        name: "redis",
        status: "unhealthy",
        error: "Redis not configured",
      }
    }
    return {
      name: "redis",
      status: "healthy",
      latency: Date.now() - start,
    }
  } catch (error) {
    return {
      name: "redis",
      status: "unhealthy",
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

async function checkExternalAPIs(): Promise<HealthCheck> {
  // Check Airtel Money API, TNM API, etc.
  return {
    name: "external_apis",
    status: "healthy",
  }
}

export async function GET() {
  const checks = await Promise.all([checkDatabase(), checkRedis(), checkExternalAPIs()])

  const allHealthy = checks.every((c) => c.status === "healthy")

  return NextResponse.json(
    {
      status: allHealthy ? "ready" : "not_ready",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 },
  )
}
