import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { matchingApiService } from "@/lib/api/services/matching"
import { logger } from "@/lib/monitoring/logger"

/**
 * GET /api/matching/admin/review
 * Get all matches pending admin review
 */
export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  // Check admin role
  if (authResult.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 })
  }

  try {
    const pendingReviews = matchingApiService.getPendingReviews()

    return NextResponse.json({
      items: pendingReviews,
      total: pendingReviews.length,
      reviewCriteria: {
        highValueThreshold: 500000,
        minTransporterRatings: 5,
        verificationRequired: true,
      },
    })
  } catch (error) {
    logger.error("Get pending reviews error", {
      userId: authResult?.user?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}

/**
 * POST /api/matching/admin/review
 * Approve or reject a match
 */
export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  // Check admin role
  if (authResult.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { matchId, action, notes } = body as {
      matchId: string
      action: "approve" | "reject" | "flag"
      notes?: string
    }

    if (!matchId || !action) {
      return NextResponse.json({ error: "Missing matchId or action", code: "INVALID_REQUEST" }, { status: 400 })
    }

    if (!["approve", "reject", "flag"].includes(action)) {
      return NextResponse.json({ error: "Invalid action", code: "INVALID_REQUEST" }, { status: 400 })
    }

    const result = matchingApiService.reviewMatch(matchId, action, notes)

    if (!result.success) {
      return NextResponse.json({ error: result.message, code: "REVIEW_FAILED" }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    logger.error("Review match error", {
      matchId: body?.matchId,
      userId: authResult?.user?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
