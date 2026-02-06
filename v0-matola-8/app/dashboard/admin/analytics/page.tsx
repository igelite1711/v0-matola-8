import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AnalyticsDashboard } from "@/components/dashboard/admin/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <AnalyticsDashboard />
    </DashboardShell>
  )
}
