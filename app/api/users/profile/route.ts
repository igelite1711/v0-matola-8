/**
 * GET /api/users/profile - Get current user profile
 * PUT /api/users/profile - Update current user profile
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        whatsapp: true,
        avatar: true,
        role: true,
        rating: true,
        totalRatings: true,
        verified: true,
        verificationLevel: true,
        preferredLanguage: true,
        createdAt: true,
        updatedAt: true,
        transporterProfile: {
          select: {
            vehicleType: true,
            vehiclePlate: true,
            vehicleCapacity: true,
            licenseNumber: true,
            unionMembership: true,
            totalTrips: true,
            completedTrips: true,
            onTimeRate: true,
            hasRefrigeration: true,
          },
        },
        shipperProfile: {
          select: {
            businessType: true,
            businessName: true,
            totalShipments: true,
            completedShipments: true,
          },
        },
        brokerProfile: {
          select: {
            businessName: true,
            licenseNumber: true,
            matchesMade: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    logger.error("Error fetching user profile", { error })
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()

    const { name, email, whatsapp, avatar, preferredLanguage } = body

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(whatsapp && { whatsapp }),
        ...(avatar && { avatar }),
        ...(preferredLanguage && { preferredLanguage }),
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        whatsapp: true,
        avatar: true,
        role: true,
        rating: true,
        totalRatings: true,
        verified: true,
        verificationLevel: true,
        preferredLanguage: true,
      },
    })

    logger.info("User profile updated", { userId: auth.userId })
    return NextResponse.json({ user })
  } catch (error) {
    logger.error("Error updating user profile", { error })
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
