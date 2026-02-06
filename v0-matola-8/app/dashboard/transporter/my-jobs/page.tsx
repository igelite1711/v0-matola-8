"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { MyJobs } from "@/components/dashboard/transporter/my-jobs"

export default function MyJobsPage() {
  return (
    <DashboardShell>
      <MyJobs />
    </DashboardShell>
  )
}
