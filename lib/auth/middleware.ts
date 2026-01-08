/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user context
 */

import { NextRequest } from "next/server"
import { verifyToken, extractTokenFromHeader, type TokenPayload } from "./jwt"

export interface AuthContext {
  userId: string
  phone: string
  role: string
}

/**
 * Authenticate request and return user context
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthContext | null> {
  const authHeader = request.headers.get("authorization")
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return null
  }

  try {
    const payload = await verifyToken(token)
    return {
      userId: payload.userId,
      phone: payload.phone,
      role: payload.role,
    }
  } catch (error) {
    return null
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const auth = await authenticateRequest(request)
  if (!auth) {
    throw new Error("Unauthorized")
  }
  return auth
}

/**
 * Require specific role
 */
export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<AuthContext> {
  const auth = await requireAuth(request)
  if (!allowedRoles.includes(auth.role)) {
    throw new Error("Forbidden")
  }
  return auth
}

