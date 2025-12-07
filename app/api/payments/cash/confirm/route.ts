// Cash payment confirmation endpoint
// Called when support team verifies WhatsApp photo of cash payment

import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { db } from "@/lib/api/services/db"

export async function POST(req: NextRequest) {
  // Auth required (admin only)
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  const { user } = authResult

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { payment_id, verified, notes, whatsapp_image_url } = body

    if (!payment_id) {
      return NextResponse.json({ error: "Payment ID required", code: "VALIDATION_ERROR" }, { status: 400 })
    }

    // Get payment
    const payment = await db.getPaymentById(payment_id)
    if (!payment) {
      return NextResponse.json({ error: "Payment not found", code: "NOT_FOUND" }, { status: 404 })
    }

    if (payment.method !== "cash") {
      return NextResponse.json(
        { error: "This endpoint is for cash payments only", code: "INVALID_METHOD" },
        { status: 400 },
      )
    }

    // Update payment status
    const newStatus = verified ? "completed" : "failed"
    await db.updatePayment(payment.id, {
      status: newStatus,
      provider_reference: `CASH-${Date.now()}`,
      paid_at: verified ? new Date().toISOString() : null,
    })

    // Update shipment if verified
    if (verified) {
      await db.updateShipment(payment.shipment_id, {
        payment_status: "paid",
      })
    }

    // Audit log
    await db.createAuditLog({
      user_id: user.userId,
      action: "cash_payment_verified",
      entity: "payment",
      entity_id: payment.id,
      changes: {
        verified,
        notes,
        whatsapp_image_url,
        admin_id: user.userId,
      },
    })

    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      status: newStatus,
    })
  } catch (error) {
    console.error("Cash confirmation error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
