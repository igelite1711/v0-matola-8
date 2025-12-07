"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Package, Truck, Clock } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"

export function TrackingSearch() {
  const [trackingId, setTrackingId] = useState("")
  const router = useRouter()
  const { shipments, showToast } = useApp()
  const { language } = useLanguage()

  const handleTrack = () => {
    const shipment = shipments.find(
      (s) => s.id.toLowerCase() === trackingId.toLowerCase() || s.id.toLowerCase().includes(trackingId.toLowerCase()),
    )

    if (shipment) {
      router.push(`/dashboard/tracking/${shipment.id}`)
    } else {
      showToast(language === "en" ? "Shipment not found" : "Katundu sanapezeke", "error")
    }
  }

  // Recent shipments that can be tracked
  const trackableShipments = shipments
    .filter((s) => ["in_transit", "picked_up", "at_checkpoint"].includes(s.status))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {language === "en" ? "Track Shipment" : "Tsatani Katundu"}
        </h2>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Enter your tracking ID to see real-time location"
            : "Lowetsani ID yanu kuti muone malo enieni"}
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {language === "en" ? "Enter Tracking ID" : "Lowetsani Tracking ID"}
          </CardTitle>
          <CardDescription>
            {language === "en"
              ? "Your tracking ID was sent via SMS when the shipment was created"
              : "Tracking ID yanu inatumizidwa pa SMS pamene katundu anapangidwa"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="tracking-id" className="sr-only">
                Tracking ID
              </Label>
              <Input
                id="tracking-id"
                placeholder="e.g., S1, MAT-7823"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="h-12 text-lg"
              />
            </div>
            <Button onClick={handleTrack} className="h-12 px-6 gap-2" disabled={!trackingId.trim()}>
              <MapPin className="h-4 w-4" />
              {language === "en" ? "Track" : "Tsatani"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {trackableShipments.length > 0 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg">{language === "en" ? "Active Shipments" : "Katundu Akuyenda"}</CardTitle>
            <CardDescription>
              {language === "en" ? "Click to track your active shipments" : "Dinani kuti mutsate katundu wanu"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {trackableShipments.map((shipment) => (
              <button
                key={shipment.id}
                onClick={() => router.push(`/dashboard/tracking/${shipment.id}`)}
                className="w-full flex items-center gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{shipment.id.toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.origin.city} → {shipment.destination.city}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>{language === "en" ? "In Transit" : "Pa Njira"}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick tips */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">
              {language === "en" ? "Tracking Updates" : "Zosintha za Tracking"}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "en"
                ? "Location updates every 5 minutes. You'll receive SMS alerts at major checkpoints."
                : "Malo amasinthidwa mphindi 5 iliyonse. Mudzalandira SMS pa malo akuluakulu."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
