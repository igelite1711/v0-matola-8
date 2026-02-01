import { type NextRequest, NextResponse } from "next/server"
import { generalRateLimiter } from "@/lib/api/middleware/rate-limit"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { createValidator, isValidated } from "@/lib/api/middleware/validate"
import { createShipmentSchema, shipmentQuerySchema, type CreateShipmentInput } from "@/lib/api/schemas/shipment"
import { db } from "@/lib/api/services/db"

const validateCreate = createValidator<CreateShipmentInput>(createShipmentSchema)

export async function GET(req: NextRequest) {
  const startTime = Date.now()

  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  try {
    // Parse query params
    const url = new URL(req.url)
    const query = shipmentQuerySchema.parse({
      status: url.searchParams.get("status") || undefined,
      origin: url.searchParams.get("origin") || undefined,
      destination: url.searchParams.get("destination") || undefined,
      date_from: url.searchParams.get("date_from") || undefined,
      date_to: url.searchParams.get("date_to") || undefined,
      page: url.searchParams.get("page") || 1,
      limit: url.searchParams.get("limit") || 20,
    })

    const result = await db.getShipments(query)

    const responseTime = Date.now() - startTime

    return NextResponse.json(
      {
        ...result,
        responseTime: `${responseTime}ms`,
      },
      {
        headers: {
          "X-Response-Time": `${responseTime}ms`,
          "Cache-Control": "public, max-age=30", // Cache for 30 seconds
        },
      },
    )
  } catch (error) {
    console.error("Get shipments error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitError = await generalRateLimiter(req)
  if (rateLimitError) return rateLimitError

  // Auth
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  // Validation
  const validationResult = await validateCreate(req)
  if (!isValidated(validationResult)) return validationResult

  const { user } = authResult
  const data = validationResult.data

  try {
    // Only shippers can create shipments
    if (user.role !== "shipper" && user.role !== "admin") {
      return NextResponse.json({ error: "Only shippers can create shipments", code: "FORBIDDEN" }, { status: 403 })
    }

    const shipment = await db.createShipment({
      ...data,
      shipper_id: user.userId,
      departure_date: new Date(data.departure_date).toISOString(),
    })

    // TODO: Trigger background matching job
    // await matchingQueue.add('findMatches', { shipmentId: shipment.id })

    // Audit log
    await db.createAuditLog({
      user_id: user.userId,
      action: "create",
      entity: "shipment",
      entity_id: shipment.id,
      changes: data,
      ip_address: req.headers.get("x-forwarded-for") || undefined,
    })

    return NextResponse.json(shipment, { status: 201 })
  } catch (error) {
    console.error("Create shipment error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
