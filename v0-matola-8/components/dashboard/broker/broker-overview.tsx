"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Users, Truck, Package, Phone, Star, Search, UserPlus, Handshake, Wallet, Shield, Route } from "lucide-react"
import { formatPrice } from "@/lib/matching-engine"

interface NetworkMember {
  id: string
  name: string
  type: "transporter" | "shipper"
  phone: string
  rating: number
  completedJobs: number
  status: "active" | "pending" | "inactive"
  joinedDate: string
  earnings?: number
  shipments?: number
  verificationLevel?: string
  preferredRoutes?: string[]
  region?: string
}

const mockNetwork: NetworkMember[] = [
  {
    id: "1",
    name: "James Banda",
    type: "transporter",
    phone: "+265 991 234 567",
    rating: 4.8,
    completedJobs: 234,
    status: "active",
    joinedDate: "2023-01-15",
    earnings: 2450000,
    verificationLevel: "RTOA",
    preferredRoutes: ["LL-BT", "BT-ZA"],
    region: "Southern",
  },
  {
    id: "2",
    name: "Grace Phiri",
    type: "transporter",
    phone: "+265 888 345 678",
    rating: 4.9,
    completedJobs: 178,
    status: "active",
    joinedDate: "2022-08-20",
    earnings: 1890000,
    verificationLevel: "RTOA",
    preferredRoutes: ["LL-MZ", "LL-KU"],
    region: "Central",
  },
  {
    id: "3",
    name: "Malawi Grains Ltd",
    type: "shipper",
    phone: "+265 999 111 222",
    rating: 4.7,
    completedJobs: 89,
    status: "active",
    joinedDate: "2023-03-10",
    shipments: 89,
    region: "Central",
  },
  {
    id: "4",
    name: "Kondwani Chirwa",
    type: "transporter",
    phone: "+265 884 567 890",
    rating: 4.5,
    completedJobs: 92,
    status: "pending",
    joinedDate: "2024-01-05",
    earnings: 450000,
    verificationLevel: "Community",
    preferredRoutes: ["KU-LL"],
    region: "Central",
  },
  {
    id: "5",
    name: "BuildMart Hardware",
    type: "shipper",
    phone: "+265 992 333 444",
    rating: 4.6,
    completedJobs: 45,
    status: "active",
    joinedDate: "2023-06-20",
    shipments: 45,
    region: "Southern",
  },
]

const pendingMatches = [
  {
    id: "PM-001",
    shipper: "Malawi Grains Ltd",
    transporter: "James Banda",
    route: "Lilongwe (Kanengo) → Blantyre (Limbe)",
    routeShort: "LL → BT",
    cargo: "Chimanga 5,000 kg",
    cargoNy: "Chimanga (Maize)",
    price: 185000,
    commission: 9250,
    status: "awaiting_confirmation",
    isSeasonal: true,
  },
  {
    id: "PM-002",
    shipper: "BuildMart Hardware",
    transporter: "Grace Phiri",
    route: "Blantyre (Ginnery) → Zomba (Market)",
    routeShort: "BT → ZA",
    cargo: "Simenti 3,500 kg",
    cargoNy: "Simenti (Cement)",
    price: 45000,
    commission: 2250,
    status: "negotiating",
    isBackhaul: true,
  },
]

export function BrokerOverview() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const stats = [
    {
      label: "Network Size",
      labelNy: "Onse mu Network",
      value: "48",
      icon: Users,
      color: "text-primary",
      change: "+5 mwezi uno",
    },
    {
      label: "Oyendetsa",
      labelNy: "Active Transporters",
      value: "32",
      icon: Truck,
      color: "text-chart-2",
      change: "67% of network",
    },
    {
      label: "Otumiza",
      labelNy: "Active Shippers",
      value: "16",
      icon: Package,
      color: "text-chart-3",
      change: "33% of network",
    },
    {
      label: "Commission",
      labelNy: "Ndalama Zopezeka",
      value: "MK 485K",
      icon: Wallet,
      color: "text-chart-4",
      change: "+15% mwezi uno",
    },
  ]

  const filteredNetwork = mockNetwork.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.phone.includes(searchQuery)

    if (activeTab === "all") return matchesSearch
    if (activeTab === "transporters") return matchesSearch && member.type === "transporter"
    if (activeTab === "shippers") return matchesSearch && member.type === "shipper"
    if (activeTab === "pending") return matchesSearch && member.status === "pending"
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Broker Dashboard</h2>
          <p className="text-muted-foreground">Konzekerani network yanu ndipo muthandize kutumiza katundu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <UserPlus className="h-4 w-4" />
            Onjezani Membala
          </Button>
          <Button className="gap-2">
            <Handshake className="h-4 w-4" />
            Pangani Match
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.labelNy}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Commission Summary - Enhanced with Chichewa */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Ndalama za Commission</h3>
              <p className="text-sm text-muted-foreground">
                Mumalandira 5% pa match iliyonse yochokera mu network yanu
              </p>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{formatPrice(485000)}</p>
                <p className="text-xs text-muted-foreground">Mwezi Uno</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{formatPrice(2850000)}</p>
                <p className="text-xs text-muted-foreground">Nthawi Yonse</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-chart-3">156</p>
                <p className="text-xs text-muted-foreground">Matches Zonse</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Matches - Enhanced with Malawi routes */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-primary" />
              Matches Zikudikira
            </CardTitle>
            <CardDescription>Shipments zikudikira kuvomerezedwa kapena kunegotiate</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingMatches.map((match) => (
            <div key={match.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">#{match.id}</span>
                    <Badge
                      className={
                        match.status === "awaiting_confirmation"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-blue-500/20 text-blue-400"
                      }
                    >
                      {match.status === "awaiting_confirmation" ? "Ikudikira Kuvomerezedwa" : "Ikunegotiate"}
                    </Badge>
                    {match.isSeasonal && <Badge className="bg-amber-500/20 text-amber-400">Nyengo</Badge>}
                    {match.isBackhaul && <Badge className="bg-green-500/20 text-green-400">Backhaul -40%</Badge>}
                  </div>
                  <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Shipper:</span>
                      <span className="text-foreground">{match.shipper}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Transporter:</span>
                      <span className="text-foreground">{match.transporter}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{match.routeShort}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground">{match.cargoNy}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-foreground">{formatPrice(match.price)}</p>
                  <p className="text-sm text-primary">Commission yanu: {formatPrice(match.commission)}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Negotiate
                    </Button>
                    <Button size="sm">Vomerezani</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Network Members - Enhanced with verification badges */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Network Yanga</CardTitle>
              <CardDescription>Oyendetsa ndi otumiza omwe mumagwira nawo ntchito</CardDescription>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sakani mu network..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Onse ({mockNetwork.length})</TabsTrigger>
              <TabsTrigger value="transporters">
                Oyendetsa ({mockNetwork.filter((m) => m.type === "transporter").length})
              </TabsTrigger>
              <TabsTrigger value="shippers">
                Otumiza ({mockNetwork.filter((m) => m.type === "shipper").length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Akudikira ({mockNetwork.filter((m) => m.status === "pending").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-3">
              {filteredNetwork.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        member.type === "transporter" ? "bg-primary/20" : "bg-chart-2/20"
                      }`}
                    >
                      {member.type === "transporter" ? (
                        <Truck className="h-6 w-6 text-primary" />
                      ) : (
                        <Package className="h-6 w-6 text-chart-2" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{member.name}</p>
                        <Badge
                          variant="outline"
                          className={
                            member.status === "active"
                              ? "border-green-500/50 text-green-400"
                              : member.status === "pending"
                                ? "border-yellow-500/50 text-yellow-400"
                                : "border-muted text-muted-foreground"
                          }
                        >
                          {member.status === "active"
                            ? "Wogwira"
                            : member.status === "pending"
                              ? "Akudikira"
                              : "Inactive"}
                        </Badge>
                        {member.verificationLevel && (
                          <Badge className="bg-green-500/20 text-green-400">
                            <Shield className="h-3 w-3 mr-1" />
                            {member.verificationLevel}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          {member.rating}
                        </span>
                        <span>{member.completedJobs} ntchito</span>
                        {member.region && <span>• {member.region}</span>}
                      </div>
                      {member.preferredRoutes && (
                        <div className="mt-1 flex gap-1">
                          {member.preferredRoutes.map((route) => (
                            <Badge key={route} variant="outline" className="text-xs">
                              {route}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {member.earnings && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Apeza kudzera inu</p>
                        <p className="font-semibold text-primary">{formatPrice(member.earnings)}</p>
                      </div>
                    )}
                    {member.shipments && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Shipments</p>
                        <p className="font-semibold text-foreground">{member.shipments}</p>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      <Phone className="mr-2 h-3 w-3" />
                      Imbani
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
