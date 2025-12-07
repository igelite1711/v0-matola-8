"use client"

import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { ShipperOverview } from "@/components/dashboard/shipper/shipper-overview"
import { TransporterOverview } from "@/components/dashboard/transporter/transporter-overview"

export default function DashboardPage() {
  const { user } = useApp()

  const userType = user?.role || "shipper"
  const userName = user?.name || "User"

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType={userType} />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType={userType} />
        <main className="flex-1 p-4 sm:p-6">
          {userType === "transporter" ? <TransporterOverview /> : <ShipperOverview />}
        </main>
      </div>
    </div>
  )
}
