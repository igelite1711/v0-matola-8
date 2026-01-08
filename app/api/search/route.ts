/**
 * GET /api/search - Advanced search across shipments and available loads
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const { searchParams } = new URL(request.url)

    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all" // all, shipments, locations
    const pickupCity = searchParams.get("pickupCity")
    const deliveryCity = searchParams.get("deliveryCity")
    const cargoType = searchParams.get("cargoType")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

    const results: any = {}

    // Search shipments
    if (["all", "shipments"].includes(type)) {
      const where: any = {
        status: "posted",
        NOT: { userId: auth.userId }, // Don't show user's own shipments
      }

      if (pickupCity) where.pickupLocation = { contains: pickupCity }
      if (deliveryCity) where.deliveryLocation = { contains: deliveryCity }
      if (cargoType) where.cargoType = cargoType
      if (minPrice) where.quotedPrice = { gte: parseFloat(minPrice) }
      if (maxPrice) {
        where.quotedPrice = where.quotedPrice || {}
        where.quotedPrice.lte = parseFloat(maxPrice)
      }

      const shipments = await prisma.shipment.findMany({
        where,
        select: {
          id: true,
          referenceNumber: true,
          description: true,
          cargoType: true,
          weight: true,
          pickupLocation: true,
          deliveryLocation: true,
          pickupDate: true,
          deliveryDate: true,
          quotedPrice: true,
          user: {
            select: {
              id: true,
              name: true,
              rating: true,
              verified: true,
            },
          },
        },
        take: limit,
      })

      results.shipments = shipments
    }

    // Search locations
    if (["all", "locations"].includes(type)) {
      const locations = await prisma.location.findMany({
        where: {
          OR: [
            { name: { contains: query || "" } },
            { city: { contains: query || "" } },
            { district: { contains: query || "" } },
          ],
        },
        select: {
          id: true,
          name: true,
          city: true,
          district: true,
          region: true,
          latitude: true,
          longitude: true,
        },
        take: limit,
      })

      results.locations = locations
    }

    logger.info("Search performed", { userId: auth.userId, type, query })
    return NextResponse.json(results)
  } catch (error) {
    logger.error("Search error", { error })
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
