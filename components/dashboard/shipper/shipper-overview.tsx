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
      label: { en: "Active", ny: "Zikuyenda" },
      value: activeCount.toString(),
      icon: Package,
      color: "text-primary",
    },
    {
      label: { en: "In Transit", ny: "Pa Njira" },
      value: inTransitCount.toString(),
      icon: Truck,
      color: "text-chart-2",
    },
    {
      label: { en: "Pending", ny: "Zikudikira" },
      value: pendingCount.toString(),
      icon: Clock,
      color: "text-chart-4",
    },
    {
      label: { en: "Delivered", ny: "Zafika" },
      value: deliveredCount.toString(),
      icon: CheckCircle,
      color: "text-chart-3",
    },
  ]

  const recentShipments = shipments.slice(0, 3).map((s) => ({
    id: s.id,
    origin: s.origin.city,
    originLandmark: { en: s.origin.landmark || "", ny: s.origin.landmark || "" },
    destination: s.destination.city,
    destLandmark: { en: s.destination.landmark || "", ny: s.destination.landmark || "" },
    status: s.status,
    transporter: s.transporterId || { en: "Searching...", ny: "Akusakidwa..." },
    eta: s.status === "in-transit" ? { en: "2 hours", ny: "Maola 2" } : "-",
    cargo: { en: s.cargoDescription, ny: s.cargoDescription },
    checkpoint: s.status === "in-transit" ? { en: "On route", ny: "Pa Njira" } : undefined,
    isBackhaul: s.isBackhaul,
    isSeasonal: !!s.seasonalCategory,
  }))

  const currentMonth = new Date().getMonth()
  const currentSeason =
    currentMonth >= 0 && currentMonth <= 3
      ? {
          name: { en: "Tobacco Season", ny: "Nyengo ya Fodya" },
          months: "Jan - Apr",
          demand: { en: "High", ny: "Yokwera" },
          rate: "+40%",
        }
      : currentMonth >= 3 && currentMonth <= 5
        ? {
            name: { en: "Maize Harvest", ny: "Nyengo ya Chimanga" },
            months: "Apr - Jun",
            demand: { en: "Very High", ny: "Yokwera Kwambiri" },
            rate: "+50%",
          }
        : currentMonth >= 8 && currentMonth <= 10
          ? {
              name: { en: "Fertilizer Season", ny: "Nyengo ya Feteleza" },
              months: "Sep - Nov",
              demand: { en: "High", ny: "Yokwera" },
              rate: "+35%",
            }
          : {
              name: { en: "Regular Season", ny: "Nyengo Yamba" },
              months: "All Year",
              demand: { en: "Normal", ny: "Yabwinobwino" },
              rate: "",
            }

  const marketInfo = [
    {
      name: { en: "ADMARC Buying Prices", ny: "Mitengo ya ADMARC" },
      items: [
        { crop: { en: "Maize", ny: "Chimanga" }, price: "MK 350/kg" },
        { crop: { en: "Groundnuts", ny: "Mtedza" }, price: "MK 800/kg" },
      ],
    },
  ]

  const getStatusBadge = (status: string, isBackhaul?: boolean, isSeasonal?: boolean) => {
    const badges = []

    const statusLabels: Record<string, { en: string; ny: string }> = {
      "in-transit": { en: "In Transit", ny: "Pa Njira" },
      pending: { en: "Pending", ny: "Ikudikira" },
      delivered: { en: "Delivered", ny: "Yafika" },
      posted: { en: "Posted", ny: "Yaposidwa" },
      assigned: { en: "Assigned", ny: "Yapatsidwa" },
    }

    switch (status) {
      case "in-transit":
        badges.push(
          <Badge key="status" className="bg-chart-2/20 text-chart-2 text-xs">
            {statusLabels[status][language]}
          </Badge>,
        )
        break
      case "pending":
      case "posted":
        badges.push(
          <Badge key="status" className="bg-chart-4/20 text-chart-4 text-xs">
            {statusLabels[status]?.[language] || status}
          </Badge>,
        )
        break
      case "delivered":
        badges.push(
          <Badge key="status" className="bg-chart-3/20 text-chart-3 text-xs">
            {statusLabels[status][language]}
          </Badge>,
        )
        break
      case "assigned":
        badges.push(
          <Badge key="status" className="bg-primary/20 text-primary text-xs">
            {statusLabels[status][language]}
          </Badge>,
        )
        break
      default:
        badges.push(
          <Badge key="status" variant="secondary" className="text-xs">
            {status}
          </Badge>,
        )
    }

    if (isBackhaul) {
      badges.push(
        <Badge key="backhaul" className="bg-green-500/20 text-green-400 text-xs">
          -40% {language === "en" ? "Backhaul" : "Wobwerera"}
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

  const handleViewDetails = (shipmentId: string) => {
    router.push(`/dashboard/shipments/${shipmentId}`)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            {language === "en"
              ? `Hello, ${user?.name?.split(" ")[0] || "User"}`
              : `Muli bwanji, ${user?.name?.split(" ")[0] || "User"}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === "en" ? "Here's your shipment overview" : "Nawa momwe zikuyendera katundu wanu"}
          </p>
        </div>
        <Button asChild className="h-11 w-full gap-2 sm:h-10 sm:w-auto">
          <Link href="/dashboard/new-shipment">
            <Plus className="h-4 w-4" />
            {language === "en" ? "New Shipment" : "Tumizani Katundu"}
          </Link>
        </Button>
      </div>

      {/* Seasonal Alert Card */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-center gap-3 p-3 sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
            <Leaf className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{currentSeason.name[language]}</p>
            <p className="text-xs text-muted-foreground">
              {currentSeason.months} - {language === "en" ? "Vehicle demand:" : "Kufuna kwa magalimoto:"}{" "}
              {currentSeason.demand[language]}
            </p>
          </div>
          {currentSeason.rate && <Badge className="bg-amber-500/20 text-amber-400">{currentSeason.rate}</Badge>}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label.en} className="border-border bg-card">
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary sm:h-12 sm:w-12 ${stat.color}`}
              >
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{stat.label[language]}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Malawi Market Info - ADMARC Prices */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Warehouse className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">
              {language === "en" ? "ADMARC Market Prices" : "Mitengo ya ADMARC"}
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            {marketInfo[0].items.map((item) => (
              <div key={item.crop.en} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{item.crop[language]}:</span>
                <span className="font-semibold text-foreground">{item.price}</span>
              </div>
            ))}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>{language === "en" ? "Updated today" : "Yasinthidwa lero"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Shipments */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between sm:pb-4">
          <div>
            <CardTitle className="text-base sm:text-lg">
              {language === "en" ? "Recent Shipments" : "Katundu Wapanopa"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {language === "en" ? "Your recent activity" : "Zomwe mukuchita posachedwapa"}
            </CardDescription>
          </div>
          <Button variant="ghost" asChild className="h-9 gap-1 self-start px-2 sm:self-auto">
            <Link href="/dashboard/shipments">
              {language === "en" ? "View All" : "Onani Zonse"}
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
                  {language === "en" ? "No shipments yet" : "Palibe katundu pano"}
                </p>
                <Button asChild className="mt-4">
                  <Link href="/dashboard/new-shipment">
                    {language === "en" ? "Create Your First Shipment" : "Pangani Katundu Woyamba"}
                  </Link>
                </Button>
              </div>
            ) : (
              recentShipments.map((shipment) => (
                <div key={shipment.id} className="rounded-lg border border-border p-3 sm:p-4">
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
                        <p className="text-xs text-primary">{shipment.cargo[language]}</p>
                      </div>
                    </div>
                    {getStatusBadge(shipment.status, shipment.isBackhaul, shipment.isSeasonal)}
                  </div>

                  <div className="mt-3 flex items-center justify-between sm:hidden">
                    <div className="text-xs text-muted-foreground">
                      <span>
                        {typeof shipment.transporter === "string"
                          ? shipment.transporter
                          : shipment.transporter[language]}
                      </span>
                      {shipment.eta !== "-" && (
                        <span>
                          {" "}
                          * {language === "en" ? "ETA:" : "Kufika:"}{" "}
                          {typeof shipment.eta === "string" ? shipment.eta : shipment.eta[language]}
                        </span>
                      )}
                      {shipment.checkpoint && <p className="text-primary">{shipment.checkpoint[language]}</p>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-transparent"
                      onClick={() => handleTrack(shipment.id)}
                    >
                      {language === "en" ? "Track" : "Tsatani"}
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
                          <span className="text-xs text-primary">{shipment.cargo[language]}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {shipment.origin} ({shipment.originLandmark[language]}) → {shipment.destination} (
                          {shipment.destLandmark[language]})
                        </p>
                        {shipment.checkpoint && (
                          <p className="text-xs text-chart-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {shipment.checkpoint[language]}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {getStatusBadge(shipment.status, shipment.isBackhaul, shipment.isSeasonal)}
                      <div className="text-sm">
                        <p className="text-muted-foreground">{language === "en" ? "Driver" : "Woyendetsa"}</p>
                        <p className="font-medium text-foreground">
                          {typeof shipment.transporter === "string"
                            ? shipment.transporter
                            : shipment.transporter[language]}
                        </p>
                      </div>
                      {shipment.eta !== "-" && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">{language === "en" ? "ETA" : "Kufika"}</p>
                          <p className="font-medium text-foreground">
                            {typeof shipment.eta === "string" ? shipment.eta : shipment.eta[language]}
                          </p>
                        </div>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleTrack(shipment.id)}>
                        {language === "en" ? "Track" : "Tsatani"}
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
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">
              {language === "en" ? "Save Money with Backhaul" : "Sungani Ndalama ndi Backhaul"}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "en"
                ? "Backhaul shipments are 40% cheaper! These are trucks returning from their destination that have empty space."
                : "Katundu wa backhaul ndi wotchipa 40%! Awa ndi magalimoto omwe akubwerera kuchokera kumalo ena ndipo ali ndi malo opanda kanthu."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <Link href="/dashboard/new-shipment">
          <Card className="border-border bg-card transition-colors hover:border-primary/50 active:border-primary/50">
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                <Package className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">{language === "en" ? "Post a Load" : "Ikani Katundu"}</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {language === "en" ? "Find transporters" : "Pezani oyendetsa"}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/tracking">
          <Card className="border-border bg-card transition-colors hover:border-primary/50 active:border-primary/50">
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                <Truck className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">
                  {language === "en" ? "Track Shipment" : "Tsatani Katundu"}
                </h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {language === "en" ? "Real-time location" : "Malo enieni"}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/shipments" className="sm:col-span-2 lg:col-span-1">
          <Card className="border-border bg-card transition-colors hover:border-primary/50 active:border-primary/50">
            <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:h-12 sm:w-12">
                <Clock className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground">
                  {language === "en" ? "Shipment History" : "Mbiri ya Katundu"}
                </h3>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {language === "en" ? "View past shipments" : "Onani zakale"}
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
