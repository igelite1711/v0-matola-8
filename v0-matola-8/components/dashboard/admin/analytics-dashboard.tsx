"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Banknote,
  Phone,
  MessageCircle,
  Globe,
  Wheat,
  Leaf,
  MapPin,
  Truck,
  Shield,
} from "lucide-react"
import { formatPrice } from "@/lib/matching-engine"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const shipmentData = [
  { month: "Jan", shipments: 412, revenue: 18500000, season: "Fodya" },
  { month: "Feb", shipments: 478, revenue: 21800000, season: "Fodya" },
  { month: "Mar", shipments: 534, revenue: 24500000, season: "Fodya Peak" },
  { month: "Apr", shipments: 623, revenue: 28900000, season: "Chimanga" },
  { month: "May", shipments: 567, revenue: 26200000, season: "Chimanga" },
  { month: "Jun", shipments: 489, revenue: 22100000, season: "Chimanga" },
]

const seasonalCargoData = [
  { month: "Jan", fodya: 320, chimanga: 45, tiyi: 12, feteleza: 35 },
  { month: "Feb", fodya: 380, chimanga: 38, tiyi: 15, feteleza: 45 },
  { month: "Mar", fodya: 420, chimanga: 42, tiyi: 18, feteleza: 54 },
  { month: "Apr", fodya: 180, chimanga: 380, tiyi: 22, feteleza: 41 },
  { month: "May", fodya: 95, chimanga: 420, tiyi: 18, feteleza: 34 },
  { month: "Jun", fodya: 45, chimanga: 390, tiyi: 25, feteleza: 29 },
]

const emptyReturnData = [
  { month: "Jan", rate: 68, backhaul: 32 },
  { month: "Feb", rate: 58, backhaul: 42 },
  { month: "Mar", rate: 52, backhaul: 48 },
  { month: "Apr", rate: 45, backhaul: 55 },
  { month: "May", rate: 42, backhaul: 58 },
  { month: "Jun", rate: 38, backhaul: 62 },
]

const channelData = [
  { name: "USSD *384#", value: 48, users: 14850, color: "hsl(var(--primary))" },
  { name: "WhatsApp", value: 32, users: 9920, color: "#25D366" },
  { name: "Web/PWA", value: 12, users: 3720, color: "hsl(var(--chart-3))" },
  { name: "Brokers", value: 8, users: 2480, color: "hsl(var(--chart-4))" },
]

const paymentMethodData = [
  { name: "Airtel Money", value: 42, amount: 52800000 },
  { name: "TNM Mpamba", value: 28, amount: 35200000 },
  { name: "Cash on Delivery", value: 22, amount: 27600000 },
  { name: "Bank Transfer", value: 8, amount: 10000000 },
]

const routeVolumeData = [
  { route: "LL→BT", shipments: 892, label: "Lilongwe → Blantyre", type: "domestic" },
  { route: "BT→LL", shipments: 756, label: "Blantyre → Lilongwe", type: "backhaul" },
  { route: "MZ→LL", shipments: 423, label: "Mzuzu → Lilongwe", type: "domestic" },
  { route: "LL→MZ", shipments: 389, label: "Lilongwe → Mzuzu", type: "domestic" },
  { route: "KU→LL", shipments: 312, label: "Kasungu → Lilongwe", type: "tobacco" },
  { route: "LL→Nacala", shipments: 245, label: "Export: Nacala Corridor", type: "export" },
  { route: "LL→Beira", shipments: 198, label: "Export: Beira Corridor", type: "export" },
  { route: "BT→Mwanza", shipments: 167, label: "Border: Mwanza/Zobue", type: "border" },
]

const regionalData = [
  { region: "Central", shipments: 1456, transporters: 342, revenue: 65200000 },
  { region: "Southern", shipments: 1123, transporters: 298, revenue: 48900000 },
  { region: "Northern", shipments: 524, transporters: 152, revenue: 22800000 },
]

const COLORS = ["hsl(var(--primary))", "#25D366", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]
const PAYMENT_COLORS = ["#E53935", "#FFC107", "#4CAF50", "#2196F3"]

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Malawi Logistics Analytics</h2>
          <p className="text-muted-foreground">Chiwerengero cha platform - Platform metrics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-amber-500 bg-amber-50 text-amber-700">
            <Leaf className="mr-1 h-3 w-3" />
            Nyengo ya Fodya
          </Badge>
          <Select defaultValue="30d">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Masiku 7</SelectItem>
              <SelectItem value="30d">Masiku 30</SelectItem>
              <SelectItem value="90d">Masiku 90</SelectItem>
              <SelectItem value="1y">Chaka chimodzi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats - Malawi Context */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Revenue",
            labelMw: "Ndalama Zonse",
            value: formatPrice(136900000),
            change: "+24%",
            icon: Banknote,
            positive: true,
          },
          {
            label: "Total Shipments",
            labelMw: "Katundu Yonse",
            value: "3,103",
            change: "+31%",
            icon: Package,
            positive: true,
          },
          {
            label: "RTOA Verified Drivers",
            labelMw: "Oyendetsa Otsimikizirika",
            value: "792",
            change: "+18%",
            icon: Shield,
            positive: true,
          },
          {
            label: "Backhaul Match Rate",
            labelMw: "Backhaul Success",
            value: "62%",
            change: "+30%",
            icon: TrendingUp,
            positive: true,
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.labelMw}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {stat.positive ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${stat.positive ? "text-green-500" : "text-red-500"}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seasonal">Nyengo / Seasons</TabsTrigger>
          <TabsTrigger value="corridors">Trade Corridors</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Shipments & Revenue Chart */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Shipments & Revenue</CardTitle>
                <CardDescription>Monthly growth - Kukula kwa mwezi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={shipmentData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value, name) => [
                          name === "revenue" ? formatPrice(value as number) : value,
                          name === "revenue" ? "Revenue" : "Shipments",
                        ]}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="shipments"
                        stroke="hsl(var(--chart-2))"
                        fill="transparent"
                        strokeWidth={2}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Backhaul Success Rate */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Backhaul Success Rate</CardTitle>
                <CardDescription>Empty trips reduced from 68% to 38%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emptyReturnData}>
                      <defs>
                        <linearGradient id="colorBackhaul" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value, name) => [
                          `${value}%`,
                          name === "rate" ? "Empty Returns" : "Backhaul Matched",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#EF4444"
                        fill="transparent"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      <Area
                        type="monotone"
                        dataKey="backhaul"
                        stroke="#22C55E"
                        fillOpacity={1}
                        fill="url(#colorBackhaul)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regional Breakdown */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
              <CardDescription>Chiwerengero cha zigawo - Northern, Central, Southern</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {regionalData.map((region) => (
                  <div key={region.region} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground">{region.region} Region</h4>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipments</span>
                        <span className="font-medium">{region.shipments.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transporters</span>
                        <span className="font-medium">{region.transporters}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-medium text-primary">{formatPrice(region.revenue)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Seasonal Cargo Distribution</CardTitle>
                <CardDescription>Katundu wa nyengo - Fodya, Chimanga, Tiyi, Feteleza</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={seasonalCargoData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="fodya"
                        stackId="1"
                        stroke="#059669"
                        fill="#059669"
                        fillOpacity={0.6}
                        name="Fodya (Tobacco)"
                      />
                      <Area
                        type="monotone"
                        dataKey="chimanga"
                        stackId="1"
                        stroke="#D97706"
                        fill="#D97706"
                        fillOpacity={0.6}
                        name="Chimanga (Maize)"
                      />
                      <Area
                        type="monotone"
                        dataKey="tiyi"
                        stackId="1"
                        stroke="#7C3AED"
                        fill="#7C3AED"
                        fillOpacity={0.6}
                        name="Tiyi (Tea)"
                      />
                      <Area
                        type="monotone"
                        dataKey="feteleza"
                        stackId="1"
                        stroke="#2563EB"
                        fill="#2563EB"
                        fillOpacity={0.6}
                        name="Feteleza (Fertilizer)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Current Season Insights</CardTitle>
                <CardDescription>Nyengo ya panopa - What's moving now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-green-500/30 bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Fodya Season (Jan-Apr)</span>
                    <Badge className="bg-green-600">ACTIVE</Badge>
                  </div>
                  <p className="mt-2 text-sm text-green-700">
                    High demand for Kasungu → Lilongwe → Auction Floors routes. Rates +40% premium.
                  </p>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="text-green-600">Shipments: 1,120</span>
                    <span className="text-green-600">Avg Rate: MK 285/km</span>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-4">
                  <div className="flex items-center gap-2">
                    <Wheat className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-amber-800">Chimanga Season (Apr-Jun)</span>
                    <Badge variant="outline" className="border-amber-500 text-amber-700">
                      UPCOMING
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-amber-700">
                    Prepare for maize harvest. ADMARC depot runs and export corridor demand increases.
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">Other Seasons</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>Tiyi (Sep-Nov)</span>
                    <span>Feteleza (Sep-Nov)</span>
                    <span>Shuga (Jul-Oct)</span>
                    <span>Cotton (May-Aug)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="corridors" className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Trade Corridor Volume</CardTitle>
              <CardDescription>Njira za malonda - Domestic & Export routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={routeVolumeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="route" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value, name, props) => [value, props.payload.label]}
                    />
                    <Bar dataKey="shipments" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-blue-500/30 bg-blue-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800">Nacala Corridor</h4>
                <p className="text-sm text-blue-600">Lilongwe → Nacala Port (Mozambique)</p>
                <p className="mt-2 text-2xl font-bold text-blue-700">245</p>
                <p className="text-xs text-blue-600">Export shipments this month</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30 bg-green-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800">Beira Corridor</h4>
                <p className="text-sm text-green-600">Blantyre → Beira Port (Mozambique)</p>
                <p className="mt-2 text-2xl font-bold text-green-700">198</p>
                <p className="text-xs text-green-600">Export shipments this month</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-50">
              <CardContent className="p-4">
                <h4 className="font-semibold text-amber-800">Dar Corridor</h4>
                <p className="text-sm text-amber-600">Mzuzu → Dar es Salaam (Tanzania)</p>
                <p className="mt-2 text-2xl font-bold text-amber-700">89</p>
                <p className="text-xs text-amber-600">Export shipments this month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Channel Distribution */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Access Channel Distribution</CardTitle>
                <CardDescription>Njira zolowera - How users access Matola</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods - Malawi specific */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Njira zolipirira - Airtel Money, TNM Mpamba, Cash</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethodData.map((method, index) => (
                  <div
                    key={method.name}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[index] }} />
                      <div>
                        <p className="font-medium text-foreground">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(method.amount)}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold">{method.value}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Channel Stats */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Channel Performance Details</CardTitle>
              <CardDescription>Momwe anthu amagwiritsira ntchito platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {channelData.map((channel) => {
                  const icons: Record<string, typeof Phone> = {
                    "USSD *384#": Phone,
                    WhatsApp: MessageCircle,
                    "Web/PWA": Globe,
                    Brokers: Users,
                  }
                  const Icon = icons[channel.name] || Phone
                  return (
                    <div key={channel.name} className="rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${channel.color}20` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: channel.color }} />
                        </div>
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold">{channel.users.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">active users</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${channel.value}%`, backgroundColor: channel.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-6 text-center">
                <TrendingDown className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-4 text-4xl font-bold text-green-500">30%</p>
                <p className="text-lg font-medium text-foreground">Empty Trip Reduction</p>
                <p className="text-sm text-muted-foreground">Kuchepetsa Maulendo Opanda Kanthu</p>
                <p className="mt-2 text-sm text-muted-foreground">From 68% to 38% empty return trips</p>
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <Banknote className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 text-4xl font-bold text-primary">+40%</p>
                <p className="text-lg font-medium text-foreground">Driver Income Increase</p>
                <p className="text-sm text-muted-foreground">Kukwera kwa Ndalama za Oyendetsa</p>
                <p className="mt-2 text-sm text-muted-foreground">Average monthly earnings growth</p>
              </CardContent>
            </Card>
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-6 text-center">
                <Package className="mx-auto h-12 w-12 text-amber-500" />
                <p className="mt-4 text-4xl font-bold text-amber-500">-40%</p>
                <p className="text-lg font-medium text-foreground">Shipper Cost Savings</p>
                <p className="text-sm text-muted-foreground">Kusungidwa kwa Atumiza Katundu</p>
                <p className="mt-2 text-sm text-muted-foreground">Through backhaul discounts</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Social Impact Summary</CardTitle>
              <CardDescription>Momwe Matola ikusintha logistics ku Malawi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border p-4">
                  <Truck className="h-6 w-6 text-primary" />
                  <p className="mt-2 text-3xl font-bold text-foreground">792</p>
                  <p className="text-sm text-muted-foreground">RTOA Verified Transporters</p>
                  <p className="text-xs text-muted-foreground">Oyendetsa otsimikizirika</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <Banknote className="h-6 w-6 text-green-500" />
                  <p className="mt-2 text-3xl font-bold text-foreground">MK 48.5M</p>
                  <p className="text-sm text-muted-foreground">Fuel Costs Saved</p>
                  <p className="text-xs text-muted-foreground">Mafuta osungidwa</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <Users className="h-6 w-6 text-blue-500" />
                  <p className="mt-2 text-3xl font-bold text-foreground">28</p>
                  <p className="text-sm text-muted-foreground">Districts Covered</p>
                  <p className="text-xs text-muted-foreground">Maboma onse atatu</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <Shield className="h-6 w-6 text-amber-500" />
                  <p className="mt-2 text-3xl font-bold text-foreground">24 hrs</p>
                  <p className="text-sm text-muted-foreground">Avg Dispute Resolution</p>
                  <p className="text-xs text-muted-foreground">Kuthetsa mikangano</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Malawi-specific success stories */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Success Stories</CardTitle>
              <CardDescription>Nkhani za Kupambana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-green-500/30 bg-green-50 p-4">
                  <p className="font-semibold text-green-800">Kasungu Tobacco Farmers</p>
                  <p className="mt-1 text-sm text-green-700">
                    45 small-scale tobacco farmers now access affordable transport to Lilongwe Auction Floors, saving MK
                    2.8M collectively through backhaul matching.
                  </p>
                </div>
                <div className="rounded-lg border border-blue-500/30 bg-blue-50 p-4">
                  <p className="font-semibold text-blue-800">Women Transporters Initiative</p>
                  <p className="mt-1 text-sm text-blue-700">
                    23 women-owned transport businesses onboarded and verified. Average income increase of 52% through
                    access to consistent loads.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
