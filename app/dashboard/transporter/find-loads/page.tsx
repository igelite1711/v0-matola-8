"use client"

import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { FindLoads } from "@/components/dashboard/transporter/find-loads"

export default function FindLoadsPage() {
  const { user } = useApp()
  const userName = user?.name || "User"

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="transporter" />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType="transporter" />
        <main className="flex-1 p-6">
          <FindLoads />
        </main>
      </div>
    </div>
  )
}
