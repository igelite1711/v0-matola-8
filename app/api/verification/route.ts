/**
 * GET /api/verification - Get user verification status
 * POST /api/verification/verify - Submit verification
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
        verified: true,
        verificationLevel: true,
        chiefReference: true,
        rtoaMembership: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      verification: {
        userId: user.id,
        verified: user.verified,
        level: user.verificationLevel,
        chiefReference: user.chiefReference ? JSON.parse(user.chiefReference) : null,
        rtoaMembership: user.rtoaMembership,
      },
    })
  } catch (error: any) {
    logger.error("Verification fetch error", { error })
    return NextResponse.json({ error: "Failed to fetch verification status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()

    const { level, data } = body

    // Levels: none, phone, id, community, rtoa, full

    const updateData: any = {}

    switch (level) {
      case "community":
        updateData.chiefReference = JSON.stringify(data)
        updateData.verificationLevel = "community"
        break
      case "rtoa":
        updateData.rtoaMembership = data.membershipNumber
        updateData.verificationLevel = "rtoa"
        break
      case "id":
        updateData.verificationLevel = "id"
        break
      default:
        return NextResponse.json({ error: "Invalid verification level" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: updateData,
      select: {
        id: true,
        verified: true,
        verificationLevel: true,
      },
    })

    logger.info("Verification submitted", { userId: auth.userId, level })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    logger.error("Verification submit error", { error })
    return NextResponse.json({ error: "Failed to submit verification" }, { status: 500 })
  }
}
