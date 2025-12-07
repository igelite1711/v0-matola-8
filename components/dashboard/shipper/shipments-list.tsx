"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Search, MapPin, Calendar, Truck, ArrowRight, Plus } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"

export function ShipmentsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()
  const { shipments } = useApp()
  const { language } = useLanguage()

  const displayShipments = shipments.map((s) => ({
    id: s.id,
    origin: s.origin.city,
    destination: s.destination.city,
    status: s.status,
    cargoType: s.cargoDescription,
    weight: `${s.weight.toLocaleString()} kg`,
    transporter: s.status !== "posted" ? "Assigned Driver" : null,
    price: `MK ${s.price.toLocaleString()}`,
    createdAt: s.createdAt.toLocaleDateString(),
    eta: s.status === "in_transit" ? "2 hrs" : null,
  }))

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      posted: "bg-chart-4/20 text-chart-4",
      pending: "bg-chart-4/20 text-chart-4",
      matched: "bg-chart-2/20 text-chart-2",
      confirmed: "bg-chart-2/20 text-chart-2",
      in_transit: "bg-primary/20 text-primary",
      "in-transit": "bg-primary/20 text-primary",
      picked_up: "bg-primary/20 text-primary",
      delivered: "bg-chart-3/20 text-chart-3",
      completed: "bg-chart-3/20 text-chart-3",
      cancelled: "bg-destructive/20 text-destructive",
    }
    const label = status.replace(/_/g, " ").replace("-", " ")
    return <Badge className={styles[status] || "bg-secondary"}>{label}</Badge>
  }

  const filteredShipments = displayShipments.filter((shipment) => {
    const matchesSearch =
      shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "pending") return matchesSearch && (shipment.status === "posted" || shipment.status === "pending")
    if (activeTab === "in-transit")
      return matchesSearch && (shipment.status === "in_transit" || shipment.status === "picked_up")
    if (activeTab === "delivered")
      return matchesSearch && (shipment.status === "delivered" || shipment.status === "completed")
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{language === "en" ? "My Shipments" : "Katundu Wanga"}</h2>
          <p className="text-muted-foreground">
            {language === "en" ? "Manage and track all your shipments" : "Onetsetsani katundu wanu wonse"}
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/new-shipment">
            <Plus className="h-4 w-4" />
            {language === "en" ? "New Shipment" : "Katundu Watsopano"}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={language === "en" ? "Search shipments..." : "Sakani katundu..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">{language === "en" ? "All" : "Onse"}</TabsTrigger>
          <TabsTrigger value="pending">{language === "en" ? "Pending" : "Akudikira"}</TabsTrigger>
          <TabsTrigger value="in-transit">{language === "en" ? "In Transit" : "Pa Njira"}</TabsTrigger>
          <TabsTrigger value="delivered">{language === "en" ? "Delivered" : "Yafika"}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              {filteredShipments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-lg font-medium text-foreground">
                    {language === "en" ? "No shipments found" : "Palibe katundu wapezeka"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Try adjusting your search or filters" : "Sinthani zosakira zanu"}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/new-shipment">
                      <Plus className="mr-2 h-4 w-4" />
                      {language === "en" ? "Create New Shipment" : "Pangani Katundu"}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredShipments.map((shipment) => (
                    <div key={shipment.id} className="p-4 md:p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
                            <Package className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{shipment.id.toUpperCase()}</p>
                              {getStatusBadge(shipment.status)}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {shipment.origin} <ArrowRight className="inline h-3 w-3" /> {shipment.destination}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {shipment.cargoType} • {shipment.weight}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                          {shipment.transporter && (
                            <div className="text-sm">
                              <p className="text-muted-foreground">
                                {language === "en" ? "Transporter" : "Woyendetsa"}
                              </p>
                              <div className="flex items-center gap-1">
                                <Truck className="h-3 w-3 text-primary" />
                                <span className="font-medium text-foreground">{shipment.transporter}</span>
                              </div>
                            </div>
                          )}
                          <div className="text-sm">
                            <p className="text-muted-foreground">{language === "en" ? "Price" : "Mtengo"}</p>
                            <p className="font-semibold text-primary">{shipment.price}</p>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">{language === "en" ? "Created" : "Tsiku"}</p>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="font-medium text-foreground">{shipment.createdAt}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/dashboard/shipments/${shipment.id}`)}
                            >
                              {language === "en" ? "View" : "Onani"}
                            </Button>
                            {(shipment.status === "in_transit" ||
                              shipment.status === "in-transit" ||
                              shipment.status === "picked_up") && (
                              <Button size="sm" onClick={() => router.push(`/dashboard/tracking/${shipment.id}`)}>
                                {language === "en" ? "Track" : "Tsatani"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
