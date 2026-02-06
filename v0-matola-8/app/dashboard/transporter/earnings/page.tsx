"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { EarningsView } from "@/components/dashboard/transporter/earnings-view"

export default function EarningsPage() {
  return (
    <DashboardShell>
      <EarningsView />
    </DashboardShell>
  )
}
