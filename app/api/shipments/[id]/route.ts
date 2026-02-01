import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { createValidator, isValidated } from "@/lib/api/middleware/validate"
import { updateShipmentSchema, type UpdateShipmentInput } from "@/lib/api/schemas/shipment"
import { db } from "@/lib/api/services/db"
import { ResourceValidator } from "@/lib/request-validator"
import { validateShipmentStatusTransition } from "@/lib/shipment-state-machine"

const validateUpdate = createValidator<UpdateShipmentInput>(updateShipmentSchema)

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now()
  const { id } = await params

  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  try {
    const shipment = await db.getShipmentById(id)

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // Check access - owner or matched transporter
    const { user } = authResult
    const isOwner = shipment.shipper_id === user.userId
    const isMatchedTransporter = user.role === "transporter" && shipment.transporter_id === user.userId
    const isAdmin = user.role === "admin"

    if (!isOwner && !isMatchedTransporter && !isAdmin) {
      return NextResponse.json({ error: "Access denied", code: "FORBIDDEN" }, { status: 403 })
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json(shipment, {
      headers: {
        "X-Response-Time": `${responseTime}ms`,
      },
    })
  } catch (error) {
    console.error("Get shipment error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  // Validation
  const validationResult = await validateUpdate(req)
  if (!isValidated(validationResult)) return validationResult

  const { user } = authResult
  const data = validationResult.data

  try {
    const shipment = await db.getShipmentById(id)

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found", code: "NOT_FOUND" }, { status: 404 })
    }

    // Only owner can update
    const hasOwnership = await ResourceValidator.validateShipmentOwnership(user.userId, id)
    if (!hasOwnership && user.role !== "admin") {
      return NextResponse.json({ error: "Only the owner can update this shipment", code: "FORBIDDEN" }, { status: 403 })
    }

    // Validate status transition if status is being changed
    if (data.status && data.status !== shipment.status) {
      const validation = validateShipmentStatusTransition(
        shipment.status as any,
        data.status as any,
      )
      if (!validation.valid) {
        return NextResponse.json(
          {
            error: validation.error,
            code: "INVALID_STATUS_TRANSITION",
          },
          { status: 400 },
        )
      }
    }

    const updated = await db.updateShipment(id, {
      ...data,
      departure_date: data.departure_date ? new Date(data.departure_date).toISOString() : undefined,
    })

    // Audit log
    await db.createAuditLog({
      user_id: user.userId,
      action: "update",
      entity: "shipment",
      entity_id: id,
      changes: data,
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update shipment error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
