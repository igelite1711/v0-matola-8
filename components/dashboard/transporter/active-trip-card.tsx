"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Phone, MapPin, AlertTriangle, CheckCircle, Camera, Truck } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { LiveTrackingMap } from "@/components/maps/live-tracking-map"
import { formatPrice } from "@/lib/matching-engine"

interface ActiveTripCardProps {
  shipmentId: string
  expanded?: boolean
}

type TripStatus =
  | "en_route_pickup"
  | "at_pickup"
  | "loading"
  | "in_transit"
  | "approaching"
  | "at_destination"
  | "unloading"
  | "completed"

const STATUS_FLOW: TripStatus[] = [
  "en_route_pickup",
  "at_pickup",
  "loading",
  "in_transit",
  "approaching",
  "at_destination",
  "unloading",
  "completed",
]

const STATUS_LABELS: Record<TripStatus, { en: string; ny: string }> = {
  en_route_pickup: { en: "En Route to Pickup", ny: "Pa njira kutenga" },
  at_pickup: { en: "Arrived at Pickup", ny: "Mwafika kutenga" },
  loading: { en: "Loading Cargo", ny: "Kuika katundu" },
  in_transit: { en: "In Transit", ny: "Pa ulendo" },
  approaching: { en: "Approaching Destination", ny: "Pafupi ndi kumene mukupita" },
  at_destination: { en: "At Destination", ny: "Mwafika" },
  unloading: { en: "Unloading", ny: "Kutsitsa katundu" },
  completed: { en: "Trip Completed", ny: "Ulendo wathera" },
}

export function ActiveTripCard({ shipmentId, expanded = false }: ActiveTripCardProps) {
  const router = useRouter()
  const { shipments, updateShipment, showToast } = useApp()
  const [tripStatus, setTripStatus] = useState<TripStatus>("in_transit")
  const [progress, setProgress] = useState(45)
  const [isUpdating, setIsUpdating] = useState(false)

  const shipment = shipments.find((s) => s.id === shipmentId)

  // Simulate progress updates
  useEffect(() => {
    if (tripStatus === "completed" || tripStatus === "at_pickup" || tripStatus === "at_destination") return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (tripStatus === "in_transit" && prev < 85) {
          return prev + 0.5
        }
        return prev
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [tripStatus])

  // Auto-detect approaching based on progress
  useEffect(() => {
    if (progress >= 85 && tripStatus === "in_transit") {
      setTripStatus("approaching")
      showToast("Approaching destination - prepare for delivery", "info")
    }
  }, [progress, tripStatus, showToast])

  const handleStatusUpdate = async (newStatus: TripStatus) => {
    setIsUpdating(true)
    await new Promise((r) => setTimeout(r, 1000))

    setTripStatus(newStatus)

    // Update shipment status based on trip status
    const shipmentStatusMap: Record<TripStatus, string> = {
      en_route_pickup: "confirmed",
      at_pickup: "confirmed",
      loading: "picked_up",
      in_transit: "in_transit",
      approaching: "in_transit",
      at_destination: "delivered",
      unloading: "delivered",
      completed: "completed",
    }

    if (shipment) {
      updateShipment(shipmentId, { status: shipmentStatusMap[newStatus] as any })
    }

    // Update progress based on status
    const progressMap: Record<TripStatus, number> = {
      en_route_pickup: 5,
      at_pickup: 10,
      loading: 15,
      in_transit: 50,
      approaching: 85,
      at_destination: 95,
      unloading: 98,
      completed: 100,
    }
    setProgress(progressMap[newStatus])

    showToast(`Status updated: ${STATUS_LABELS[newStatus].en}`, "success")
    setIsUpdating(false)
  }

  const getNextAction = (): { label: string; status: TripStatus } | null => {
    const currentIndex = STATUS_FLOW.indexOf(tripStatus)
    if (currentIndex >= STATUS_FLOW.length - 1) return null
    const nextStatus = STATUS_FLOW[currentIndex + 1]

    const actionLabels: Record<TripStatus, string> = {
      en_route_pickup: "Start Trip",
      at_pickup: "Confirm Arrival",
      loading: "Start Loading",
      in_transit: "Depart",
      approaching: "Continue",
      at_destination: "Confirm Arrival",
      unloading: "Start Unloading",
      completed: "Complete Delivery",
    }

    return { label: actionLabels[nextStatus], status: nextStatus }
  }

  const handleGeofenceEnter = (zone: "pickup" | "dropoff") => {
    if (zone === "pickup" && tripStatus === "en_route_pickup") {
      setTripStatus("at_pickup")
      setProgress(10)
      showToast("You've arrived at pickup location!", "success")
    } else if (zone === "dropoff" && (tripStatus === "in_transit" || tripStatus === "approaching")) {
      setTripStatus("at_destination")
      setProgress(95)
      showToast("You've arrived at destination!", "success")
    }
  }

  if (!shipment) return null

  const nextAction = getNextAction()

  return (
    <Card className="border-primary/30 bg-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Active Trip</CardTitle>
              <p className="text-xs text-muted-foreground">#{shipmentId.toUpperCase()}</p>
            </div>
          </div>
          <Badge
            className={
              tripStatus === "completed"
                ? "bg-green-500/20 text-green-400"
                : tripStatus.includes("at_")
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-primary/20 text-primary"
            }
          >
            {STATUS_LABELS[tripStatus].en}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Live Map */}
        {expanded && (
          <LiveTrackingMap
            originCity={shipment.origin.city}
            destinationCity={shipment.destination.city}
            progress={progress}
            onGeofenceEnter={handleGeofenceEnter}
          />
        )}

        {/* Route Info */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-green-500" />
          <span className="font-medium">{shipment.origin.city}</span>
          <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
          <MapPin className="h-4 w-4 text-red-500" />
          <span className="font-medium">{shipment.destination.city}</span>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Earnings</p>
            <p className="font-bold text-primary">{formatPrice(shipment.price)}</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="font-medium">{Math.round((1 - progress / 100) * 310)} km left</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground">ETA</p>
            <p className="font-medium">~2h 15m</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
            <a href="tel:+265999123456">
              <Phone className="mr-2 h-4 w-4" />
              Call Shipper
            </a>
          </Button>

          {nextAction && tripStatus !== "completed" ? (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleStatusUpdate(nextAction.status)}
              disabled={isUpdating}
            >
              {tripStatus === "at_destination" || tripStatus === "unloading" ? (
                <Camera className="mr-2 h-4 w-4" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {isUpdating ? "Updating..." : nextAction.label}
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => router.push("/dashboard/transporter/earnings")}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              View Earnings
            </Button>
          )}
        </div>

        {/* Panic Button */}
        {tripStatus !== "completed" && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
            onClick={() => {
              showToast("Emergency alert sent to support team", "info")
            }}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Emergency / Report Issue
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
