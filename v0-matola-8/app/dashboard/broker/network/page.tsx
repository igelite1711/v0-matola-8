"use client"

import { useState } from "react"
import { useApp } from "@/contexts/app-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Truck, Package, Search, Star, Phone, MapPin, CheckCircle2, UserPlus } from "lucide-react"

// Mock network data
const mockTransporters = [
  {
    id: "t1",
    name: "James Phiri",
    phone: "0888123456",
    rating: 4.9,
    trips: 145,
    vehicle: "10-ton Truck",
    status: "active",
    location: "Lilongwe",
  },
  {
    id: "t2",
    name: "Grace Banda",
    phone: "0888234567",
    rating: 4.7,
    trips: 98,
    vehicle: "5-ton Truck",
    status: "active",
    location: "Blantyre",
  },
  {
    id: "t3",
    name: "Peter Mwale",
    phone: "0888345678",
    rating: 4.8,
    trips: 67,
    vehicle: "3-ton Pickup",
    status: "offline",
    location: "Mzuzu",
  },
  {
    id: "t4",
    name: "Mary Chirwa",
    phone: "0888456789",
    rating: 4.6,
    trips: 52,
    vehicle: "7-ton Truck",
    status: "active",
    location: "Zomba",
  },
]

const mockShippers = [
  {
    id: "s1",
    name: "Banda Trading Co.",
    phone: "0999123456",
    rating: 4.8,
    shipments: 45,
    type: "Retail",
    status: "verified",
  },
  {
    id: "s2",
    name: "NASFAM Lilongwe",
    phone: "0999234567",
    rating: 4.9,
    shipments: 120,
    type: "Agricultural",
    status: "verified",
  },
  {
    id: "s3",
    name: "Chikwawa Farms",
    phone: "0999345678",
    rating: 4.5,
    shipments: 23,
    type: "Agricultural",
    status: "pending",
  },
  {
    id: "s4",
    name: "Blantyre Imports",
    phone: "0999456789",
    rating: 4.7,
    shipments: 67,
    type: "Wholesale",
    status: "verified",
  },
]

export default function BrokerNetworkPage() {
  const { user } = useApp()
  const userName = user?.name || "Broker"
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("transporters")

  const filteredTransporters = mockTransporters.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredShippers = mockShippers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userType="broker" />
      <div className="flex flex-1 flex-col">
        <DashboardHeader userName={userName} userType="broker" />
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">My Network</h1>
              <p className="text-muted-foreground">Manage your transporters and shippers</p>
            </div>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockTransporters.length}</p>
                    <p className="text-xs text-muted-foreground">Transporters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockShippers.length}</p>
                    <p className="text-xs text-muted-foreground">Shippers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <CheckCircle2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockTransporters.filter((t) => t.status === "active").length}</p>
                    <p className="text-xs text-muted-foreground">Active Now</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockTransporters.length + mockShippers.length}</p>
                    <p className="text-xs text-muted-foreground">Total Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="transporters" className="gap-2">
                <Truck className="h-4 w-4" />
                Transporters ({mockTransporters.length})
              </TabsTrigger>
              <TabsTrigger value="shippers" className="gap-2">
                <Package className="h-4 w-4" />
                Shippers ({mockShippers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transporters" className="mt-4">
              <div className="grid gap-4">
                {filteredTransporters.map((transporter) => (
                  <Card key={transporter.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {transporter.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{transporter.name}</h3>
                              <Badge variant={transporter.status === "active" ? "default" : "secondary"}>
                                {transporter.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {transporter.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {transporter.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Truck className="h-3 w-3" />
                                {transporter.vehicle}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold">{transporter.rating}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{transporter.trips} trips</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="shippers" className="mt-4">
              <div className="grid gap-4">
                {filteredShippers.map((shipper) => (
                  <Card key={shipper.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-green-100 text-green-600">
                              {shipper.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{shipper.name}</h3>
                              <Badge variant={shipper.status === "verified" ? "default" : "outline"}>
                                {shipper.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {shipper.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {shipper.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold">{shipper.rating}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{shipper.shipments} shipments</p>
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
