import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { WalletPage } from "@/components/dashboard/wallet/wallet-page"

export default function WalletDashboardPage() {
  return (
    <DashboardShell>
      <WalletPage />
    </DashboardShell>
  )
}
