import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PaymentsPage } from "@/components/dashboard/payments/payments-page"

export default function Payments() {
  return (
    <DashboardShell>
      <PaymentsPage />
    </DashboardShell>
  )
}
