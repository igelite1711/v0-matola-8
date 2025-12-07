"use client"

import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { BrokerOverview } from "@/components/dashboard/broker/broker-overview"

export default function BrokerDashboardPage() {
  const { user } = useApp()
  const userName = user?.name || "User"

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="broker" />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType="broker" />
        <main className="flex-1 p-4 sm:p-6">
          <BrokerOverview />
        </main>
      </div>
    </div>
  )
}
