"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { useApp } from "@/contexts/app-context"
import { Truck, LayoutDashboard, Package, Search, CreditCard, LogOut, Settings, HelpCircle } from "lucide-react"

interface SimpleSidebarProps {
  userType: "shipper" | "transporter" | "broker" | "admin"
}

export function SimpleSidebar({ userType }: SimpleSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()
  const { logout } = useApp()

  const shipperLinks = [
    { href: "/dashboard", label: { en: "Home", ny: "Kunyumba" }, icon: LayoutDashboard },
    { href: "/dashboard/shipments", label: { en: "My Loads", ny: "Katundu Wanga" }, icon: Package },
    { href: "/dashboard/payments", label: { en: "Payments", ny: "Malipiro" }, icon: CreditCard },
  ]

  const transporterLinks = [
    { href: "/dashboard/transporter", label: { en: "Home", ny: "Kunyumba" }, icon: LayoutDashboard },
    { href: "/dashboard/transporter/find-loads", label: { en: "Find Loads", ny: "Pezani Katundu" }, icon: Search },
    { href: "/dashboard/transporter/my-jobs", label: { en: "My Jobs", ny: "Ntchito Zanga" }, icon: Package },
    { href: "/dashboard/transporter/earnings", label: { en: "Earnings", ny: "Ndalama" }, icon: CreditCard },
  ]

  const brokerLinks = [
    { href: "/dashboard/broker", label: { en: "Home", ny: "Kunyumba" }, icon: LayoutDashboard },
    { href: "/dashboard/broker/matches", label: { en: "Matches", ny: "Zolumikizana" }, icon: Package },
    { href: "/dashboard/broker/earnings", label: { en: "Earnings", ny: "Ndalama" }, icon: CreditCard },
  ]

  const adminLinks = [
    { href: "/dashboard/admin", label: { en: "Overview", ny: "Patsogolo" }, icon: LayoutDashboard },
    { href: "/dashboard/admin/shipments", label: { en: "Shipments", ny: "Katundu" }, icon: Package },
    { href: "/dashboard/admin/users", label: { en: "Users", ny: "Anthu" }, icon: Truck },
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
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Matola</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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

        {/* Bottom Links */}
        <div className="border-t border-border p-3 space-y-1">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            {language === "en" ? "Settings" : "Zokonza"}
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
            {language === "en" ? "Help" : "Thandizo"}
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {language === "en" ? "Sign Out" : "Tulukanipo"}
          </button>
        </div>
      </div>
    </aside>
  )
}
