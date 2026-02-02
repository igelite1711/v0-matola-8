"use client"

import type React from "react"
import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { SimpleNav } from "./simple-nav"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { QuickActionModal } from "./quick-action-modal"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { user } = useApp()
  const [activeModal, setActiveModal] = useState<"post" | "find" | "track" | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SimpleNav onAction={setActiveModal} />

      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Mobile bottom navigation */}
      <MobileBottomNav userType={user?.role || "shipper"} onAction={setActiveModal} />

      {/* Quick action modals */}
      <QuickActionModal type={activeModal} onClose={() => setActiveModal(null)} />
    </div>
  )
}
