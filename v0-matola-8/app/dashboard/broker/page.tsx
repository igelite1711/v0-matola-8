"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BrokerOverview } from "@/components/dashboard/broker/broker-overview"

export default function BrokerDashboardPage() {
  return (
    <DashboardShell>
      <BrokerOverview />
    </DashboardShell>
  )
}
