"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Package, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileBottomNavProps {
  userType: "shipper" | "transporter"
  onAction: (action: "post" | "find" | "track" | null) => void
}

export function MobileBottomNav({ userType, onAction }: MobileBottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      icon: Home,
      label: "Home",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: userType === "shipper" ? Package : Search,
      label: userType === "shipper" ? "Post" : "Find",
      action: userType === "shipper" ? "post" : ("find" as const),
      primary: true,
    },
    {
      icon: User,
      label: "Profile",
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
    },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 glass md:hidden">
      <div className="flex h-16 items-center justify-around px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon

          if (item.action) {
            return (
              <button
                key={index}
                onClick={() => onAction(item.action!)}
                className="relative flex flex-col items-center justify-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg animate-pulse-glow">
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="absolute -bottom-1 text-[10px] font-medium text-primary">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={index}
              href={item.href!}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 transition-colors",
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
