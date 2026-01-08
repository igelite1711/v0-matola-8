import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { db } from "@/lib/api/services/db"
import { logger } from "@/lib/monitoring/logger"

export async function POST(req: NextRequest, { params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params

  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth - only transporters can reject
  const authResult = await authMiddleware(req, {
    requiredRoles: ["transporter", "admin"],
  })
  if (!isAuthenticated(authResult)) return authResult

  const { user } = authResult

  try {
    const match = await db.getMatchById(matchId)

    if (!match) {
      return NextResponse.json({ error: "Match not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // Verify this match belongs to the user
    if (match.transporter_id !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "This match is not assigned to you", code: "FORBIDDEN" }, { status: 403 })
    }

    if (match.status !== "pending") {
      return NextResponse.json({ error: "Can only reject pending matches", code: "INVALID_STATUS" }, { status: 400 })
    }

    // Update match status
    const updated = await db.updateMatch(matchId, {
      status: "rejected",
      rejected_at: new Date().toISOString(),
    })

    // Audit log
    await db.createAuditLog({
      user_id: user.userId,
      action: "reject",
      entity: "match",
      entity_id: matchId,
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json({
      message: "Match rejected",
      match: updated,
    })
  } catch (error) {
    logger.error("Reject match error", {
      matchId,
      userId: user?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
