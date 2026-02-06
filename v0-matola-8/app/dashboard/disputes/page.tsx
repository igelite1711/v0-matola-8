import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DisputesPage } from "@/components/dashboard/disputes/disputes-page"

export default function DisputesRoute() {
  return (
    <DashboardShell>
      <DisputesPage />
    </DashboardShell>
  )
}
