/**
 * POST /api/auth/logout
 * Logout user (clear cookies)
 */

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" })

  // Clear auth cookies
  response.cookies.delete("accessToken")
  response.cookies.delete("refreshToken")

  return response
}
