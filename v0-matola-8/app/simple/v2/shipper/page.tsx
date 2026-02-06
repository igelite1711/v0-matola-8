import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ShipperOverview } from "@/components/dashboard/shipper/shipper-overview"

/**
 * Consolidated shipper dashboard - merged /app/simple/v2/shipper and /app/dashboard
 * Uses the unified responsive DashboardShell that works for both mobile and desktop
 */
export default function ShipperPage() {
  return (
    <DashboardShell>
      <ShipperOverview />
    </DashboardShell>
  )
}
