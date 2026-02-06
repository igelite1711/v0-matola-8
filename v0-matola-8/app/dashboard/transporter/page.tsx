"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TransporterOverview } from "@/components/dashboard/transporter/transporter-overview"

export default function TransporterDashboardPage() {
  return (
    <DashboardShell>
      <TransporterOverview />
    </DashboardShell>
  )
}
