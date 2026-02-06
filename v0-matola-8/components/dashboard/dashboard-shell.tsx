"use client"

import type React from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { useApp } from "@/contexts/app-context"

interface DashboardShellProps {
  children: React.ReactNode
}

/**
 * Unified responsive dashboard shell that provides:
 * - Desktop: Sidebar + Header + Content
 * - Mobile: Header + Content + Bottom Nav
 * 
 * This consolidates the separate mobile and desktop navigation implementations
 * into a single component using responsive Tailwind utilities.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const { user } = useApp()
  const userType = (user?.role || "shipper") as "shipper" | "transporter" | "broker" | "admin"
  const userName = user?.name || "User"

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <DashboardSidebar userType={userType} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        {/* Sticky Header */}
        <DashboardHeader userName={userName} userType={userType} />

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>

        {/* Mobile Bottom Nav - Visible only on mobile */}
        <div className="md:hidden">
          <MobileNav userType={userType} />
        </div>
      </div>
    </div>
  )
}
