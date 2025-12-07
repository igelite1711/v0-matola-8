import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/api/services/db"
import { verifyAirtelWebhookSignature } from "@/lib/payments/airtel-money"
import { getEscrowByShipment } from "@/lib/payments/escrow-state-machine"

const processedTransactions = new Set<string>()

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("x-airtel-signature") || ""

  if (!verifyAirtelWebhookSignature(rawBody, signature)) {
    console.error("Invalid Airtel webhook signature")
    await db.createAuditLog({
      action: "webhook_signature_failed",
      entity: "payment",
      entity_id: "unknown",
      changes: { provider: "airtel", reason: "invalid_signature" },
    })
    return NextResponse.json({ error: "Invalid signature", code: "INVALID_SIGNATURE" }, { status: 401 })
  }

  try {
    const payload = JSON.parse(rawBody)
    const { transaction } = payload
    const transactionId = transaction?.id
    const status = transaction?.status_code
    const reference = payload.reference

    const idempotencyKey = `airtel:${transactionId}:${status}`
    if (processedTransactions.has(idempotencyKey)) {
      console.log("Duplicate webhook ignored:", idempotencyKey)
      return NextResponse.json({ received: true, duplicate: true })
    }
    processedTransactions.add(idempotencyKey)

    // Clean up old entries (keep last 10000)
    if (processedTransactions.size > 10000) {
      const entries = Array.from(processedTransactions)
      entries.slice(0, 5000).forEach((key) => processedTransactions.delete(key))
    }

    // Find payment by reference
    const payment = await db.getPaymentByReference(reference)
    if (!payment) {
      console.error("Payment not found for reference:", reference)
      return NextResponse.json({ error: "Payment not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // Map Airtel status to our status
    const statusMap: Record<string, "pending" | "completed" | "failed"> = {
      TS: "completed",
      TF: "failed",
      TP: "pending",
      TIP: "pending",
    }
    const newStatus = statusMap[status] || "pending"

    // Update payment status
    await db.updatePayment(payment.id, {
      status: newStatus,
      provider_reference: transactionId,
      paid_at: newStatus === "completed" ? new Date().toISOString() : null,
    })

    if (newStatus === "completed") {
      const escrow = getEscrowByShipment(payment.shipment_id)
      if (escrow) {
        // Payment confirmed, escrow remains in pending until transporter accepts
        console.log(`Payment confirmed for escrow ${escrow.id}`)
      }

      // Update shipment payment status
      await db.updateShipment(payment.shipment_id, {
        payment_status: "paid",
      })
    }

    // Audit log
    await db.createAuditLog({
      action: "webhook_processed",
      entity: "payment",
      entity_id: payment.id,
      changes: {
        provider: "airtel",
        status,
        mapped_status: newStatus,
        transaction_id: transactionId,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Airtel webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed", code: "PROCESSING_ERROR" }, { status: 500 })
  }
}
