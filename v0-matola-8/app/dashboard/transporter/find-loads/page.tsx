"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { FindLoads } from "@/components/dashboard/transporter/find-loads"

export default function FindLoadsPage() {
  return (
    <DashboardShell>
      <FindLoads />
    </DashboardShell>
  )
}
