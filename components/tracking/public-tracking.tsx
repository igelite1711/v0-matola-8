"use client"

import { useState } from "react"
import Link from "next/link"
import { Truck, CheckCircle, Circle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

interface PublicTrackingProps {
  shipmentId?: string
}

export function PublicTracking({ shipmentId }: PublicTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState(shipmentId || "")
  const [isTracking, setIsTracking] = useState(!!shipmentId)

  // Mock shipment data
  const shipment = {
    id: trackingNumber || "S1",
    origin: "Lilongwe",
    destination: "Blantyre",
    status: "in_transit",
    progress: 60,
    eta: "Today, 4:30 PM",
    transporter: "Grace P.",
    vehiclePlate: "LL 7832",
  }

  const events = [
    { status: "Picked Up", time: "09:30 AM", location: "Lilongwe", done: true },
    { status: "In Transit", time: "12:45 PM", location: "Dedza", done: true },
    { status: "Arriving", time: "~4:30 PM", location: "Blantyre", done: false },
  ]

  const handleTrack = () => {
    if (trackingNumber) {
      setIsTracking(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Matola</span>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Search */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Track Your Shipment</h1>
          <p className="mt-2 text-muted-foreground">Enter your tracking number to see real-time updates</p>
          <div className="mx-auto mt-6 flex max-w-md gap-2">
            <Input
              placeholder="Enter tracking number (e.g., S1)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
              className="text-center"
            />
            <Button onClick={handleTrack}>Track</Button>
          </div>
        </div>

        {isTracking && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="overflow-hidden border-border/50 bg-card/50">
              <div className="bg-primary/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="text-xl font-bold">#{shipment.id.toUpperCase()}</p>
                  </div>
                  <div className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-400">
                    In Transit
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                {/* Route */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <div className="h-8 w-0.5 bg-border" />
                    <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{shipment.origin}</p>
                        <p className="text-sm text-muted-foreground">Origin</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{shipment.destination}</p>
                        <p className="text-sm text-muted-foreground">Destination</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <Progress value={shipment.progress} className="h-2" />
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">{shipment.progress}% complete</span>
                    <span className="font-medium text-primary">ETA: {shipment.eta}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transporter */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{shipment.transporter}</p>
                    <p className="text-sm text-muted-foreground">{shipment.vehiclePlate}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <h3 className="mb-4 font-semibold">Tracking Updates</h3>
                <div className="space-y-0">
                  {events.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {event.done ? (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        {index < events.length - 1 && (
                          <div className={`h-10 w-0.5 ${event.done ? "bg-primary" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className={`font-medium ${event.done ? "" : "text-muted-foreground"}`}>{event.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.location} • {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* USSD Info */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Track via USSD (no internet needed)</p>
                <p className="mt-1 text-lg font-bold text-primary">*384*123#{shipment.id}#</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
