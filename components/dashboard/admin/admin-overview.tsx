"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Truck,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  MapPin,
  CheckCircle,
  BarChart3,
  Leaf,
  Ship,
} from "lucide-react"
import { formatPrice } from "@/lib/matching-engine"

export function AdminOverview() {
  const platformStats = [
    {
      label: "Ogwiritsa Ntchito",
      labelEn: "Total Users",
      value: "2,450",
      icon: Users,
      color: "text-primary",
      change: "+12%",
      changeType: "positive",
    },
    {
      label: "Oyendetsa",
      labelEn: "Active Transporters",
      value: "892",
      icon: Truck,
      color: "text-chart-2",
      change: "+8%",
      changeType: "positive",
    },
    {
      label: "Katundu Mwezi Uno",
      labelEn: "Monthly Shipments",
      value: "1,234",
      icon: Package,
      color: "text-chart-3",
      change: "+23%",
      changeType: "positive",
    },
    {
      label: "Ndalama za Platform",
      labelEn: "Platform Revenue",
      value: "MK 8.5M",
      icon: DollarSign,
      color: "text-chart-4",
      change: "+18%",
      changeType: "positive",
    },
  ]

  const keyMetrics = {
    emptyReturnRate: { current: 42, target: 40, previous: 70 },
    matchRate: { current: 78, target: 80 },
    averageRating: 4.7,
    disputeRate: 2.3,
    averageResponseTime: "1.8 hrs",
    onTimeDelivery: 91,
  }

  const recentActivity = [
    { id: 1, type: "shipment", text: "Katundu watsopano: Kasungu → Lilongwe (Fodya 7.5T)", time: "2 min ago" },
    { id: 2, type: "user", text: "Woyendetsa watsopano: Kondwani Chirwa (RTOA verified)", time: "15 min ago" },
    { id: 3, type: "dispute", text: "Vuto lathetsedwa: DSP-003 (Border delay)", time: "1 hr ago" },
    { id: 4, type: "match", text: "Backhaul match: Blantyre→Lilongwe -40% discount", time: "2 hrs ago" },
    { id: 5, type: "payment", text: "Ndalama zatumizidwa: MK 485,000 kwa James Banda", time: "3 hrs ago" },
  ]

  const topRoutes = [
    { route: "Lilongwe → Blantyre", routeNy: "LL → BT", shipments: 342, revenue: 2850000, growth: 15, corridor: "M1" },
    { route: "Blantyre → Lilongwe", routeNy: "BT → LL", shipments: 298, revenue: 2450000, growth: 22, corridor: "M1" },
    { route: "Mzuzu → Lilongwe", routeNy: "MZ → LL", shipments: 156, revenue: 1890000, growth: 8, corridor: "M1" },
    {
      route: "Kasungu → Lilongwe",
      routeNy: "KU → LL",
      shipments: 145,
      revenue: 1750000,
      growth: 35,
      note: "Tobacco Season",
    },
    { route: "Blantyre → Mwanza", routeNy: "BT → MW", shipments: 89, revenue: 1250000, growth: 12, corridor: "Border" },
  ]

  const seasonalInsights = {
    current: "Tobacco Season (Jan-Apr)",
    currentNy: "Nyengo ya Fodya",
    demandLevel: "High",
    topCargo: ["Fodya (Tobacco)", "Feteleza (Fertilizer)", "Chimanga (Maize)"],
    affectedRoutes: ["Kasungu→Lilongwe", "Mchinji→Lilongwe", "Lilongwe Auction Floors"],
  }

  const corridorStatus = [
    {
      name: "Nacala Corridor",
      nameNy: "Njira ya Nacala",
      status: "normal",
      borderTime: "4-6 hrs",
      note: "Via Mwanza/Zobue",
    },
    {
      name: "Beira Corridor",
      nameNy: "Njira ya Beira",
      status: "normal",
      borderTime: "6-8 hrs",
      note: "Fuel imports active",
    },
    {
      name: "Dar es Salaam",
      nameNy: "Njira ya Dar",
      status: "delays",
      borderTime: "8-12 hrs",
      note: "Songwe congestion",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Platform Overview</h2>
          <p className="text-muted-foreground">Onani ndipo konzekerani Matola platform</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/admin/analytics">
            <BarChart3 className="h-4 w-4" />
            Onani Analytics
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {platformStats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${stat.changeType === "positive" ? "text-green-500" : "text-red-500"}`}>
                      {stat.change} mwezi uno
                    </span>
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                <Leaf className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{seasonalInsights.currentNy}</p>
                <p className="text-sm text-muted-foreground">{seasonalInsights.current}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {seasonalInsights.topCargo.map((cargo) => (
                <Badge key={cargo} className="bg-amber-500/20 text-amber-400">
                  {cargo}
                </Badge>
              ))}
            </div>
            <Badge className="bg-red-500/20 text-red-400">Demand: {seasonalInsights.demandLevel}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Empty Return Optimization */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Maulendo Opanda Katundu (Empty Return Rate)
            </CardTitle>
            <CardDescription>Kuchepetsa maulendo opanda katundu kudzera backhaul</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-primary">{keyMetrics.emptyReturnRate.current}%</p>
                  <p className="text-sm text-muted-foreground">Panopa (Current)</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-muted-foreground line-through">
                    {keyMetrics.emptyReturnRate.previous}%
                  </p>
                  <p className="text-xs text-muted-foreground">Asanayambe Matola</p>
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Kufika target ({keyMetrics.emptyReturnRate.target}%)</span>
                  <span className="text-primary">
                    {Math.round(
                      ((70 - keyMetrics.emptyReturnRate.current) / (70 - keyMetrics.emptyReturnRate.target)) * 100,
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={((70 - keyMetrics.emptyReturnRate.current) / (70 - keyMetrics.emptyReturnRate.target)) * 100}
                  className="h-2"
                />
              </div>
              <p className="text-sm text-green-500">28% kuchepetsa - oyendetsa akusunga ~MK 2.1M/mwezi</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-primary" />
              Trade Corridors (Njira za Malonda)
            </CardTitle>
            <CardDescription>Border crossing status - Malawi is landlocked</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {corridorStatus.map((corridor) => (
              <div
                key={corridor.name}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="font-medium text-foreground">{corridor.name}</p>
                  <p className="text-xs text-muted-foreground">{corridor.note}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Border Time</p>
                    <p className="font-medium text-foreground">{corridor.borderTime}</p>
                  </div>
                  <Badge
                    className={
                      corridor.status === "normal"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }
                  >
                    {corridor.status === "normal" ? "Bwino" : "Delays"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Routes and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Routes */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Njira Zogwiritsira Ntchito Kwambiri
              </CardTitle>
              <CardDescription>Top shipping corridors</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRoutes.map((route, index) => (
                <div
                  key={route.route}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{route.route}</p>
                        {route.note && <Badge className="bg-amber-500/20 text-amber-400 text-xs">{route.note}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {route.shipments} shipments • {route.corridor && `${route.corridor} Highway`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatPrice(route.revenue)}</p>
                    <p className={`text-xs ${route.growth >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {route.growth >= 0 ? "+" : ""}
                      {route.growth}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Zomwe Zachitika Posachedwapa</CardTitle>
              <CardDescription>Recent platform events</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1">
              Onani Zonse
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const icons = {
                  shipment: Package,
                  user: Users,
                  dispute: AlertTriangle,
                  match: CheckCircle,
                  payment: DollarSign,
                }
                const Icon = icons[activity.type as keyof typeof icons]
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="h-5 w-5" />
            Zofunikira Kuziona (Attention Required)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-yellow-500/30 bg-card p-3">
              <p className="font-medium text-foreground">3 Mavuto Osathetsedwa</p>
              <p className="text-sm text-muted-foreground">Open disputes - require investigation</p>
              <Button variant="link" className="h-auto p-0 text-primary" asChild>
                <Link href="/dashboard/disputes">Onani mavuto</Link>
              </Button>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-card p-3">
              <p className="font-medium text-foreground">12 Akudikira Kutsimikizika</p>
              <p className="text-sm text-muted-foreground">New transporter applications</p>
              <Button variant="link" className="h-auto p-0 text-primary" asChild>
                <Link href="/dashboard/verification">Onani applications</Link>
              </Button>
            </div>
            <div className="rounded-lg border border-yellow-500/30 bg-card p-3">
              <p className="font-medium text-foreground">5 Katundu Opanda Match</p>
              <p className="text-sm text-muted-foreground">No matches for 48+ hours</p>
              <Button variant="link" className="h-auto p-0 text-primary" asChild>
                <Link href="/dashboard/shipments">Onani katundu</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
