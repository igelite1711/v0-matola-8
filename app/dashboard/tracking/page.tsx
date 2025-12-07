"use client"

import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { TrackingSearch } from "@/components/dashboard/tracking/tracking-search"

export default function TrackingPage() {
  const { user } = useApp()
  const userType = user?.role || "shipper"
  const userName = user?.name || "User"

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType={userType} />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType={userType} />
        <main className="flex-1 p-4 sm:p-6">
          <TrackingSearch />
        </main>
      </div>
    </div>
  )
}
