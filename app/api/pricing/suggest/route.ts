/**
 * Price Suggestion API
 * GET /api/pricing/suggest - Get price suggestions
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/auth/middleware"
import { suggestPrice } from "@/lib/pricing/intelligence-service"
import { logger } from "@/lib/monitoring/logger"

const suggestPriceSchema = z.object({
  origin: z.string().min(2, "Origin city required"),
  destination: z.string().min(2, "Destination city required"),
  weight: z.coerce.number().int().positive().max(50000),
  cargoType: z.string().min(1, "Cargo type required"),
})

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request) // Require authentication

    const searchParams = request.nextUrl.searchParams
    const params = suggestPriceSchema.parse({
      origin: searchParams.get("origin"),
      destination: searchParams.get("destination"),
      weight: searchParams.get("weight"),
      cargoType: searchParams.get("cargoType"),
    })

    const suggestion = await suggestPrice(
      params.origin,
      params.destination,
      params.weight,
      params.cargoType,
    )

    return NextResponse.json({ suggestion })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request parameters", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error getting price suggestion", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
