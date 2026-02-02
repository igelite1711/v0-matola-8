"use client"

import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { NewShipmentForm } from "@/components/dashboard/shipper/new-shipment-form"

export default function NewShipmentPage() {
  const { user } = useApp()
  const userName = user?.name || "User"

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="shipper" />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType="shipper" />
        <main className="flex-1 p-6">
          <NewShipmentForm />
        </main>
      </div>
    </div>
  )
}
