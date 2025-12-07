import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { db } from "@/lib/api/services/db"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  try {
    const payment = await db.getPaymentById(id)

    if (!payment) {
      return NextResponse.json({ error: "Payment not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // Verify user has access
    const { user } = authResult
    if (payment.payer_id !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "Access denied", code: "FORBIDDEN" }, { status: 403 })
    }

    return NextResponse.json({
      id: payment.id,
      reference: payment.reference,
      status: payment.status,
      amount_mwk: payment.amount_mwk,
      method: payment.method,
      paid_at: payment.paid_at,
      created_at: payment.created_at,
    })
  } catch (error) {
    console.error("Get payment status error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
