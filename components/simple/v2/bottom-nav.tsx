"use client"

import type React from "react"
import { Home, Package, MapPin, User, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  language: "en" | "ny"
  activeTab?: "home" | "shipments" | "track" | "profile"
  userRole?: "shipper" | "transporter"
}

export function BottomNav({ language, activeTab = "home", userRole = "shipper" }: BottomNavProps) {
  const shipperTabs = [
    { id: "home", icon: Home, labelEn: "Home", labelNy: "Kwathu" },
    { id: "shipments", icon: Package, labelEn: "Loads", labelNy: "Katundu" },
    { id: "track", icon: MapPin, labelEn: "Track", labelNy: "Tsatira" },
    { id: "profile", icon: User, labelEn: "Profile", labelNy: "Mbiri" },
  ]

  const tabs = shipperTabs

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border px-4 py-2 pb-safe">
      <div className="mx-auto max-w-md flex items-center justify-around">
        {tabs.slice(0, 2).map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={language === "ny" ? tab.labelNy : tab.labelEn}
            active={activeTab === tab.id}
          />
        ))}

        {/* Center Action Button */}
        <button className="flex h-14 w-14 -mt-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
          <Plus className="h-7 w-7" />
        </button>

        {tabs.slice(2).map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={language === "ny" ? tab.labelNy : tab.labelEn}
            active={activeTab === tab.id}
          />
        ))}
      </div>
    </nav>
  )
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  badge,
  onClick,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: number
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 px-3 py-2 relative transition-colors">
      <Icon className={cn("h-6 w-6 transition-colors", active ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-xs transition-colors", active ? "text-primary font-medium" : "text-muted-foreground")}>
        {label}
      </span>
      {badge && badge > 0 && (
        <span className="absolute -top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  )
}
