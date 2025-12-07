"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Truck,
  MapPin,
  ArrowRight,
  Package,
  Star,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp,
  Navigation,
  CloudRain,
  CheckCircle2,
  X,
  DollarSign,
  Award,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"
import { getSeasonalData } from "@/lib/seasonal/seasonal-intelligence"
import { getTrustLevel, BADGE_DEFINITIONS, type BadgeType } from "@/lib/trust/trust-system"
import { formatMWK } from "@/lib/payments/mobile-money"
import { EmptyState } from "./ui/empty-state"
import { PullToRefresh } from "./ui/pull-to-refresh"
import { NetworkStatus } from "./ui/network-status"

const MOCK_LOADS = [
  {
    id: "LD001",
    origin: "Lilongwe",
    destination: "Blantyre",
    cargo: "Farm Produce",
    weight: 2500,
    price: 85000,
    distance: 320,
    shipper: { name: "Farmers Co-op", rating: 4.8, trustScore: 78, verified: true },
    matchScore: 95,
    isBackhaul: true,
    urgency: "today",
    postedAt: "10 min ago",
  },
  {
    id: "LD002",
    origin: "Lilongwe",
    destination: "Mzuzu",
    cargo: "General Goods",
    weight: 1200,
    price: 65000,
    distance: 350,
    shipper: { name: "QuickMart Ltd", rating: 4.5, trustScore: 65, verified: true },
    matchScore: 82,
    isBackhaul: false,
    urgency: "tomorrow",
    postedAt: "1 hour ago",
  },
  {
    id: "LD003",
    origin: "Lilongwe",
    destination: "Salima",
    cargo: "Building Materials",
    weight: 5000,
    price: 45000,
    distance: 100,
    shipper: { name: "BuildRight", rating: 4.9, trustScore: 85, verified: true },
    matchScore: 78,
    isBackhaul: false,
    urgency: "flexible",
    postedAt: "3 hours ago",
  },
]

const MOCK_BADGES: BadgeType[] = ["first_trip", "trips_10", "fast_responder", "route_expert"]

export function TransporterDashboardV2() {
  const { language } = useTranslation()
  const [isOnline, setIsOnline] = useState(true)
  const [showLoadDetail, setShowLoadDetail] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const seasonalData = getSeasonalData()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loads, setLoads] = useState<typeof MOCK_LOADS>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setLoads(MOCK_LOADS)
      } catch (err) {
        setError("Failed to load available loads")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoads(MOCK_LOADS)
  }

  const stats = [
    {
      label: language === "ny" ? "Lero" : "Today",
      value: formatMWK(85000),
      sublabel: language === "ny" ? "Mwapeza" : "Earned",
      icon: DollarSign,
      color: "text-success",
    },
    {
      label: language === "ny" ? "Sabata" : "Week",
      value: "5",
      sublabel: language === "ny" ? "Maulendo" : "Trips",
      icon: Truck,
      color: "text-primary",
    },
    {
      label: language === "ny" ? "Mfundo" : "Rating",
      value: "4.8",
      sublabel: language === "ny" ? "Nyenyezi" : "Stars",
      icon: Star,
      color: "text-warning",
    },
  ]

  const trustLevel = getTrustLevel(78)

  return (
    <>
      <NetworkStatus />
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="mx-auto max-w-2xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors",
                    isOnline ? "bg-success/10" : "bg-muted",
                  )}
                >
                  <Truck className={cn("h-7 w-7", isOnline ? "text-success" : "text-muted-foreground")} />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">
                    {isOnline
                      ? language === "ny"
                        ? "Muli Pa Ntchito"
                        : "You're Online"
                      : language === "ny"
                        ? "Simuli Pa Ntchito"
                        : "You're Offline"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline
                      ? language === "ny"
                        ? "Mukulandira zopempha"
                        : "Receiving load requests"
                      : language === "ny"
                        ? "Simukulandira zopempha"
                        : "Not receiving requests"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOnline(!isOnline)}
                className={cn(
                  "relative h-10 w-20 rounded-full transition-colors",
                  isOnline ? "bg-success" : "bg-muted",
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 h-8 w-8 rounded-full bg-white shadow-md transition-transform flex items-center justify-center",
                    isOnline ? "left-11" : "left-1",
                  )}
                >
                  {isOnline ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1",
                  trustLevel.level === "highly_trusted" ? "bg-success/10" : "bg-primary/10",
                )}
              >
                <Shield
                  className={cn("h-4 w-4", trustLevel.level === "highly_trusted" ? "text-success" : "text-primary")}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    trustLevel.level === "highly_trusted" ? "text-success" : "text-primary",
                  )}
                >
                  {language === "ny" ? trustLevel.labelNy : trustLevel.label}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">78/100</span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-6 grid grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-4 text-center">
                <stat.icon className={cn("h-5 w-5 mx-auto mb-2", stat.color)} />
                <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-foreground">{language === "ny" ? "Ma Badge Anu" : "Your Badges"}</h3>
              <button className="text-sm text-primary">{language === "ny" ? "Onani Onse" : "View All"}</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {MOCK_BADGES.map((badge) => {
                const def = BADGE_DEFINITIONS[badge]
                return (
                  <div
                    key={badge}
                    className="flex-shrink-0 flex items-center gap-2 rounded-full bg-card border border-border px-3 py-2"
                  >
                    <span className="text-lg">{def.icon}</span>
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">
                      {language === "ny" ? def.nameNy : def.name}
                    </span>
                  </div>
                )
              })}
              <div className="flex-shrink-0 flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary whitespace-nowrap">+4 more</span>
              </div>
            </div>
          </div>

          {seasonalData.demandLevel === "peak" && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-success/10 to-warning/10 border border-success/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="font-medium text-success">
                  {language === "ny" ? "Nthawi Yabwino!" : "Peak Season!"}
                </span>
              </div>
              <p className="text-sm text-foreground">
                {language === "ny"
                  ? "Kufunidwa kwakukulu kwa mayendedwe pa nthawi yokolola. Mwayi wopeza ndalama zambiri!"
                  : "High transport demand during harvest season. Great opportunity to earn more!"}
              </p>
            </div>
          )}

          {seasonalData.weatherAlert && (
            <div className="mb-6 rounded-2xl bg-warning/10 border border-warning/20 p-4 flex items-start gap-3">
              <CloudRain className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {language === "ny" ? "Momwe Misewu Ilili" : "Road Conditions"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "ny" ? seasonalData.weatherAlert.messageNy : seasonalData.weatherAlert.message}
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {language === "ny" ? "Katundu Woyenera Inu" : "Recommended Loads"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {language === "ny" ? "Malinga ndi njira zanu" : "Based on your route history"}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                {language === "ny" ? "Onani Onse" : "View All"}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {loads.length === 0 ? (
              <EmptyState type="loads" onAction={handleRefresh} />
            ) : (
              <div className="space-y-4">
                {loads.map((load) => (
                  <LoadCard
                    key={load.id}
                    load={load}
                    language={language}
                    onViewDetails={() => setShowLoadDetail(load.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Navigation className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">
              {language === "ny" ? "Kubwerera Opanda Katundu?" : "Empty Return Trip?"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "ny"
                ? "Pezani katundu pa njira yobwerera ndipo mupeze ndalama"
                : "Find loads on your way back and earn extra"}
            </p>
            <Button className="bg-primary text-primary-foreground">
              <Zap className="mr-2 h-4 w-4" />
              {language === "ny" ? "Pezani Katundu" : "Find Return Loads"}
            </Button>
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border px-4 py-2 pb-safe">
          <div className="mx-auto max-w-md flex items-center justify-around">
            <NavItem icon={Truck} label={language === "ny" ? "Kwathu" : "Home"} active />
            <NavItem icon={Package} label={language === "ny" ? "Ntchito" : "Jobs"} />

            <button className="flex h-14 w-14 -mt-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <MapPin className="h-7 w-7" />
            </button>

            <NavItem icon={DollarSign} label={language === "ny" ? "Ndalama" : "Earnings"} />
            <NavItem icon={Users} label={language === "ny" ? "Mbiri" : "Profile"} />
          </div>
        </nav>

        {showCelebration && (
          <CelebrationModal badge="trips_10" language={language} onClose={() => setShowCelebration(false)} />
        )}
      </PullToRefresh>
    </>
  )
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  badge,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  badge?: number
}) {
  return (
    <button className="flex flex-col items-center gap-1 px-3 py-2 relative">
      <Icon className={cn("h-6 w-6", active ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-xs", active ? "text-primary font-medium" : "text-muted-foreground")}>{label}</span>
      {badge && (
        <span className="absolute -top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {badge}
        </span>
      )}
    </button>
  )
}

function LoadCard({
  load,
  language,
  onViewDetails,
}: {
  load: (typeof MOCK_LOADS)[0]
  language: "en" | "ny"
  onViewDetails: () => void
}) {
  const trustLevel = getTrustLevel(load.shipper.trustScore)

  const urgencyConfig = {
    today: {
      label: language === "ny" ? "Lero" : "Today",
      color: "bg-destructive/10 text-destructive",
    },
    tomorrow: {
      label: language === "ny" ? "Mawa" : "Tomorrow",
      color: "bg-warning/10 text-warning",
    },
    flexible: {
      label: language === "ny" ? "Nthawi Iliyonse" : "Flexible",
      color: "bg-secondary text-muted-foreground",
    },
  }

  const urgency = urgencyConfig[load.urgency as keyof typeof urgencyConfig]

  return (
    <div className="rounded-2xl bg-card border border-border p-4 transition-all hover:border-primary/30 hover:shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-wrap items-center gap-2">
          {load.isBackhaul && (
            <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              {language === "ny" ? "Kubwerera" : "Backhaul"}
            </span>
          )}
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", urgency.color)}>{urgency.label}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-bold text-primary">{load.matchScore}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <span className="font-semibold text-foreground">{load.origin}</span>
        <div className="flex-1 border-t-2 border-dashed border-border mx-2" />
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 border-t-2 border-dashed border-border mx-2" />
        <span className="font-semibold text-foreground">{load.destination}</span>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5" />
          {load.cargo}
        </span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>{load.weight.toLocaleString()} kg</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
        <span>{load.distance} km</span>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
            <span className="text-sm font-bold text-foreground">
              {load.shipper.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground text-sm">{load.shipper.name}</p>
              {load.shipper.verified && <Shield className="h-3.5 w-3.5 text-success" />}
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="text-xs text-muted-foreground">{load.shipper.rating}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className={cn("text-xs", trustLevel.level === "highly_trusted" ? "text-success" : "text-primary")}>
                {language === "ny" ? trustLevel.labelNy : trustLevel.label}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-primary">{formatMWK(load.price)}</p>
          <p className="text-xs text-muted-foreground">{load.postedAt}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-12 rounded-xl border-border text-muted-foreground bg-transparent"
          onClick={onViewDetails}
        >
          {language === "ny" ? "Zambiri" : "Details"}
        </Button>
        <Button className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground">
          {language === "ny" ? "Vomerani" : "Accept"}
        </Button>
      </div>
    </div>
  )
}

function CelebrationModal({
  badge,
  language,
  onClose,
}: {
  badge: BadgeType
  language: "en" | "ny"
  onClose: () => void
}) {
  const def = BADGE_DEFINITIONS[badge]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-card border border-border p-8 text-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute top-0 left-1/2 w-2 h-2 bg-success rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="absolute top-0 left-3/4 w-2 h-2 bg-warning rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>

        <div className="relative">
          <div className="text-6xl mb-4">{def.icon}</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {language === "ny" ? "Zikomo!" : "Congratulations!"}
          </h2>
          <p className="text-lg font-semibold text-primary mb-2">{language === "ny" ? def.nameNy : def.name}</p>
          <p className="text-muted-foreground mb-6">{language === "ny" ? def.descriptionNy : def.description}</p>

          <Button onClick={onClose} className="w-full h-12 bg-primary text-primary-foreground rounded-xl">
            {language === "ny" ? "Chabwino!" : "Awesome!"}
          </Button>
        </div>
      </div>
    </div>
  )
}
