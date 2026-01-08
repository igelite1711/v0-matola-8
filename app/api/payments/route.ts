/**
 * POST /api/payments - Initiate payment
 * GET /api/payments - List payments
 * PRD Requirements: Airtel Money, TNM Mpamba, Cash payment support
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { checkGeneralRateLimit, createRateLimitHeaders } from "@/lib/rate-limit/rate-limiter"
import { logger } from "@/lib/monitoring/logger"
import { initiateAirtelMoneyPayment } from "@/lib/payments/airtel-money"
import { initiateTNMMpambaPayment } from "@/lib/payments/tnm-mpamba"
import { createPaymentSchema, getPaymentsSchema } from "@/lib/validators/api-schemas"

/**
 * Generate payment reference
 */
function generatePaymentReference(method: string): string {
  const prefix = method === "airtel_money" ? "AM" : method === "tnm_mpamba" ? "TN" : "PY"
  return `${prefix}${Date.now().toString().slice(-8)}`
}

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("X-Request-ID") || `req_${Date.now()}`

  try {
    const auth = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    // Validate query parameters
    const params = getPaymentsSchema.parse({
      shipmentId: searchParams.get("shipmentId"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    })

    const where: any = { userId: auth.userId }
    if (params.shipmentId) {
      where.shipmentId = params.shipmentId
    }

    const transactions = await prisma.walletTransaction.findMany({
      where,
      include: {
        shipment: {
          select: {
            id: true,
            reference: true,
            originCity: true,
            destinationCity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: params.limit,
      skip: params.offset,
    })

    const total = await prisma.walletTransaction.count({ where })

    logger.info("Payments retrieved", { requestId, userId: auth.userId, count: transactions.length })

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < total,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Get payments error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("X-Request-ID") || `req_${Date.now()}`
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"

  try {
    // Rate limiting
    const rateLimit = await checkGeneralRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: createRateLimitHeaders(rateLimit) },
      )
    }

    const auth = await requireAuth(request)
    const body = await request.json()

    // Validate request body
    const validated = createPaymentSchema.parse(body)

    // Verify shipment exists and belongs to user
    const shipment = await prisma.shipment.findUnique({
      where: { id: validated.shipmentId },
    })

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    if (shipment.shipperId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validate amount matches shipment price
    if (validated.amount !== shipment.price) {
      return NextResponse.json(
        { error: `Amount must be exactly MWK ${shipment.price.toLocaleString()}` },
        { status: 400 },
      )
    }

    // Generate payment reference
    const reference = generatePaymentReference(validated.method)

    // Create payment transaction
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: auth.userId,
        shipmentId: validated.shipmentId,
        type: "payment",
        amount: validated.amount,
        method: validated.method,
        reference,
        description: `Payment for shipment #${shipment.reference}`,
        status: validated.method === "cash" ? "pending" : "pending",
      },
    })

    // Handle mobile money payments
    if ((validated.method === "airtel_money" || validated.method === "tnm_mpamba") && validated.phoneNumber) {
      const config = {
        apiKey:
          validated.method === "airtel_money"
            ? process.env.AIRTEL_MONEY_API_KEY || ""
            : process.env.TNM_MPAMBA_API_KEY || "",
        apiUrl:
          validated.method === "airtel_money"
            ? process.env.AIRTEL_MONEY_API_URL || "https://api.airtel.africa"
            : process.env.TNM_MPAMBA_API_URL || "https://api.tnm.co.mw",
        merchantId:
          validated.method === "airtel_money"
            ? process.env.MATOLA_AIRTEL_NUMBER || ""
            : process.env.MATOLA_TNM_NUMBER || "",
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payments/webhook`,
      }

      let paymentResult
      if (validated.method === "airtel_money") {
        paymentResult = await initiateAirtelMoneyPayment(config, {
          amount: validated.amount,
          phoneNumber: validated.phoneNumber,
          reference,
          description: `Payment for shipment #${shipment.reference}`,
        })
      } else {
        paymentResult = await initiateTNMMpambaPayment(config, {
          amount: validated.amount,
          phoneNumber: validated.phoneNumber,
          reference,
          description: `Payment for shipment #${shipment.reference}`,
        })
      }

      if (paymentResult.success) {
        logger.info("Mobile money payment initiated", {
          requestId,
          transactionId: transaction.id,
          method: validated.method,
          amount: validated.amount,
          reference,
        })

        return NextResponse.json(
          {
            success: true,
            transaction,
            ussdPrompt: paymentResult.ussdPrompt,
            instructions:
              validated.method === "airtel_money"
                ? "Dial the USSD code above to complete payment. We'll notify you when payment is confirmed."
                : "Dial the USSD code above to complete payment. We'll notify you when payment is confirmed.",
          },
          { status: 201, headers: createRateLimitHeaders(rateLimit) },
        )
      }
    }

    // Cash payment
    if (validated.method === "cash") {
      return NextResponse.json(
        {
          success: true,
          transaction,
          instructions: "Pay cash to the transporter upon pickup. Upload receipt via WhatsApp for confirmation.",
        },
        { status: 201, headers: createRateLimitHeaders(rateLimit) },
      )
    }

    // Bank transfer
    if (validated.method === "bank_transfer") {
      return NextResponse.json(
        {
          success: true,
          transaction,
          instructions: `Transfer MWK ${validated.amount.toLocaleString()} to:\nBank: Standard Bank\nAccount: 1234567890\nReference: ${reference}\n\nUpload proof of payment via WhatsApp.`,
        },
        { status: 201, headers: createRateLimitHeaders(rateLimit) },
      )
    }

    return NextResponse.json(
      { success: true, transaction },
      { status: 201, headers: createRateLimitHeaders(rateLimit) },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Create payment error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
