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
  const { language } = useLanguage()
  const { logout } = useApp()

  const shipperLinks = [
    { href: "/dashboard", label: { en: "Overview", ny: "Patsogolo" }, icon: LayoutDashboard },
    { href: "/dashboard/new-shipment", label: { en: "New Shipment", ny: "Katundu Watsopano" }, icon: Plus },
    { href: "/dashboard/shipments", label: { en: "My Shipments", ny: "Katundu Wanga" }, icon: Package },
    { href: "/dashboard/tracking", label: { en: "Track Shipment", ny: "Tsatani Katundu" }, icon: MapPin },
    { href: "/dashboard/payments", label: { en: "Payments", ny: "Malipiro" }, icon: CreditCard },
    { href: "/dashboard/disputes", label: { en: "Disputes", ny: "Mikangano" }, icon: AlertTriangle },
    { href: "/dashboard/verification", label: { en: "Verification", ny: "Kutsimikizira" }, icon: Shield },
    { href: "/dashboard/channels", label: { en: "Access Channels", ny: "Njira Zolowera" }, icon: Phone },
    { href: "/dashboard/settings", label: { en: "Settings", ny: "Zokonza" }, icon: Settings },
  ]

  const transporterLinks = [
    { href: "/dashboard/transporter", label: { en: "Overview", ny: "Patsogolo" }, icon: LayoutDashboard },
    { href: "/dashboard/transporter/find-loads", label: { en: "Find Loads", ny: "Pezani Katundu" }, icon: Search },
    { href: "/dashboard/transporter/my-jobs", label: { en: "My Jobs", ny: "Ntchito Zanga" }, icon: Package },
    { href: "/dashboard/transporter/earnings", label: { en: "Earnings", ny: "Ndalama Zanga" }, icon: CreditCard },
    { href: "/dashboard/disputes", label: { en: "Disputes", ny: "Mikangano" }, icon: AlertTriangle },
    { href: "/dashboard/verification", label: { en: "Verification", ny: "Kutsimikizira" }, icon: Shield },
    { href: "/dashboard/channels", label: { en: "Access Channels", ny: "Njira Zolowera" }, icon: Phone },
    { href: "/dashboard/settings", label: { en: "Settings", ny: "Zokonza" }, icon: Settings },
  ]

  const brokerLinks = [
    { href: "/dashboard/broker", label: { en: "Overview", ny: "Patsogolo" }, icon: LayoutDashboard },
    { href: "/dashboard/broker/network", label: { en: "My Network", ny: "Gulu Langa" }, icon: Handshake },
    { href: "/dashboard/broker/matches", label: { en: "Matches", ny: "Zolumikizana" }, icon: Package },
    { href: "/dashboard/broker/earnings", label: { en: "Commissions", ny: "Ma Commission" }, icon: CreditCard },
    { href: "/dashboard/disputes", label: { en: "Disputes", ny: "Mikangano" }, icon: AlertTriangle },
    { href: "/dashboard/channels", label: { en: "Access Channels", ny: "Njira Zolowera" }, icon: Phone },
    { href: "/dashboard/settings", label: { en: "Settings", ny: "Zokonza" }, icon: Settings },
  ]

  const adminLinks = [
    { href: "/dashboard/admin", label: { en: "Overview", ny: "Patsogolo" }, icon: LayoutDashboard },
    { href: "/dashboard/admin/analytics", label: { en: "Analytics", ny: "Kafukufuku" }, icon: BarChart3 },
    { href: "/dashboard/admin/users", label: { en: "Users", ny: "Ogwiritsa Ntchito" }, icon: Handshake },
    { href: "/dashboard/admin/shipments", label: { en: "Shipments", ny: "Katundu" }, icon: Package },
    { href: "/dashboard/admin/disputes", label: { en: "Disputes", ny: "Mikangano" }, icon: AlertTriangle },
    { href: "/dashboard/channels", label: { en: "Channels", ny: "Njira" }, icon: Phone },
    { href: "/dashboard/settings", label: { en: "Settings", ny: "Zokonza" }, icon: Settings },
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
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:block">
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
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label[language]}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {language === "en" ? "Sign Out" : "Tulukanipo"}
          </button>
        </div>
      </div>
    </aside>
  )
}
