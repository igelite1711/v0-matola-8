import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { db } from "@/lib/api/services/db"

export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  try {
    const { user } = authResult
    const matches = await db.getMatchesByUser(user.userId, user.role)

    return NextResponse.json({
      items: matches,
      total: matches.length,
    })
  } catch (error) {
    console.error("Get matches error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
