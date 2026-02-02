// Daily reconciliation report endpoint

import { type NextRequest, NextResponse } from "next/server"
import { authMiddleware, isAuthenticated } from "@/lib/api/middleware/auth"
import { runDailyReconciliation, getEscrowsNeedingIntervention } from "@/lib/payments/escrow-state-machine"

export async function GET(req: NextRequest) {
  // Auth required (admin only)
  const authResult = await authMiddleware(req)
  if (!isAuthenticated(authResult)) return authResult

  const { user } = authResult

  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 })
  }

  try {
    // Run reconciliation
    const report = await runDailyReconciliation()
    const needingIntervention = getEscrowsNeedingIntervention()

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      summary: report,
      intervention_queue: needingIntervention.map((e) => ({
        escrow_id: e.id,
        shipment_id: e.shipmentId,
        state: e.state,
        amount: e.amount,
        created_at: e.createdAt,
        last_updated: e.updatedAt,
        days_in_state: Math.floor((Date.now() - e.updatedAt.getTime()) / (1000 * 60 * 60 * 24)),
      })),
    })
  } catch (error) {
    console.error("Reconciliation error:", error)
    return NextResponse.json({ error: "Internal server error", code: "SERVER_ERROR" }, { status: 500 })
  }
}
