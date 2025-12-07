import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { createValidator, isValidated } from "@/lib/api/middleware/validate"
import { initiatePaymentSchema, type InitiatePaymentInput } from "@/lib/api/schemas/payment"
import { db } from "@/lib/api/services/db"
import { initiateAirtelPayment } from "@/lib/payments/airtel-money"
import { initiateTnmPayment } from "@/lib/payments/tnm-mpamba"
import { createEscrow, checkDuplicatePayment } from "@/lib/payments/escrow-state-machine"

const validate = createValidator<InitiatePaymentInput>(initiatePaymentSchema)

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  // Validation
  const validationResult = await validate(req)
  if (!isValidated(validationResult)) return validationResult

  const { user } = authResult
  const { shipment_id, method } = validationResult.data

  try {
    // Get shipment
    const shipment = await db.getShipmentById(shipment_id)
    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // Verify user is the shipper
    if (shipment.shipper_id !== user.userId && user.role !== "admin") {
      return NextResponse.json({ error: "Only the shipper can initiate payment", code: "FORBIDDEN" }, { status: 403 })
    }

    const duplicateCheck = checkDuplicatePayment("", shipment_id)
    if (duplicateCheck.isDuplicate) {
      return NextResponse.json(
        {
          error: "Payment already exists for this shipment",
          code: "DUPLICATE_PAYMENT",
          existingEscrowId: duplicateCheck.existingEscrowId,
        },
        { status: 409 },
      )
    }

    // Create payment record
    const payment = await db.createPayment({
      shipment_id,
      payer_id: user.userId,
      amount_mwk: shipment.price_mwk,
      method,
    })

    const escrow = createEscrow(shipment_id, payment.id, user.userId, shipment.price_mwk)

    let paymentResult: { success: boolean; transactionId?: string; ussdPrompt?: string; error?: string }

    // Get user phone for mobile money
    const userRecord = await db.getUserById(user.userId)
    const phoneNumber = userRecord?.phone || ""

    if (method === "airtel_money") {
      paymentResult = await initiateAirtelPayment(phoneNumber, shipment.price_mwk, payment.reference, shipment_id)
    } else if (method === "tnm_mpamba") {
      paymentResult = await initiateTnmPayment(phoneNumber, shipment.price_mwk, payment.reference)
    } else {
      // Cash payment - no API call needed
      paymentResult = { success: true }
    }

    if (!paymentResult.success && method !== "cash") {
      // Update payment status to failed
      await db.updatePayment(payment.id, { status: "failed" })
      return NextResponse.json(
        {
          error: paymentResult.error || "Payment initiation failed",
          code: "PAYMENT_FAILED",
        },
        { status: 502 },
      )
    }

    // Update payment with provider reference
    if (paymentResult.transactionId) {
      await db.updatePayment(payment.id, {
        provider_reference: paymentResult.transactionId,
      })
    }

    // Audit log
    await db.createAuditLog({
      user_id: user.userId,
      action: "initiate",
      entity: "payment",
      entity_id: payment.id,
      changes: {
        shipment_id,
        method,
        amount: shipment.price_mwk,
        escrow_id: escrow.id,
        provider_transaction: paymentResult.transactionId,
      },
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json({
      payment_id: payment.id,
      reference: payment.reference,
      amount_mwk: payment.amount_mwk,
      method,
      status: payment.status,
      escrow_id: escrow.id,
      provider_transaction_id: paymentResult.transactionId,
      ussd_prompt: paymentResult.ussdPrompt,
    })
  } catch (error) {
    console.error("Initiate payment error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
