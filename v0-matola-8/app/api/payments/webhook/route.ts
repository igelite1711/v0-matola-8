/**
 * POST /api/payments/webhook
 * Payment webhook handler for Airtel Money and TNM Mpamba
 * PRD Requirements: Payment webhook handling
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { logger } from "@/lib/monitoring/logger"
import { paymentWebhookSchema } from "@/lib/validators/api-schemas"

export async function POST(request: NextRequest) {
  const requestId = `payment_webhook_${Date.now()}`
  const startTime = Date.now()

  try {
    const body = await request.json()

    // Validate webhook payload
    const validated = paymentWebhookSchema.parse(body)

    // Extract payment details
    const reference = validated.reference
    const amount = validated.amount
    const status = validated.status
    const method = validated.method || (validated.provider === "airtel" ? "airtel_money" : "tnm_mpamba")

    // Find transaction by reference
    const transaction = await prisma.walletTransaction.findUnique({
      where: { reference },
      include: {
        shipment: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    if (!transaction) {
      logger.warn("Payment webhook for unknown transaction", { requestId, reference })
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update transaction status
    if (status === "completed" || status === "success") {
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      })

      // Update shipment payment status
      if (transaction.shipmentId) {
        await prisma.shipment.update({
          where: { id: transaction.shipmentId },
          data: {
            // Payment completed - shipment can proceed
          },
        })
      }

      logger.info("Payment confirmed", {
        requestId,
        transactionId: transaction.id,
        amount,
        method,
        reference,
        duration: Date.now() - startTime,
      })

      // Send notification to user
      try {
        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: transaction.userId,
            type: "payment",
            title: "Payment Confirmed",
            message: `Your payment of MWK ${amount.toLocaleString()} has been confirmed`,
            link: transaction.shipmentId ? `/dashboard/shipments/${transaction.shipmentId}` : "/dashboard/payments",
            read: false,
          },
        })

        // Send SMS notification (async, don't await)
        import("@/lib/notifications/sms-service")
          .then(({ sendSMS }) => {
            const message = `Matola: Payment of MWK ${amount.toLocaleString()} confirmed. Reference: ${reference}`
            return sendSMS(transaction.user.phone, message)
          })
          .catch((error) => {
            logger.error("Failed to send payment SMS", { error, transactionId: transaction.id })
          })
      } catch (error) {
        logger.error("Failed to send payment notification", { error, transactionId: transaction.id })
      }
    } else if (status === "failed" || status === "error") {
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "failed",
        },
      })

      logger.warn("Payment failed", {
        requestId,
        transactionId: transaction.id,
        amount,
        method,
        reference,
      })

      // Send failure notification
      try {
        await prisma.notification.create({
          data: {
            userId: transaction.userId,
            type: "payment",
            title: "Payment Failed",
            message: `Your payment of MWK ${amount.toLocaleString()} failed. Please try again.`,
            link: transaction.shipmentId ? `/dashboard/shipments/${transaction.shipmentId}` : "/dashboard/payments",
            read: false,
          },
        })
      } catch (error) {
        logger.error("Failed to send payment failure notification", { error, transactionId: transaction.id })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid payment webhook payload", {
        requestId,
        errors: error.errors,
      })
      return NextResponse.json({ error: "Invalid payload", details: error.errors }, { status: 400 })
    }

    logger.error("Payment webhook error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
