"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Truck, MapPin, ArrowRight, CheckCircle2, Clock, XCircle, DollarSign, Handshake } from "lucide-react"

const mockMatches = [
  {
    id: "m1",
    shipment: { from: "Lilongwe", to: "Blantyre", cargo: "Maize (5 tons)", date: "2024-01-15", price: 185000 },
    transporter: { name: "James Phiri", vehicle: "10-ton Truck", rating: 4.9 },
    shipper: { name: "NASFAM Lilongwe" },
    status: "pending",
    commission: 9250,
    matchScore: 95,
  },
  {
    id: "m2",
    shipment: { from: "Blantyre", to: "Zomba", cargo: "Fertilizer (3 tons)", date: "2024-01-14", price: 75000 },
    transporter: { name: "Grace Banda", vehicle: "5-ton Truck", rating: 4.7 },
    shipper: { name: "Banda Trading Co." },
    status: "accepted",
    commission: 3750,
    matchScore: 88,
  },
  {
    id: "m3",
    shipment: { from: "Mzuzu", to: "Lilongwe", cargo: "Tobacco (8 tons)", date: "2024-01-13", price: 320000 },
    transporter: { name: "Peter Mwale", vehicle: "15-ton Truck", rating: 4.8 },
    shipper: { name: "Rumphi Farmers" },
    status: "completed",
    commission: 16000,
    matchScore: 92,
  },
  {
    id: "m4",
    shipment: { from: "Lilongwe", to: "Mzuzu", cargo: "Electronics", date: "2024-01-12", price: 125000 },
    transporter: { name: "Mary Chirwa", vehicle: "7-ton Truck", rating: 4.6 },
    shipper: { name: "Blantyre Imports" },
    status: "rejected",
    commission: 0,
    matchScore: 75,
  },
]

export default function BrokerMatchesPage() {
  const { user } = useApp()
  const userName = user?.name || "Broker"
  const [activeTab, setActiveTab] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="gap-1 bg-blue-500">
            <CheckCircle2 className="h-3 w-3" /> Accepted
          </Badge>
        )
      case "completed":
        return (
          <Badge className="gap-1 bg-green-500">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredMatches = activeTab === "all" ? mockMatches : mockMatches.filter((m) => m.status === activeTab)

  const totalCommission = mockMatches.filter((m) => m.status === "completed").reduce((sum, m) => sum + m.commission, 0)

  const pendingCommission = mockMatches.filter((m) => m.status === "accepted").reduce((sum, m) => sum + m.commission, 0)

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="broker" />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType="broker" />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Matches</h1>
            <p className="text-muted-foreground">Track your shipper-transporter matches</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Handshake className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockMatches.length}</p>
                    <p className="text-xs text-muted-foreground">Total Matches</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockMatches.filter((m) => m.status === "pending").length}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockMatches.filter((m) => m.status === "completed").length}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">MK {totalCommission.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matches List */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({mockMatches.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="accepted">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="space-y-4">
                {filteredMatches.map((match) => (
                  <Card key={match.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Route Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(match.status)}
                            <Badge variant="outline">{match.matchScore}% match</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <MapPin className="h-4 w-4 text-green-600" />
                            {match.shipment.from}
                            <ArrowRight className="h-4 w-4" />
                            <MapPin className="h-4 w-4 text-red-600" />
                            {match.shipment.to}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{match.shipment.cargo}</p>
                        </div>

                        {/* Parties */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Shipper</p>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{match.shipper.name}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Transporter</p>
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-green-600" />
                              <span className="font-medium">{match.transporter.name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Commission */}
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Commission (5%)</p>
                          <p className="text-xl font-bold text-green-600">MK {match.commission.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">of MK {match.shipment.price.toLocaleString()}</p>
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
