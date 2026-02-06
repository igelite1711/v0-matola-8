"use client"

import { useApp } from "@/contexts/app-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ShipperOverview } from "@/components/dashboard/shipper/shipper-overview"
import { TransporterOverview } from "@/components/dashboard/transporter/transporter-overview"

export default function DashboardPage() {
  const { user } = useApp()

  const userType = user?.role || "shipper"

  return (
    <DashboardShell>
      {userType === "transporter" ? <TransporterOverview /> : <ShipperOverview />}
    </DashboardShell>
  )
}
