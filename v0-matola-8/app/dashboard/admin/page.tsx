"use client"

import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { AdminOverview } from "@/components/dashboard/admin/admin-overview"

export default function AdminDashboardPage() {
  const { user } = useApp()
  const userName = user?.name || "User"

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="admin" />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType="admin" />
        <main className="flex-1 p-4 sm:p-6">
          <AdminOverview />
        </main>
      </div>
    </div>
  )
}
