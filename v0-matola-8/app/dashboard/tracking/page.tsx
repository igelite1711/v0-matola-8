"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { TrackingSearch } from "@/components/dashboard/tracking/tracking-search"

export default function TrackingPage() {
  return (
    <DashboardShell>
      <TrackingSearch />
    </DashboardShell>
  )
}
