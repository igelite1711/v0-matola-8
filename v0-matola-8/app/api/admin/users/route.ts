/**
 * GET /api/admin/users - Get all users with filters
 * PATCH /api/admin/users/[id] - Update user (ban, verify, etc)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { logger } from "@/lib/monitoring/logger"
import { invariantEngine } from "@/lib/safety/invariant-engine"

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)

    // Enforce Role Invariant
    await invariantEngine.execute(
      ["INV-AUTH-ROLE"],
      {
        userRole: auth.role,
        action: "FETCH_ADMIN_USERS",
        requiredRoleMap: { "FETCH_ADMIN_USERS": "admin" }
      },
      async () => { } // Pure authorization check
    )

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const verified = searchParams.get("verified")
    const search = searchParams.get("search")
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {}

    if (role) where.role = role
    if (verified) where.verified = verified === "true"
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          verified: true,
          verificationLevel: true,
          rating: true,
          totalRatings: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    logger.error("Admin users error", { error })
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
