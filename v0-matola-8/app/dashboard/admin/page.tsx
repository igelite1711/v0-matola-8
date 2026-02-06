"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AdminOverview } from "@/components/dashboard/admin/admin-overview"

export default function AdminDashboardPage() {
  return (
    <DashboardShell>
      <AdminOverview />
    </DashboardShell>
  )
}
