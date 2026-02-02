"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { LayoutDashboard, Package, Search, CreditCard, User } from "lucide-react"

interface MobileNavProps {
  userType: "shipper" | "transporter"
}

export function MobileNav({ userType }: MobileNavProps) {
  const pathname = usePathname()
  const { language } = useLanguage()

  const shipperNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: { en: "Home", ny: "Home" } },
    { href: "/dashboard/shipments", icon: Package, label: { en: "Loads", ny: "Katundu" } },
    { href: "/dashboard/payments", icon: CreditCard, label: { en: "Pay", ny: "Lipira" } },
    { href: "/dashboard/settings", icon: User, label: { en: "Profile", ny: "Inu" } },
  ]

  const transporterNav = [
    { href: "/dashboard/transporter", icon: LayoutDashboard, label: { en: "Home", ny: "Home" } },
    { href: "/dashboard/transporter/find-loads", icon: Search, label: { en: "Find", ny: "Peza" } },
    { href: "/dashboard/transporter/my-jobs", icon: Package, label: { en: "Jobs", ny: "Ntchito" } },
    { href: "/dashboard/transporter/earnings", icon: CreditCard, label: { en: "Earn", ny: "Ndalama" } },
  ]

  const nav = userType === "transporter" ? transporterNav : shipperNav

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around py-2">
        {nav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-[10px] font-medium">{item.label[language]}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
