import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TransporterOverview } from "@/components/dashboard/transporter/transporter-overview"

/**
 * Consolidated transporter dashboard - merged /app/simple/v2/transporter and /app/dashboard
 * Uses the unified responsive DashboardShell that works for both mobile and desktop
 */
export default function TransporterPage() {
  return (
    <DashboardShell>
      <TransporterOverview />
    </DashboardShell>
  )
}
