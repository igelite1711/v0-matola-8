"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  MoreVertical,
  MapPin,
  ArrowRight,
  Calendar,
  Truck,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react"

const mockShipments = [
  {
    id: "s1",
    from: "Lilongwe",
    to: "Blantyre",
    cargo: "Maize (5 tons)",
    date: "2024-01-15",
    price: 185000,
    status: "in_transit",
    shipper: "John Banda",
    transporter: "James Phiri",
  },
  {
    id: "s2",
    from: "Blantyre",
    to: "Zomba",
    cargo: "Fertilizer (3 tons)",
    date: "2024-01-14",
    price: 75000,
    status: "delivered",
    shipper: "NASFAM",
    transporter: "Grace Banda",
  },
  {
    id: "s3",
    from: "Mzuzu",
    to: "Lilongwe",
    cargo: "Tobacco (8 tons)",
    date: "2024-01-13",
    price: 320000,
    status: "posted",
    shipper: "Rumphi Farmers",
    transporter: null,
  },
  {
    id: "s4",
    from: "Lilongwe",
    to: "Kasungu",
    cargo: "Building Materials",
    date: "2024-01-12",
    price: 95000,
    status: "matched",
    shipper: "Banda Trading",
    transporter: "Peter Mwale",
  },
  {
    id: "s5",
    from: "Blantyre",
    to: "Mulanje",
    cargo: "Tea (2 tons)",
    date: "2024-01-11",
    price: 62000,
    status: "disputed",
    shipper: "Tea Estate Ltd",
    transporter: "Mary Chirwa",
  },
]

export default function AdminShipmentsPage() {
  const { user, showToast } = useApp()
  const userName = user?.name || "Admin"
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "posted":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" /> Posted
          </Badge>
        )
      case "matched":
        return (
          <Badge className="bg-blue-500">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Matched
          </Badge>
        )
      case "in_transit":
        return (
          <Badge className="bg-amber-500">
            <Truck className="h-3 w-3 mr-1" /> In Transit
          </Badge>
        )
      case "delivered":
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Delivered
          </Badge>
        )
      case "disputed":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" /> Disputed
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredShipments = mockShipments.filter((s) => {
    const matchesSearch =
      s.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cargo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === "all" || s.status === activeTab
    return matchesSearch && matchesTab
  })

  const stats = {
    total: mockShipments.length,
    posted: mockShipments.filter((s) => s.status === "posted").length,
    inTransit: mockShipments.filter((s) => s.status === "in_transit").length,
    delivered: mockShipments.filter((s) => s.status === "delivered").length,
    disputed: mockShipments.filter((s) => s.status === "disputed").length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="admin" />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType="admin" />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Shipment Management</h1>
            <p className="text-muted-foreground">Monitor and manage all shipments</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Shipments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-blue-600">{stats.posted}</p>
                <p className="text-xs text-muted-foreground">Posted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-amber-600">{stats.inTransit}</p>
                <p className="text-xs text-muted-foreground">In Transit</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-red-600">{stats.disputed}</p>
                <p className="text-xs text-muted-foreground">Disputed</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by route or cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs and Shipment List */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="posted">Posted</TabsTrigger>
              <TabsTrigger value="in_transit">In Transit</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="disputed">Disputed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredShipments.map((shipment) => (
                  <Card key={shipment.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(shipment.status)}
                            <span className="text-sm text-muted-foreground">#{shipment.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <MapPin className="h-4 w-4 text-green-600" />
                            {shipment.from}
                            <ArrowRight className="h-4 w-4" />
                            <MapPin className="h-4 w-4 text-red-600" />
                            {shipment.to}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{shipment.cargo}</p>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Shipper</p>
                            <p className="font-medium">{shipment.shipper}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Transporter</p>
                            <p className="font-medium">{shipment.transporter || "Not assigned"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold">MK {shipment.price.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {shipment.date}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {shipment.status === "disputed" && (
                                <DropdownMenuItem onClick={() => showToast("Opening dispute resolution", "info")}>
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Resolve Dispute
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => showToast("Shipment cancelled", "info")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Shipment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
