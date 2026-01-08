import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/api/services/db"
import { verifyTnmWebhookChecksum, type TnmWebhookPayload } from "@/lib/payments/tnm-mpamba"
import { getEscrowByShipment } from "@/lib/payments/escrow-state-machine"
import { logger } from "@/lib/monitoring/logger"

const processedTransactions = new Set<string>()

export async function POST(req: NextRequest) {
  try {
    const payload: TnmWebhookPayload = await req.json()

    if (!verifyTnmWebhookChecksum(payload)) {
      logger.warn("Invalid TNM webhook checksum", { reference: payload.reference })
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
      logger.info("Duplicate TNM webhook ignored", { idempotencyKey, reference })
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
      logger.warn("Payment not found for TNM webhook reference", { reference, transactionId })
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
        logger.info("Payment confirmed for escrow", { escrowId: escrow.id, paymentId: payment.id })
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
    logger.error("TNM webhook error", {
      error: error instanceof Error ? error.message : String(error),
      reference: payload?.reference,
    })
    return NextResponse.json({ error: "Webhook processing failed", code: "PROCESSING_ERROR" }, { status: 500 })
  }
}
