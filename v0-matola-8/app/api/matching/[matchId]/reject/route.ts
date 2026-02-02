import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { matchingApiService } from "@/lib/api/services/matching"
import { logger } from "@/lib/monitoring/logger"

/**
 * POST /api/matching/[matchId]/reject
 * Transporter rejects a match
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  const { matchId } = await params

  // Only transporters can reject matches
  if (authResult.user.role !== "transporter") {
    return NextResponse.json({ error: "Only transporters can reject matches", code: "FORBIDDEN" }, { status: 403 })
  }

  try {
    const result = matchingApiService.rejectMatch(matchId, authResult.user.userId)

    if (!result.success) {
      return NextResponse.json({ error: result.message, code: "REJECT_FAILED" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      matchId,
    })
  } catch (error) {
    logger.error("Reject match error", {
      matchId,
      userId: authResult?.user?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
