"use client"
import { useState, useEffect } from "react"
import type React from "react"

import Link from "next/link"
import {
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Plus,
  TrendingUp,
  ChevronRight,
  Truck,
  Star,
  Phone,
  Zap,
  CloudRain,
  Home,
  Package,
  User,
  Boxes,
  Wheat,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"
import { getSeasonalData } from "@/lib/seasonal/seasonal-intelligence"
import { getTrustLevel } from "@/lib/trust/trust-system"
import { formatMWK } from "@/lib/payments/mobile-money"
import { FullPageSkeleton } from "./ui/loading-skeleton"
import { ErrorState } from "./ui/error-state"
import { EmptyState } from "./ui/empty-state"
import { PullToRefresh } from "./ui/pull-to-refresh"
import { NetworkStatus } from "./ui/network-status"
import { QuickPostModal } from "./quick-post-modal"

const MOCK_SHIPMENTS = [
  {
    id: "SH001",
    origin: "Lilongwe",
    destination: "Blantyre",
    status: "in_transit" as const,
    cargo: "Farm Produce",
    weight: 2500,
    price: 85000,
    transporter: {
      name: "John Banda",
      phone: "0999123456",
      rating: 4.8,
      trustScore: 85,
      photo: null,
    },
    eta: "Today, 4:00 PM",
    progress: 65,
  },
  {
    id: "SH002",
    origin: "Mzuzu",
    destination: "Lilongwe",
    status: "pending" as const,
    cargo: "General Goods",
    weight: 1000,
    price: 65000,
    matches: 3,
    bestMatch: { name: "Peter M.", rating: 4.9, price: 62000 },
  },
  {
    id: "SH003",
    origin: "Blantyre",
    destination: "Zomba",
    status: "completed" as const,
    cargo: "Building Materials",
    weight: 5000,
    price: 45000,
    completedAt: "Yesterday",
    saved: 12000,
  },
]

export function ShipperDashboardV2() {
  const { language } = useTranslation()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shipments, setShipments] = useState<typeof MOCK_SHIPMENTS>([])
  const [showQuickPost, setShowQuickPost] = useState(false)
  const seasonalData = getSeasonalData()

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setShipments(MOCK_SHIPMENTS)
      } catch (err) {
        setError("Failed to load shipments")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setShipments(MOCK_SHIPMENTS)
  }

  const stats = [
    {
      label: language === "ny" ? "Akuyenda" : "In Transit",
      value: shipments.filter((s) => s.status === "in_transit").length.toString(),
      icon: Truck,
      color: "text-primary",
    },
    {
      label: language === "ny" ? "Akupempha" : "Pending",
      value: shipments.filter((s) => s.status === "pending").length.toString(),
      icon: Clock,
      color: "text-warning",
    },
    {
      label: language === "ny" ? "Wafika" : "Delivered",
      value: shipments.filter((s) => s.status === "completed").length.toString(),
      icon: CheckCircle2,
      color: "text-success",
    },
  ]

  if (isLoading) {
    return <FullPageSkeleton type="shipper" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorState
          type="generic"
          onRetry={() => {
            setIsLoading(true)
            setError(null)
            setTimeout(() => {
              setShipments(MOCK_SHIPMENTS)
              setIsLoading(false)
            }, 1500)
          }}
        />
      </div>
    )
  }

  return (
    <>
      <NetworkStatus />
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="mx-auto max-w-2xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{language === "ny" ? "Moni" : "Hello"},</p>
                <h1 className="text-xl font-bold text-foreground">Chisomo</h1>
              </div>
              <Button
                size="lg"
                className="rounded-2xl bg-primary text-primary-foreground h-12 px-5 gap-2 sm:h-11 font-semibold"
                onClick={() => setShowQuickPost(true)}
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">{language === "ny" ? "Tumizani" : "Post Load"}</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-6">
          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-4 text-center">
                <stat.icon className={cn("h-5 w-5 mx-auto mb-2", stat.color)} />
                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Seasonal Alert */}
          {seasonalData.demandLevel === "peak" && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-success/10 to-warning/10 border border-success/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="font-medium text-success">
                  {language === "ny" ? "Nthawi Yokolola!" : "Harvest Season!"}
                </span>
              </div>
              <p className="text-sm text-foreground">
                {language === "ny"
                  ? "Oyendetsa ambiri akupezeka. Mitengo yabwino kwambiri!"
                  : "Many transporters available. Great rates right now!"}
              </p>
            </div>
          )}

          {/* Weather Alert */}
          {seasonalData.weatherAlert && (
            <div className="mb-6 rounded-2xl bg-warning/10 border border-warning/20 p-4 flex items-start gap-3">
              <CloudRain className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === "ny" ? "Chenjezo la Nyengo" : "Weather Alert"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "ny" ? seasonalData.weatherAlert.messageNy : seasonalData.weatherAlert.message}
                </p>
              </div>
            </div>
          )}

          {/* Shipments Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {language === "ny" ? "Katundu Wanu" : "Your Shipments"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {shipments.length} {language === "ny" ? "onse" : "total"}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                {language === "ny" ? "Onani Onse" : "View All"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {shipments.length === 0 ? (
              <EmptyState type="shipments" onAction={() => setShowQuickPost(true)} />
            ) : (
              <div className="space-y-4">
                {shipments.map((shipment) => (
                  <ShipmentCard key={shipment.id} shipment={shipment} language={language} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border px-4 py-2 pb-safe">
          <div className="mx-auto max-w-md flex items-center justify-around">
            <NavItem icon={Home} label={language === "ny" ? "Kwathu" : "Home"} href="/simple/v2/shipper" active />
            <NavItem icon={Package} label={language === "ny" ? "Katundu" : "Shipments"} href="/simple/v2/shipper" />
            <button
              onClick={() => setShowQuickPost(true)}
              className="flex h-14 w-14 -mt-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            >
              <Plus className="h-7 w-7" />
            </button>
            <NavItem icon={MapPin} label={language === "ny" ? "Tsatira" : "Track"} href="/simple/v2/shipper" />
            <NavItem icon={User} label={language === "ny" ? "Ine" : "Profile"} href="/simple/v2/profile" />
          </div>
        </nav>
      </PullToRefresh>

      {/* Quick Post Modal */}
      <QuickPostModal isOpen={showQuickPost} onClose={() => setShowQuickPost(false)} />
    </>
  )
}

function NavItem({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: React.ElementType
  label: string
  href: string
  active?: boolean
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 px-3 py-2">
      <Icon className={cn("h-6 w-6", active ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-xs", active ? "text-primary font-medium" : "text-muted-foreground")}>{label}</span>
    </Link>
  )
}

function getCargoIcon(cargoType: string) {
  const cargoMap: Record<string, React.ElementType> = {
    "Farm Produce": Wheat,
    "General Goods": Boxes,
    "Building Materials": Boxes,
  }
  return cargoMap[cargoType] || Package
}

function ShipmentCard({
  shipment,
  language,
}: {
  shipment: (typeof MOCK_SHIPMENTS)[0]
  language: "en" | "ny"
}) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: language === "ny" ? "Kufufuza Oyendetsa" : "Finding Transporters",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    in_transit: {
      icon: Truck,
      label: language === "ny" ? "Pa Ulendo" : "In Transit",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    completed: {
      icon: CheckCircle2,
      label: language === "ny" ? "Wafika" : "Delivered",
      color: "text-success",
      bg: "bg-success/10",
    },
  }

  const status = statusConfig[shipment.status]
  const StatusIcon = status.icon
  const CargoIcon = getCargoIcon(shipment.cargo)

  return (
    <Link href={shipment.status === "in_transit" ? `/simple/v2/track/${shipment.id}` : "#"}>
      <div className="rounded-2xl bg-card border border-border p-4 transition-all hover:border-primary/30">
        {/* Route Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">{shipment.origin}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{shipment.destination}</span>
          </div>
          <span className="text-sm font-medium text-primary">{formatMWK(shipment.price)}</span>
        </div>

        {/* Details */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <CargoIcon className="h-4 w-4 text-primary" />
            <span>{shipment.cargo}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-muted-foreground" />
          <span className="font-medium text-foreground">{shipment.weight.toLocaleString()} kg</span>
        </div>

        {/* Progress bar for in_transit */}
        {shipment.status === "in_transit" && shipment.progress && (
          <div className="mb-3">
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${shipment.progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">{shipment.progress}% complete</span>
              <span className="text-xs text-muted-foreground">ETA: {shipment.eta}</span>
            </div>
          </div>
        )}

        {/* Transporter info for in_transit */}
        {shipment.status === "in_transit" && shipment.transporter && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 mb-3 gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                <span className="text-sm font-bold text-primary">
                  {shipment.transporter.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{shipment.transporter.name}</p>
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 fill-warning text-warning flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{shipment.transporter.rating}</span>
                  <span className="text-xs text-success">{getTrustLevel(shipment.transporter.trustScore).label}</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              className="h-12 px-6 rounded-full bg-primary text-primary-foreground gap-2 flex-shrink-0"
              onClick={(e) => {
                e.preventDefault()
                window.location.href = `tel:${shipment.transporter?.phone}`
              }}
            >
              <Phone className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">{language === "ny" ? "Imbani" : "Call"}</span>
            </Button>
          </div>
        )}

        {/* Matches for pending */}
        {shipment.status === "pending" && shipment.matches && shipment.bestMatch && (
          <div className="p-3 rounded-xl bg-success/5 border border-success/20 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success font-medium">
                  {shipment.matches} {language === "ny" ? "apezeka" : "matches found"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "ny" ? "Wabwino kwambiri" : "Best match"}: {shipment.bestMatch.name} -{" "}
                  {formatMWK(shipment.bestMatch.price)}
                </p>
              </div>
              <Button size="sm" className="bg-success text-white hover:bg-success/90">
                {language === "ny" ? "Onani" : "View"}
              </Button>
            </div>
          </div>
        )}

        {/* Savings for completed */}
        {shipment.status === "completed" && shipment.saved && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 mb-3">
            <Zap className="h-4 w-4 text-success" />
            <span className="text-sm text-success font-medium">
              {language === "ny" ? "Mwasungira" : "You saved"} {formatMWK(shipment.saved)}
            </span>
          </div>
        )}

        {/* Status Footer */}
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center gap-2 rounded-full px-3 py-1.5", status.bg)}>
            <StatusIcon className={cn("h-4 w-4", status.color)} />
            <span className={cn("text-sm font-medium", status.color)}>{status.label}</span>
          </div>

          <Button variant="ghost" size="sm" className="text-muted-foreground">
            {language === "ny" ? "Zambiri" : "Details"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  )
}
