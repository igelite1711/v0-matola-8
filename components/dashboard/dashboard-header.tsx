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

const getShipperLinks = (lang: "en" | "ny") => [
  { href: "/dashboard", label: lang === "en" ? "Overview" : "Patsogolo", icon: LayoutDashboard },
  { href: "/dashboard/new-shipment", label: lang === "en" ? "New Shipment" : "Katundu Watsopano", icon: Plus },
  { href: "/dashboard/shipments", label: lang === "en" ? "My Shipments" : "Katundu Wanga", icon: Package },
  { href: "/dashboard/tracking", label: lang === "en" ? "Track Shipment" : "Tsatani Katundu", icon: MapPin },
  { href: "/dashboard/payments", label: lang === "en" ? "Payments" : "Malipiro", icon: CreditCard },
  { href: "/dashboard/disputes", label: lang === "en" ? "Disputes" : "Mikangano", icon: AlertTriangle },
  { href: "/dashboard/verification", label: lang === "en" ? "Verification" : "Kutsimikizira", icon: Shield },
  { href: "/dashboard/channels", label: lang === "en" ? "Access Channels" : "Njira Zolumikizira", icon: Phone },
]

const getTransporterLinks = (lang: "en" | "ny") => [
  { href: "/dashboard/transporter", label: lang === "en" ? "Overview" : "Patsogolo", icon: LayoutDashboard },
  { href: "/dashboard/transporter/find-loads", label: lang === "en" ? "Find Loads" : "Pezani Katundu", icon: Search },
  { href: "/dashboard/transporter/my-jobs", label: lang === "en" ? "My Jobs" : "Ntchito Zanga", icon: Package },
  { href: "/dashboard/transporter/earnings", label: lang === "en" ? "Earnings" : "Ndalama Zopezeka", icon: CreditCard },
  { href: "/dashboard/transporter/ratings", label: lang === "en" ? "Ratings" : "Mayiko", icon: Star },
  { href: "/dashboard/disputes", label: lang === "en" ? "Disputes" : "Mikangano", icon: AlertTriangle },
  { href: "/dashboard/verification", label: lang === "en" ? "Verification" : "Kutsimikizira", icon: Shield },
  { href: "/dashboard/channels", label: lang === "en" ? "Access Channels" : "Njira Zolumikizira", icon: Phone },
]

const getBrokerLinks = (lang: "en" | "ny") => [
  { href: "/dashboard/broker", label: lang === "en" ? "Overview" : "Patsogolo", icon: LayoutDashboard },
  { href: "/dashboard/broker/network", label: lang === "en" ? "My Network" : "Gulu Langa", icon: Handshake },
  { href: "/dashboard/broker/matches", label: lang === "en" ? "Matches" : "Zofananira", icon: Package },
  {
    href: "/dashboard/broker/earnings",
    label: lang === "en" ? "Commissions" : "Ndalama za Commission",
    icon: CreditCard,
  },
  { href: "/dashboard/disputes", label: lang === "en" ? "Disputes" : "Mikangano", icon: AlertTriangle },
  { href: "/dashboard/channels", label: lang === "en" ? "Access Channels" : "Njira Zolumikizira", icon: Phone },
]

const getAdminLinks = (lang: "en" | "ny") => [
  { href: "/dashboard/admin", label: lang === "en" ? "Overview" : "Patsogolo", icon: LayoutDashboard },
  { href: "/dashboard/admin/analytics", label: lang === "en" ? "Analytics" : "Kafukufuku", icon: BarChart3 },
  { href: "/dashboard/admin/users", label: lang === "en" ? "Users" : "Ogwiritsa Ntchito", icon: Handshake },
  { href: "/dashboard/admin/shipments", label: lang === "en" ? "Shipments" : "Katundu", icon: Package },
  { href: "/dashboard/admin/disputes", label: lang === "en" ? "Disputes" : "Mikangano", icon: AlertTriangle },
  { href: "/dashboard/channels", label: lang === "en" ? "Channels" : "Njira", icon: Phone },
]

export function DashboardHeader({ userName, userType }: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage } = useLanguage()
  const { user, logout, notifications, unreadCount, markAsRead, markAllAsRead } = useApp()

  const linksMap = {
    shipper: getShipperLinks(language),
    transporter: getTransporterLinks(language),
    broker: getBrokerLinks(language),
    admin: getAdminLinks(language),
  }
  const links = linksMap[userType]

  const dashboardTitles = {
    shipper: language === "en" ? "Shipper Dashboard" : "Gawo la Wotumiza",
    transporter: language === "en" ? "Transporter Dashboard" : "Gawo la Woyendetsa",
    broker: language === "en" ? "Broker Dashboard" : "Gawo la Dalali",
    admin: language === "en" ? "Admin Dashboard" : "Gawo la Oyang'anira",
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (language === "en") {
      if (minutes < 60) return `${minutes}m ago`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      return `${Math.floor(hours / 24)}d ago`
    } else {
      if (minutes < 60) return `mphindi ${minutes} zapitazo`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `maola ${hours} apitawo`
      return `masiku ${Math.floor(hours / 24)} apitawo`
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:h-16 md:px-6">
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
          <h1 className="text-lg font-semibold text-foreground">{dashboardTitles[userType]}</h1>
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
              <span>🇬🇧</span> English {language === "en" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("ny")} className="gap-2">
              <span>🇲🇼</span> Chichewa {language === "ny" && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-10 w-10 sm:h-9 sm:w-9">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-2">
              <span className="font-semibold">{language === "en" ? "Notifications" : "Zidziwitso"}</span>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
                  {language === "en" ? "Mark all read" : "Onetsani zonse"}
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {language === "en" ? "No notifications" : "Palibe zidziwitso"}
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
                    <span className="text-xs text-muted-foreground">{getRelativeTime(notification.createdAt)}</span>
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
              <Link href="/dashboard/settings">{language === "en" ? "Settings" : "Zokonza"}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/verification">{language === "en" ? "Verification" : "Kutsimikizira"}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {language === "en" ? "Sign Out" : "Tulukani"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu - Translated navigation label */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 z-50 overflow-y-auto bg-background sm:top-16 md:hidden">
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
              {language === "en" ? "Sign Out" : "Tulukani"}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
