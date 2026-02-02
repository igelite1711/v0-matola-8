"use client"

import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { ShipmentsList } from "@/components/dashboard/shipper/shipments-list"

export default function ShipmentsPage() {
  const { user } = useApp()
  const userType = user?.role || "shipper"
  const userName = user?.name || "User"

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType={userType} />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType={userType} />
        <main className="flex-1 p-6">
          <ShipmentsList />
        </main>
      </div>
    </div>
  )
}
