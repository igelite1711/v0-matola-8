import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { matchingApiService } from "@/lib/api/services/matching"

/**
 * POST /api/matching/[matchId]/accept
 * Transporter accepts a match
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  const { matchId } = await params

  // Only transporters can accept matches
  if (authResult.user.role !== "transporter") {
    return NextResponse.json({ error: "Only transporters can accept matches", code: "FORBIDDEN" }, { status: 403 })
  }

  try {
    const result = matchingApiService.acceptMatch(matchId, authResult.user.userId)

    if (!result.success) {
      return NextResponse.json({ error: result.message, code: "ACCEPT_FAILED" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      matchId,
    })
  } catch (error) {
    const { logger } = await import("@/lib/monitoring/logger")
    logger.error("Accept match error", {
      matchId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
