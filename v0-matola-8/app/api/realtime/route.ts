/**
 * Real-time Updates API
 * Uses Server-Sent Events (SSE) for live updates
 */

import { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        // Send initial connection message
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        send({ type: "connected", userId: auth.userId })

        // Keep connection alive with heartbeat
        const heartbeat = setInterval(() => {
          send({ type: "heartbeat", timestamp: Date.now() })
        }, 30000) // Every 30 seconds

        // Cleanup on close
        request.signal.addEventListener("abort", () => {
          clearInterval(heartbeat)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return new Response("Unauthorized", { status: 401 })
    }
    logger.error("Error setting up SSE", {
      error: error instanceof Error ? error.message : String(error),
    })
    return new Response("Internal server error", { status: 500 })
  }
}

