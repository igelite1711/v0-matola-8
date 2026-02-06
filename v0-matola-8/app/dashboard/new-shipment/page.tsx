"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { NewShipmentForm } from "@/components/dashboard/shipper/new-shipment-form"

export default function NewShipmentPage() {
  return (
    <DashboardShell>
      <NewShipmentForm />
    </DashboardShell>
  )
}
