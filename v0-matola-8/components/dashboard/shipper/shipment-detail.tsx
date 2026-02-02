"use client"

import { useState } from "react"
import { ArrowLeft, Package, Calendar, Truck, Phone, Star, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApp } from "@/contexts/app-context"
import { findMatches, formatPrice } from "@/lib/matching-engine"
import { mockTransporters } from "@/lib/mock-data"

interface ShipmentDetailProps {
  shipmentId: string
}

export function ShipmentDetail({ shipmentId }: ShipmentDetailProps) {
  const router = useRouter()
  const { shipments, bids, acceptBid, updateShipment } = useApp()

  const shipment = shipments.find((s) => s.id === shipmentId)
  const shipmentBids = bids.filter((b) => b.shipmentId === shipmentId)
  const matches = shipment ? findMatches(shipment, mockTransporters, 5) : []

  const [selectedTab, setSelectedTab] = useState("matches")
  const [isAccepting, setIsAccepting] = useState<string | null>(null)

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    posted: "bg-primary/20 text-primary",
    matched: "bg-blue-500/20 text-blue-400",
    confirmed: "bg-green-500/20 text-green-400",
    picked_up: "bg-yellow-500/20 text-yellow-400",
    in_transit: "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    completed: "bg-green-600/20 text-green-500",
    cancelled: "bg-destructive/20 text-destructive",
  }

  const handleAcceptBid = async (bidId: string) => {
    setIsAccepting(bidId)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    acceptBid(bidId)
    setIsAccepting(null)
    router.push(`/dashboard/tracking/${shipmentId}`)
  }

  const handleSelectTransporter = async (transporterId: string) => {
    if (!shipment) return
    setIsAccepting(transporterId)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    updateShipment(shipmentId, { status: "confirmed" })
    setIsAccepting(null)
    router.push(`/dashboard/tracking/${shipmentId}`)
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Shipment not found</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/shipments">Back to Shipments</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/shipments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Shipment #{shipment.id.toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground">Created {shipment.createdAt.toLocaleDateString()}</p>
          </div>
          <Badge className={statusColors[shipment.status]}>{shipment.status.replace("_", " ")}</Badge>
        </div>

        {/* Route Card */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <div className="h-16 w-0.5 bg-border" />
                <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pickup</p>
                  <p className="font-medium">{shipment.origin.city}</p>
                  <p className="text-sm text-muted-foreground">{shipment.origin.landmark}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Delivery</p>
                  <p className="font-medium">{shipment.destination.city}</p>
                  <p className="text-sm text-muted-foreground">{shipment.destination.landmark}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{formatPrice(shipment.price)}</p>
                <p className="text-sm text-muted-foreground">{shipment.paymentMethod.replace("_", " ")}</p>
                {shipment.isBackhaul && (
                  <Badge variant="outline" className="mt-2 border-green-500/50 text-green-400">
                    Backhaul Rate
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-primary" />
                Cargo Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{shipment.cargoType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Description</span>
                <span className="text-right">{shipment.cargoDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span>{shipment.weight.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicle Required</span>
                <span className="capitalize">{shipment.requiredVehicleType.replace("_", " ")}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-primary" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup Date</span>
                <span>{shipment.pickupDate.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time Window</span>
                <span>{shipment.pickupTimeWindow}</span>
              </div>
              {shipment.specialInstructions && (
                <div className="pt-2">
                  <p className="text-muted-foreground">Special Instructions</p>
                  <p className="mt-1 rounded bg-muted/50 p-2">{shipment.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Matches & Bids Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="matches">Smart Matches ({matches.length})</TabsTrigger>
            <TabsTrigger value="bids">Bids ({shipmentBids.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="mt-4 space-y-3">
            {matches.length === 0 ? (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="py-8 text-center">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">Finding transporters...</p>
                </CardContent>
              </Card>
            ) : (
              matches.map((match) => (
                <Card key={match.id} className="border-border/50 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {match.transporterName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{match.transporterName}</h3>
                          <div className="flex items-center gap-1 text-sm text-yellow-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {match.transporterRating.toFixed(1)}
                          </div>
                          {match.isBackhaul && (
                            <Badge variant="outline" className="border-green-500/50 text-green-400">
                              Backhaul
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5" />
                            {match.vehiclePlate}
                          </span>
                          <span className="capitalize">{match.vehicleType.replace("_", " ")}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex h-6 items-center rounded-full bg-primary/20 px-2 text-xs font-medium text-primary">
                            {match.matchScore}% match
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSelectTransporter(match.transporterId)}
                          disabled={isAccepting === match.transporterId}
                        >
                          {isAccepting === match.transporterId ? "Selecting..." : "Select"}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="mr-1 h-3.5 w-3.5" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="bids" className="mt-4 space-y-3">
            {shipmentBids.length === 0 ? (
              <Card className="border-border/50 bg-card/50">
                <CardContent className="py-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">No bids yet</p>
                  <p className="text-sm text-muted-foreground">Transporters can send you offers</p>
                </CardContent>
              </Card>
            ) : (
              shipmentBids.map((bid) => (
                <Card key={bid.id} className="border-border/50 bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {bid.transporterName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{bid.transporterName}</h3>
                          <div className="flex items-center gap-1 text-sm text-yellow-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {bid.transporterRating.toFixed(1)}
                          </div>
                        </div>
                        <p className="mt-1 text-xl font-bold text-primary">{formatPrice(bid.proposedPrice)}</p>
                        {bid.message && (
                          <p className="mt-2 rounded bg-muted/50 p-2 text-sm text-muted-foreground">"{bid.message}"</p>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Bid received {Math.round((Date.now() - bid.createdAt.getTime()) / (1000 * 60 * 60))}h ago
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" onClick={() => handleAcceptBid(bid.id)} disabled={isAccepting === bid.id}>
                          {isAccepting === bid.id ? "Accepting..." : "Accept"}
                        </Button>
                        <Button size="sm" variant="outline">
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
