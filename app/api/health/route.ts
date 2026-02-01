/**
 * Health Check Endpoint - Basic Liveness
 * PRD Requirement: GET /health → Always returns 200
 */
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "matola-api",
      version: process.env.APP_VERSION || "1.0.0",
    },
    { status: 200 },
  )
}
