"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useApp } from "@/contexts/app-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  Truck,
  LayoutDashboard,
  Package,
  Plus,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Search,
  Phone,
  Handshake,
  AlertTriangle,
  BarChart3,
  Shield,
} from "lucide-react"

interface DashboardSidebarProps {
  userType: "shipper" | "transporter" | "broker" | "admin"
}

export function DashboardSidebar({ userType }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { language, t } = useLanguage()
  const { logout } = useApp()

  const shipperLinks = [
    { href: "/dashboard", key: "overview", icon: LayoutDashboard },
    { href: "/dashboard/new-shipment", key: "newShipment", icon: Plus },
    { href: "/dashboard/shipments", key: "myShipments", icon: Package },
    { href: "/dashboard/tracking", key: "tracking", icon: MapPin },
    { href: "/dashboard/payments", key: "payments", icon: CreditCard },
    { href: "/dashboard/disputes", key: "disputes", icon: AlertTriangle },
    { href: "/dashboard/verification", key: "verification", icon: Shield },
    { href: "/dashboard/channels", key: "channels", icon: Phone },
    { href: "/dashboard/settings", key: "settings", icon: Settings }, // Settings is in common usually
  ]

  const transporterLinks = [
    { href: "/dashboard/transporter", key: "overview", icon: LayoutDashboard },
    { href: "/dashboard/transporter/find-loads", key: "findLoads", icon: Search },
    { href: "/dashboard/transporter/my-jobs", key: "myJobs", icon: Package },
    { href: "/dashboard/transporter/earnings", key: "earnings", icon: CreditCard },
    { href: "/dashboard/disputes", key: "disputes", icon: AlertTriangle },
    { href: "/dashboard/verification", key: "verification", icon: Shield },
    { href: "/dashboard/channels", key: "channels", icon: Phone },
    { href: "/dashboard/settings", key: "settings", icon: Settings },
  ]

  const brokerLinks = [
    { href: "/dashboard/broker", key: "overview", icon: LayoutDashboard },
    { href: "/dashboard/broker/network", key: "network", icon: Handshake },
    { href: "/dashboard/broker/matches", key: "matches", icon: Package },
    { href: "/dashboard/broker/earnings", key: "commissions", icon: CreditCard },
    { href: "/dashboard/disputes", key: "disputes", icon: AlertTriangle },
    { href: "/dashboard/channels", key: "channels", icon: Phone },
    { href: "/dashboard/settings", key: "settings", icon: Settings },
  ]

  const adminLinks = [
    { href: "/dashboard/admin", key: "overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/analytics", key: "analytics", icon: BarChart3 },
    { href: "/dashboard/admin/users", key: "users", icon: Handshake },
    { href: "/dashboard/admin/shipments", key: "shipments", icon: Package },
    { href: "/dashboard/admin/disputes", key: "disputes", icon: AlertTriangle },
    { href: "/dashboard/channels", key: "channels", icon: Phone },
    { href: "/dashboard/settings", key: "settings", icon: Settings },
  ]

  const linksMap = {
    shipper: shipperLinks,
    transporter: transporterLinks,
    broker: brokerLinks,
    admin: adminLinks,
  }

  const links = linksMap[userType]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block animate-slide-in-right" style={{ animationDuration: '0.4s' }}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Matola</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {links.map((link) => {
            const isActive = pathname === link.href
            // Handle "settings" which is in 'common' usually, but 'nav' is ok if I add it to nav?
            // I'll check if 'settings' is in 'nav'. No.
            // I'll check 'common'. Yes.
            // Logic: if key is "settings" use "common", else "nav".
            const section = link.key === "settings" ? "common" : "nav"
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:scale-105 active:scale-95 duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <link.icon className="h-4 w-4" />
                {t(section as any, link.key)}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            {t("common", "signOut")}
          </button>
        </div>
      </div>
    </aside>
  )
}
