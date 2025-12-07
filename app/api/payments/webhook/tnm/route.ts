import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/api/services/db"
import { verifyTnmWebhookChecksum, type TnmWebhookPayload } from "@/lib/payments/tnm-mpamba"
import { getEscrowByShipment } from "@/lib/payments/escrow-state-machine"

const processedTransactions = new Set<string>()

export async function POST(req: NextRequest) {
  try {
    const payload: TnmWebhookPayload = await req.json()

    if (!verifyTnmWebhookChecksum(payload)) {
      console.error("Invalid TNM webhook checksum")
      await db.createAuditLog({
        action: "webhook_checksum_failed",
        entity: "payment",
        entity_id: "unknown",
        changes: { provider: "tnm", reason: "invalid_checksum" },
      })
      return NextResponse.json({ error: "Invalid checksum", code: "INVALID_CHECKSUM" }, { status: 401 })
    }

    const { transactionId, resultCode, reference } = payload

    const idempotencyKey = `tnm:${transactionId}:${resultCode}`
    if (processedTransactions.has(idempotencyKey)) {
      console.log("Duplicate webhook ignored:", idempotencyKey)
      return NextResponse.json({ received: true, duplicate: true })
    }
    processedTransactions.add(idempotencyKey)

    // Clean up old entries
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

    // TNM result codes: 0 = success, others = failure
    const newStatus = resultCode === "0" ? "completed" : "failed"

    // Update payment status
    await db.updatePayment(payment.id, {
      status: newStatus,
      provider_reference: transactionId,
      paid_at: resultCode === "0" ? new Date().toISOString() : null,
    })

    if (resultCode === "0") {
      const escrow = getEscrowByShipment(payment.shipment_id)
      if (escrow) {
        console.log(`Payment confirmed for escrow ${escrow.id}`)
      }

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
        provider: "tnm",
        result_code: resultCode,
        mapped_status: newStatus,
        transaction_id: transactionId,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("TNM webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed", code: "PROCESSING_ERROR" }, { status: 500 })
  }
}
