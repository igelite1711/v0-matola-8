"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Bell,
  Menu,
  User,
  Truck,
  X,
  LayoutDashboard,
  Package,
  Plus,
  MapPin,
  CreditCard,
  Search,
  Star,
  ChevronRight,
  Phone,
  AlertTriangle,
  Shield,
  Globe,
  Handshake,
  BarChart3,
  LogOut,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"

interface DashboardHeaderProps {
  userName: string
  userType: "shipper" | "transporter" | "broker" | "admin"
}

const SHIPPER_LINKS = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboard },
  { href: "/dashboard/new-shipment", key: "newShipment", icon: Plus },
  { href: "/dashboard/shipments", key: "myShipments", icon: Package },
  { href: "/dashboard/tracking", key: "tracking", icon: MapPin },
  { href: "/dashboard/payments", key: "payments", icon: CreditCard },
  { href: "/dashboard/disputes", key: "disputes", icon: AlertTriangle },
  { href: "/dashboard/verification", key: "verification", icon: Shield },
  { href: "/dashboard/channels", key: "channels", icon: Phone },
] as const

const TRANSPORTER_LINKS = [
  { href: "/dashboard/transporter", key: "overview", icon: LayoutDashboard },
  { href: "/dashboard/transporter/find-loads", key: "findLoads", icon: Search },
  { href: "/dashboard/transporter/my-jobs", key: "myJobs", icon: Package },
  { href: "/dashboard/transporter/earnings", key: "earnings", icon: CreditCard },
  { href: "/dashboard/transporter/ratings", key: "ratings", icon: Star },
  { href: "/dashboard/disputes", key: "disputes", icon: AlertTriangle },
  { href: "/dashboard/verification", key: "verification", icon: Shield },
  { href: "/dashboard/channels", key: "channels", icon: Phone },
] as const

const BROKER_LINKS = [
  { href: "/dashboard/broker", key: "overview", icon: LayoutDashboard },
  { href: "/dashboard/broker/network", key: "network", icon: Handshake },
  { href: "/dashboard/broker/matches", key: "matches", icon: Package },
  { href: "/dashboard/broker/earnings", key: "commissions", icon: CreditCard },
  { href: "/dashboard/disputes", key: "disputes", icon: AlertTriangle },
  { href: "/dashboard/channels", key: "channels", icon: Phone },
] as const

const ADMIN_LINKS = [
  { href: "/dashboard/admin", key: "overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/analytics", key: "analytics", icon: BarChart3 },
  { href: "/dashboard/admin/users", key: "users", icon: Handshake },
  { href: "/dashboard/admin/shipments", key: "shipments", icon: Package },
  { href: "/dashboard/admin/disputes", key: "disputes", icon: AlertTriangle },
  { href: "/dashboard/channels", key: "channels", icon: Phone },
] as const

export function DashboardHeader({ userName, userType }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const { user, logout, notifications, unreadCount, markAsRead, markAllAsRead } = useApp()

  const linksConfig = {
    shipper: SHIPPER_LINKS,
    transporter: TRANSPORTER_LINKS,
    broker: BROKER_LINKS,
    admin: ADMIN_LINKS,
  }

  const links = linksConfig[userType].map(link => ({
    ...link,
    label: t("nav", link.key as any)
  }))

  const dashboardTitles = {
    shipper: t("shipper", "title"),
    transporter: t("driver", "title"),
    broker: t("agent", "title"),
    admin: "Admin Dashboard",
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 60) {
      return `${minutes} ${t("time", "minutes")} ${t("time", "ago")}`
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return `${hours} ${t("time", "hours")} ${t("time", "ago")}`
    }
    return `${Math.floor(hours / 24)} ${t("time", "days")} ${t("time", "ago")}`
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:h-16 md:px-6 animate-slide-down">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={language === "en" ? "Toggle menu" : "Tsegulani menyu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Truck className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Matola</span>
        </Link>

        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-foreground">
            {dashboardTitles[userType] || dashboardTitles.shipper}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <OfflineIndicator />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-9 sm:w-9">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage("en")} className="gap-2">
              <span>🇬🇧</span> {t("common", "english")} {language === "en" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("ny")} className="gap-2">
              <span>🇲🇼</span> {t("common", "chichewa")} {language === "ny" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 sm:h-9 sm:w-9">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-2">
              <span className="font-semibold">{t("common", "notifications")}</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
                  {t("common", "markAllRead")}
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {t("common", "noNotifications")}
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start gap-1 p-3 cursor-pointer",
                      !notification.read && "bg-primary/5",
                    )}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.link) {
                        router.push(notification.link)
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="font-medium text-sm">{notification.title}</span>
                      {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">{notification.message}</span>
                    <span className="text-xs text-muted-foreground">{getRelativeTime(new Date(notification.createdAt))}</span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 px-2 sm:h-9 sm:px-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden text-sm font-medium sm:inline">{user?.name || userName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">{t("common", "settings")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/verification">{t("nav", "verification")}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {t("common", "signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-50 overflow-y-auto bg-background sm:top-16 md:hidden animate-in slide-in-from-top-10 fade-in duration-200">
          <nav className="flex flex-col p-4">
            <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {language === "en" ? "Navigation" : "Kuyenda"}
            </div>
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-4 text-base font-medium transition-colors active:bg-secondary",
                    isActive ? "bg-primary/10 text-primary" : "text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    {link.label}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )
            })}

            <div className="my-4 border-t border-border" />

            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-4 text-base font-medium text-destructive active:bg-secondary"
            >
              <LogOut className="h-5 w-5" />
              {t("common", "signOut")}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
