"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { useApp } from "@/contexts/app-context"
import { LoadOfferModal } from "./load-offer-modal"
import { DriverStatusBar } from "./driver-status-bar"
import { ActiveTripCard } from "./active-trip-card"
import { PostTripRating } from "@/components/dashboard/ratings/post-trip-rating"
import { getSmartRecommendations } from "@/lib/smart-matching"
import { formatPrice } from "@/lib/matching-engine"
import { Truck, Package, TrendingUp, Star, MapPin, ArrowRight, Fuel, ChevronRight, Zap } from "lucide-react"
import type { Transporter } from "@/lib/types"

export function TransporterOverview() {
  const { language } = useLanguage()
  const router = useRouter()
  const { shipments, user, isDriverOnline, driverCapacity, pendingLoadOffer, acceptLoadOffer, declineLoadOffer } =
    useApp()

  const [showRatingModal, setShowRatingModal] = useState(false)
  const [completedTripForRating, setCompletedTripForRating] = useState<{
    id: string
    recipientId: string
    recipientName: string
    route: string
  } | null>(null)

  const activeJobs = shipments.filter((s) => ["confirmed", "picked_up", "in_transit"].includes(s.status))

  const recentlyCompleted = shipments.filter(
    (s) => s.status === "delivered" && new Date(s.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
  )

  const mockTransporter: Transporter = {
    id: user?.id || "t1",
    role: "transporter",
    name: user?.name || "Driver",
    phone: user?.phone || "",
    rating: user?.rating || 4.5,
    totalRatings: 50,
    verified: user?.verified || true,
    verificationLevel: "rtoa",
    preferredLanguage: "en",
    createdAt: new Date(),
    vehicleType: (user?.vehicleType as any) || "medium_truck",
    vehiclePlate: "BT 4567",
    vehicleCapacity: user?.vehicleCapacity || 10000,
    currentLocation: user?.currentLocation as any,
    isAvailable: isDriverOnline && driverCapacity > 0,
    completedTrips: 45,
    onTimeRate: 0.95,
    preferredRoutes: ["Lilongwe-Blantyre", "Lilongwe-Mzuzu"],
  }

  const smartRecommendations = isDriverOnline ? getSmartRecommendations(mockTransporter, shipments, 5) : []

  const stats = [
    {
      label: { en: "Active Jobs", ny: "Ntchito Zikuyenda" },
      value: activeJobs.length.toString(),
      icon: Truck,
      color: "text-primary",
    },
    {
      label: { en: "Matching Loads", ny: "Katundu Wofanana" },
      value: smartRecommendations.length.toString(),
      icon: Package,
      color: "text-chart-2",
    },
    {
      label: { en: "This Month", ny: "Mwezi Uno" },
      value: "MK 485K",
      icon: TrendingUp,
      color: "text-chart-3",
    },
    {
      label: { en: "Rating", ny: "Mayiko" },
      value: user?.rating?.toFixed(1) || "4.8",
      icon: Star,
      color: "text-chart-4",
    },
  ]

  const fuelInfo = {
    diesel: { price: 2150, label: { en: "Diesel", ny: "Dizelo" } },
    estimatedCostPerKm: 450,
  }

  const handleTripCompleted = (shipmentId: string) => {
    const shipment = shipments.find((s) => s.id === shipmentId)
    if (shipment) {
      setCompletedTripForRating({
        id: shipment.id,
        recipientId: shipment.shipperId,
        recipientName: shipment.shipperName || "Shipper",
        route: `${shipment.origin.city} → ${shipment.destination.city}`,
      })
      setShowRatingModal(true)
    }
  }

  return (
    <div className="space-y-6">
      <LoadOfferModal
        shipment={pendingLoadOffer?.shipment || null}
        matchScore={pendingLoadOffer?.matchScore || 0}
        isBackhaul={pendingLoadOffer?.isBackhaul || false}
        open={!!pendingLoadOffer}
        onClose={() => declineLoadOffer(pendingLoadOffer?.shipment.id || "")}
        onAccept={acceptLoadOffer}
        onDecline={declineLoadOffer}
        netEarnings={pendingLoadOffer ? Math.round(pendingLoadOffer.shipment.price * 0.95) : undefined}
        platformFee={pendingLoadOffer ? Math.round(pendingLoadOffer.shipment.price * 0.05) : undefined}
      />

      {completedTripForRating && (
        <PostTripRating
          shipmentId={completedTripForRating.id}
          recipientId={completedTripForRating.recipientId}
          recipientName={completedTripForRating.recipientName}
          recipientRole="shipper"
          shipmentRoute={completedTripForRating.route}
          open={showRatingModal}
          onClose={() => {
            setShowRatingModal(false)
            setCompletedTripForRating(null)
          }}
          onSubmit={(rating) => {
            console.log("[v0] Rating submitted:", rating)
            setShowRatingModal(false)
            setCompletedTripForRating(null)
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {language === "en" ? `Hello, ${user?.name || "Driver"}` : `Moni, ${user?.name || "Woyendetsa"}`}
          </h2>
          <p className="text-muted-foreground">
            {language === "en" ? "Here's your dashboard overview" : "Nawa malingaliro anu"}
          </p>
        </div>
      </div>

      <DriverStatusBar />

      {recentlyCompleted.length > 0 && !showRatingModal && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                  <Star className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">
                    {language === "en" ? "Rate Your Recent Trip" : "Perekani Mayiko pa Ulendo Wanu"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {recentlyCompleted[0].origin.city} → {recentlyCompleted[0].destination.city}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleTripCompleted(recentlyCompleted[0].id)}>
                {language === "en" ? "Rate Now" : "Pereka Mayiko"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label.en} className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-secondary ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label[language]}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Trip */}
      {activeJobs.length > 0 && (
        <ActiveTripCard shipmentId={activeJobs[0].id} expanded onTripCompleted={handleTripCompleted} />
      )}

      {isDriverOnline && smartRecommendations.length > 0 && (
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">
                  {language === "en" ? "Recommended for You" : "Zokuyenerani"}
                </CardTitle>
              </div>
              <Badge variant="secondary">
                {smartRecommendations.length} {language === "en" ? "matches" : "ofanana"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "en"
                ? `Loads matching your ${mockTransporter.vehicleType} (${mockTransporter.vehicleCapacity.toLocaleString()}kg capacity)`
                : `Katundu wofanana ndi galimoto yanu`}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {smartRecommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.shipment.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/transporter/jobs/${rec.shipment.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center text-xs">
                    <MapPin className="h-3 w-3 text-green-500" />
                    <div className="h-4 w-0.5 bg-border" />
                    <MapPin className="h-3 w-3 text-red-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rec.shipment.origin.city}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{rec.shipment.destination.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{rec.shipment.weight.toLocaleString()}kg</span>
                      <span>•</span>
                      <span>{rec.matchScore}% match</span>
                      {rec.isBackhaul && (
                        <>
                          <span>•</span>
                          <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1">Backhaul</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatPrice(rec.pricing.netEarnings)}</p>
                  <p className="text-xs text-muted-foreground">
                    {language === "en" ? "net earnings" : "ndalama zenizeni"}
                  </p>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.push("/dashboard/transporter/available-jobs")}
            >
              {language === "en" ? "View All Available Loads" : "Onani Katundu Yonse"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fuel Info */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <Fuel className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium">{fuelInfo.diesel.label[language]}</p>
                <p className="text-sm text-muted-foreground">{language === "en" ? "Current price" : "Mtengo wano"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">MK {fuelInfo.diesel.price.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{language === "en" ? "per litre" : "pa lita"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
