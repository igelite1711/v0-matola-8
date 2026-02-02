"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle,
  Circle,
  Clock,
  Navigation,
  Star,
  Camera,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useApp } from "@/contexts/app-context"
import { LiveTrackingMap } from "@/components/maps/live-tracking-map"

interface TrackingEvent {
  id: string
  status: string
  description: string
  location: string
  timestamp: Date
  completed: boolean
}

interface ShipmentTrackingProps {
  shipmentId: string
}

export function ShipmentTracking({ shipmentId }: ShipmentTrackingProps) {
  const router = useRouter()
  const { shipments, updateShipment, showToast } = useApp()
  const [isConfirming, setIsConfirming] = useState(false)
  const [simulatedProgress, setSimulatedProgress] = useState(0)
  const [geofenceAlert, setGeofenceAlert] = useState<string | null>(null)

  const shipment = shipments.find((s) => s.id === shipmentId)

  useEffect(() => {
    if (!shipment) return

    const statusProgress: Record<string, number> = {
      confirmed: 5,
      picked_up: 20,
      in_transit: 60,
      at_checkpoint: 75,
      delivered: 95,
      completed: 100,
    }

    setSimulatedProgress(statusProgress[shipment.status] || 0)
  }, [shipment])

  useEffect(() => {
    if (!shipment || shipment.status === "completed" || shipment.status === "delivered") return

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        const maxProgress = shipment.status === "in_transit" ? 90 : prev
        if (prev < maxProgress) {
          return Math.min(prev + 0.5, maxProgress)
        }
        return prev
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [shipment])

  const handleGeofenceEnter = (zone: "pickup" | "dropoff") => {
    if (zone === "dropoff") {
      setGeofenceAlert("Driver has arrived at the delivery location!")
      showToast("Driver has arrived at destination", "success")
    } else if (zone === "pickup") {
      setGeofenceAlert("Driver has arrived at pickup location!")
      showToast("Driver arrived at pickup", "info")
    }
  }

  const trackingData = shipment
    ? {
        id: shipmentId,
        origin: shipment.origin,
        destination: shipment.destination,
        status: shipment.status,
        price: shipment.price,
        eta: "Today, 4:30 PM",
        distance: "310 km",
        distanceCovered: `${Math.round((simulatedProgress / 100) * 310)} km`,
        progress: simulatedProgress,
        transporter: {
          name: "Grace Phiri",
          phone: "+265 888 345 678",
          rating: 4.9,
          vehiclePlate: "LL 7832",
          vehicleType: "Large Truck",
        },
        shipper: {
          name: shipment.shipperName,
          phone: "+265 991 111 222",
        },
      }
    : null

  const getTrackingEvents = (status: string): TrackingEvent[] => {
    const baseEvents: TrackingEvent[] = [
      {
        id: "1",
        status: "Shipment Created",
        description: "Load posted and confirmed",
        location: trackingData?.origin.city || "Lilongwe",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        completed: true,
      },
      {
        id: "2",
        status: "Transporter Assigned",
        description: "Grace Phiri accepted the load",
        location: trackingData?.origin.city || "Lilongwe",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        completed: true,
      },
      {
        id: "3",
        status: "Picked Up",
        description: "Cargo loaded and departure confirmed",
        location: trackingData?.origin.landmark || "Kanengo Industrial Area",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        completed: ["picked_up", "in_transit", "at_checkpoint", "delivered", "completed"].includes(status),
      },
      {
        id: "4",
        status: "In Transit",
        description: "Currently en route to destination",
        location: "Dedza (M1 Highway)",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        completed: ["in_transit", "at_checkpoint", "delivered", "completed"].includes(status),
      },
      {
        id: "5",
        status: "Arriving Soon",
        description: "Estimated arrival in 2 hours",
        location: `Approaching ${trackingData?.destination.city || "Blantyre"}`,
        timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000),
        completed: ["delivered", "completed"].includes(status),
      },
      {
        id: "6",
        status: "Delivered",
        description: status === "completed" ? "Delivery confirmed" : "Awaiting delivery confirmation",
        location: trackingData?.destination.landmark || "Limbe Market",
        timestamp: new Date(Date.now() + 3 * 60 * 60 * 1000),
        completed: ["delivered", "completed"].includes(status),
      },
    ]
    return baseEvents
  }

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-500/20 text-blue-400",
    picked_up: "bg-yellow-500/20 text-yellow-400",
    in_transit: "bg-blue-500/20 text-blue-400",
    at_checkpoint: "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    completed: "bg-green-600/20 text-green-500",
  }

  const handleConfirmDelivery = async () => {
    setIsConfirming(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    updateShipment(shipmentId, { status: "completed" })
    setIsConfirming(false)
    showToast("Delivery confirmed successfully!", "success")
    router.push("/dashboard/shipments")
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-2xl">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="py-12 text-center">
              <Navigation className="mx-auto h-12 w-12 text-muted-foreground" />
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

  const trackingEvents = getTrackingEvents(trackingData.status)

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/shipments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Track Shipment</h1>
            <p className="text-sm text-muted-foreground">#{shipmentId.toUpperCase()}</p>
          </div>
          <Badge className={statusColors[trackingData.status] || "bg-muted"}>
            {trackingData.status.replace("_", " ")}
          </Badge>
        </div>

        {geofenceAlert && (
          <Card className="border-green-500/50 bg-green-500/10">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium text-green-400">{geofenceAlert}</p>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setGeofenceAlert(null)}>
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        <LiveTrackingMap
          originCity={trackingData.origin.city}
          destinationCity={trackingData.destination.city}
          progress={trackingData.progress}
          driverName={trackingData.transporter.name}
          vehiclePlate={trackingData.transporter.vehiclePlate}
          onGeofenceEnter={handleGeofenceEnter}
        />

        {/* ETA Card */}
        <Card className="border-border/50 bg-card/50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                <p className="font-semibold">{trackingData.eta}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Distance Covered</p>
              <p className="font-bold text-primary">
                {trackingData.distanceCovered} / {trackingData.distance}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Transporter Card */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Your Transporter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/20 text-primary text-lg">
                  {trackingData.transporter.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{trackingData.transporter.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{trackingData.transporter.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {trackingData.transporter.vehicleType} • {trackingData.transporter.vehiclePlate}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" asChild>
                <a href={`tel:${trackingData.transporter.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </a>
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tracking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {trackingEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {event.completed ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    {index < trackingEvents.length - 1 && (
                      <div className={`h-12 w-0.5 ${event.completed ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`font-medium ${event.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {event.status}
                    </p>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                      <span>•</span>
                      <span>{event.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 bg-transparent" asChild>
            <Link href="/dashboard/disputes">Report Issue</Link>
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirmDelivery}
            disabled={isConfirming || trackingData.status === "completed"}
          >
            <Camera className="mr-2 h-4 w-4" />
            {isConfirming ? "Confirming..." : trackingData.status === "completed" ? "Delivered ✓" : "Confirm Delivery"}
          </Button>
        </div>
      </div>
    </div>
  )
}
