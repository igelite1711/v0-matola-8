"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ShipmentsList } from "@/components/dashboard/shipper/shipments-list"

export default function ShipmentsPage() {
  return (
    <DashboardShell>
      <ShipmentsList />
    </DashboardShell>
  )
}
