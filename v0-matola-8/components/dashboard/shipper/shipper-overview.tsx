"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useApp } from "@/contexts/app-context"
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  Leaf,
  TrendingUp,
  MapPin,
  Warehouse,
  AlertCircle,
} from "lucide-react"

export function ShipperOverview() {
  const { t, language, formatPrice } = useLanguage()
  const { user, shipments } = useApp()
  const router = useRouter()

  const activeCount = shipments.filter((s) => s.status === "posted" || s.status === "assigned").length
  const inTransitCount = shipments.filter((s) => s.status === "in-transit").length
  const pendingCount = shipments.filter((s) => s.status === "pending").length
  const deliveredCount = shipments.filter((s) => s.status === "delivered").length

  const stats = [
    {
      labelKey: "active",
      value: activeCount.toString(),
      icon: Package,
      color: "text-primary",
    },
    {
      labelKey: "inTransit",
      value: inTransitCount.toString(),
      icon: Truck,
      color: "text-chart-2",
    },
    {
      labelKey: "pending",
      value: pendingCount.toString(),
      icon: Clock,
      color: "text-chart-4",
    },
    {
      labelKey: "delivered",
      value: deliveredCount.toString(),
      icon: CheckCircle,
      color: "text-chart-3",
    },
  ]

  const recentShipments = shipments.slice(0, 3).map((s) => ({
    id: s.id,
    origin: s.origin.city,
    originLandmark: s.origin.landmark || "",
    destination: s.destination.city,
    destLandmark: s.destination.landmark || "",
    status: s.status,
    transporter: s.transporterId || t("shipper", "searching"), // "Searching..." or name
    eta: s.status === "in-transit" ? `2 ${t("time", "hours")}` : "-", // Mock ETA logic
    cargo: s.cargoDescription,
    checkpoint: s.status === "in-transit" ? t("shipper", "onRoute") : undefined,
    isBackhaul: s.isBackhaul,
    isSeasonal: !!s.seasonalCategory,
  }))

  const currentMonth = new Date().getMonth()
  // Determine season keys
  const currentSeason =
    currentMonth >= 0 && currentMonth <= 3
      ? {
        nameKey: "tobaccoSeason",
        months: "Jan - Apr",
        demandKey: "high",
        rate: "+40%",
      }
      : currentMonth >= 3 && currentMonth <= 5
        ? {
          nameKey: "maizeSeason",
          months: "Apr - Jun",
          demandKey: "veryHigh",
          rate: "+50%",
        }
        : currentMonth >= 8 && currentMonth <= 10
          ? {
            nameKey: "fertilizerSeason",
            months: "Sep - Nov",
            demandKey: "high",
            rate: "+35%",
          }
          : {
            nameKey: "regularSeason",
            months: "All Year",
            demandKey: "normal",
            rate: "",
          }

  const marketInfo = [
    {
      nameKey: "admarcPrices",
      items: [
        { cropKey: "maize", price: "MK 350/kg" },
        { cropKey: "groundnuts", price: "MK 800/kg" },
      ],
    },
  ]

  const getStatusBadge = (status: string, isBackhaul?: boolean, isSeasonal?: boolean) => {
    const badges = []

    // Map status to translation key (requires `status` section keys matching status string)
    // status section keys: pending, confirmed, inTransit, delivered, posted, assigned...
    // translations.ts has: pending, confirmed, inTransit, delivered, active, inactive...
    // We might need to map specific status strings to keys if they don't match.
    // 'posted' -> not in status section? 'posted' is usually 'pending' or 'active'.
    // I'll assume standard mapping or fallback.

    // Quick mapping for safety
    const statusKeyMap: Record<string, string> = {
      "in-transit": "inTransit",
      "posted": "pending", // fallback
      "assigned": "active", // fallback
    }
    const statusKey = statusKeyMap[status] || status

    const statusLabel = t("status", statusKey as any)

    let badgeClass = "bg-secondary text-secondary-foreground"
    if (status === "in-transit") badgeClass = "bg-chart-2/20 text-chart-2"
    else if (status === "pending" || status === "posted") badgeClass = "bg-chart-4/20 text-chart-4"
    else if (status === "delivered") badgeClass = "bg-chart-3/20 text-chart-3"
    else if (status === "assigned") badgeClass = "bg-primary/20 text-primary"

    badges.push(
      <Badge key="status" className={cn("text-xs", badgeClass)}>
        {statusLabel}
      </Badge>
    )

    if (isBackhaul) {
      badges.push(
        <Badge key="backhaul" className="bg-green-500/20 text-green-400 text-xs">
          -40% {language === "en" ? "Backhaul" : "Wobwerera"}
          {/* Note: "Wobwerera" isn't in common keys easily, hardcoded for specific bilingual precision or add 'backhaul' key */}
        </Badge>,
      )
    }
    if (isSeasonal) {
      badges.push(
        <Badge key="seasonal" className="bg-amber-500/20 text-amber-400 text-xs">
          {language === "en" ? "Seasonal" : "Nyengo"}
        </Badge>,
      )
    }

    return <div className="flex flex-wrap gap-1">{badges}</div>
  }

  const handleTrack = (shipmentId: string) => {
    router.push(`/dashboard/tracking?id=${shipmentId}`)
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            {t("shipper", "greeting")}, {user?.name?.split(" ")[0] || "User"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("shipper", "overview")}
          </p>
        </div>
        <Button asChild className="h-11 w-full gap-2 sm:h-10 sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
          <Link href="/dashboard/new-shipment">
            <Plus className="h-4 w-4" />
            {t("shipper", "newShipment")}
          </Link>
        </Button>
      </div>

      {/* Seasonal Alert Card */}
      <Card className="border-amber-500/30 bg-amber-500/5 backdrop-blur-sm animate-scale-in" style={{ animationDelay: "0.1s" }}>
        <CardContent className="flex items-center gap-3 p-3 sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
            <Leaf className="h-5 w-5 text-amber-500 animate-pulse-glow" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{t("shipper", currentSeason.nameKey as any)}</p>
            <p className="text-xs text-muted-foreground">
              {currentSeason.months} - {t("shipper", "vehicleDemand")}:{" "}
              {t("shipper", currentSeason.demandKey as any)}
            </p>
          </div>
          {currentSeason.rate && <Badge className="bg-amber-500/20 text-amber-400">{currentSeason.rate}</Badge>}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={stat.labelKey} className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors animate-slide-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary sm:h-12 sm:w-12 ${stat.color}`}
              >
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{t("shipper", stat.labelKey as any)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Malawi Market Info - ADMARC Prices */}
      <Card className="border-primary/30 bg-primary/5 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Warehouse className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">
              {t("shipper", marketInfo[0].nameKey as any)}
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            {marketInfo[0].items.map((item) => (
              <div key={item.cropKey} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("shipper", item.cropKey as any)}:</span>
                <span className="font-semibold text-foreground">{item.price}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>{t("shipper", "updatedToday")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Shipments */}
      <Card className="border-border bg-card animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
          <div>
            <CardTitle className="text-base sm:text-lg">
              {t("shipper", "recentShipments")}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t("shipper", "yourRecentActivity")}
            </CardDescription>
          </div>
          <Button variant="ghost" asChild className="h-9 gap-1 self-start px-2 sm:self-auto">
            <Link href="/dashboard/shipments">
              {t("common", "viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {recentShipments.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {t("shipper", "noShipments")}
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/new-shipment">
                    {t("shipper", "createFirstShipment")}
                  </Link>
                </Button>
              </div>
            ) : (
              recentShipments.map((shipment) => (
                <div key={shipment.id} className="rounded-lg border border-border p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                  {/* Mobile layout */}
                  <div className="flex items-start justify-between gap-2 sm:hidden">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{shipment.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">
                          {shipment.origin} → {shipment.destination}
                        </p>
                        <p className="text-xs text-primary">{shipment.cargo}</p>
                      </div>
                    </div>
                    {getStatusBadge(shipment.status, shipment.isBackhaul, shipment.isSeasonal)}
                  </div>

                  <div className="mt-3 flex items-center justify-between sm:hidden">
                    <div className="text-xs text-muted-foreground">
                      <span>
                        {typeof shipment.transporter === "string" ? shipment.transporter : t("shipper", "driver")}
                      </span>
                      {shipment.eta !== "-" && (
                        <span>
                          * {t("time", "eta")}: {shipment.eta}
                        </span>
                      )}
                      {shipment.checkpoint && <p className="text-primary">{shipment.checkpoint}</p>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-transparent"
                      onClick={() => handleTrack(shipment.id)}
                    >
                      {t("shipper", "trackShipment")}
                    </Button>
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{shipment.id.slice(0, 8).toUpperCase()}</p>
                          <span className="text-xs text-primary">{shipment.cargo}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {shipment.origin} ({shipment.originLandmark}) → {shipment.destination} (
                          {shipment.destLandmark})
                        </p>
                        {shipment.checkpoint && (
                          <p className="text-xs text-chart-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {shipment.checkpoint}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {getStatusBadge(shipment.status, shipment.isBackhaul, shipment.isSeasonal)}
                      <div className="text-sm">
                        <p className="text-muted-foreground">{t("shipper", "driver")}</p>
                        <p className="font-medium text-foreground">
                          {shipment.transporter}
                        </p>
                      </div>
                      {shipment.eta !== "-" && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">{t("time", "eta")}</p>
                          <p className="font-medium text-foreground">
                            {shipment.eta}
                          </p>
                        </div>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleTrack(shipment.id)}>
                        {t("shipper", "trackShipment")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tip Card for Backhaul */}
      <Card className="border-green-500/30 bg-green-500/5 animate-slide-up" style={{ animationDelay: "0.5s" }}>
        <CardContent className="flex items-start gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">
              {t("shipper", "saveMoneyBackhaul")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("shipper", "backhaulDesc")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: "0.6s" }}>
        <Link href="/dashboard/new-shipment">
          <Card className="border-border bg-card transition-colors hover:border-primary/50 active:border-primary/50 hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                <Package className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">{t("shipper", "postLoad")}</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t("shipper", "findTransporters")}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tracking">
          <Card className="border-border bg-card transition-colors hover:border-primary/50 active:border-primary/50 hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                <Truck className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">
                  {t("shipper", "trackShipment")}
                </h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t("shipper", "realTimeLocation")}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/shipments" className="sm:col-span-2 lg:col-span-1">
          <Card className="border-border bg-card transition-colors hover:border-primary/50 active:border-primary/50 hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                <Clock className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">
                  {t("shipper", "shipmentHistory")}
                </h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {t("shipper", "viewPastShipments")}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
