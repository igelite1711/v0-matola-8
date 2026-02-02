"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Truck,
  Share2,
  ChevronLeft,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"
import { getTrustLevel } from "@/lib/trust/trust-system"
import { formatMWK } from "@/lib/payments/mobile-money"
import { CardSkeleton } from "./ui/loading-skeleton"

interface Checkpoint {
  id: string
  name: string
  nameNy: string
  status: "passed" | "current" | "upcoming"
  time?: string
}

interface LiveTrackingProps {
  shipmentId: string
  onClose?: () => void
}

const MOCK_SHIPMENT = {
  id: "SH001",
  origin: "Lilongwe",
  destination: "Blantyre",
  status: "in_transit",
  cargo: "Farm Produce",
  weight: 2500,
  price: 85000,
  transporter: {
    name: "John Banda",
    phone: "0999123456",
    rating: 4.8,
    trustScore: 85,
    vehicleReg: "BT 4521",
    vehicleType: "10-ton Truck",
  },
}

const CHECKPOINTS: Checkpoint[] = [
  { id: "1", name: "Lilongwe (Start)", nameNy: "Lilongwe (Chiyambi)", status: "passed", time: "9:30 AM" },
  { id: "2", name: "Dedza", nameNy: "Dedza", status: "passed", time: "11:15 AM" },
  { id: "3", name: "Ntcheu", nameNy: "Ntcheu", status: "current", time: "Now" },
  { id: "4", name: "Balaka", nameNy: "Balaka", status: "upcoming" },
  { id: "5", name: "Blantyre (End)", nameNy: "Blantyre (Mapeto)", status: "upcoming" },
]

export function LiveTracking({ shipmentId, onClose }: LiveTrackingProps) {
  const { language } = useTranslation()
  const router = useRouter()
  const [progress, setProgress] = useState(65)
  const [eta, setEta] = useState("2:45 PM")
  const [isLoading, setIsLoading] = useState(true)
  const [shipment, setShipment] = useState<typeof MOCK_SHIPMENT | null>(null)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setShipment(MOCK_SHIPMENT)
      setIsLoading(false)
    }
    loadData()
  }, [shipmentId])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 0.5, 100))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleShare = async () => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Shipment ${shipmentId} Tracking`,
          text: `Track my shipment from ${shipment?.origin} to ${shipment?.destination}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert(language === "ny" ? "Ulalo wakopeka!" : "Link copied!")
      }
    } catch (err) {
      console.error("Share failed:", err)
    } finally {
      setIsSharing(false)
    }
  }

  const handleCall = () => {
    if (shipment?.transporter.phone) {
      window.location.href = `tel:${shipment.transporter.phone}`
    }
  }

  const handleMessage = () => {
    if (shipment?.transporter.phone) {
      window.location.href = `sms:${shipment.transporter.phone}`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="h-64 bg-secondary animate-pulse" />
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{language === "ny" ? "Palibe zambiri" : "Shipment not found"}</p>
          <Button onClick={() => router.back()} className="mt-4">
            {language === "ny" ? "Bwerera" : "Go Back"}
          </Button>
        </div>
      </div>
    )
  }

  const trustLevel = getTrustLevel(shipment.transporter.trustScore)

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative h-64 bg-secondary">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary mx-auto">
                <Truck className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {language === "ny" ? "Malo a galimoto" : "Vehicle location"}
            </p>
            <p className="text-xs text-muted-foreground">Near Ntcheu, M1 Highway</p>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{shipment.origin}</span>
            <span>{shipment.destination}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success via-primary to-primary rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button
          onClick={handleShare}
          disabled={isSharing}
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur disabled:opacity-50"
        >
          {isSharing ? (
            <Loader2 className="h-5 w-5 text-foreground animate-spin" />
          ) : (
            <Share2 className="h-5 w-5 text-foreground" />
          )}
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {language === "ny" ? "Nthawi Yofika" : "Estimated Arrival"}
              </p>
              <p className="text-3xl font-bold text-foreground">{eta}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{language === "ny" ? "Kutsala" : "Remaining"}</p>
              <p className="text-xl font-semibold text-primary">112 km</p>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <span className="text-lg font-bold text-primary">
                  {shipment.transporter.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{shipment.transporter.name}</p>
                <div className="flex items-center gap-2">
                  <Shield
                    className={cn(
                      "h-3.5 w-3.5",
                      trustLevel.level === "highly_trusted" ? "text-success" : "text-primary",
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    {language === "ny" ? trustLevel.labelNy : trustLevel.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handleMessage}
                className="h-10 w-10 rounded-full border-border bg-transparent"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button size="icon" onClick={handleCall} className="h-10 w-10 rounded-full bg-primary">
                <Phone className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-secondary/50 p-3">
              <p className="text-muted-foreground">{language === "ny" ? "Galimoto" : "Vehicle"}</p>
              <p className="font-medium text-foreground">{shipment.transporter.vehicleReg}</p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3">
              <p className="text-muted-foreground">{language === "ny" ? "Mtundu" : "Type"}</p>
              <p className="font-medium text-foreground">{shipment.transporter.vehicleType}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-foreground mb-4">{language === "ny" ? "Ulendo" : "Journey Progress"}</h3>
          <div className="space-y-0">
            {CHECKPOINTS.map((cp, index) => (
              <div key={cp.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      cp.status === "passed"
                        ? "bg-success text-white"
                        : cp.status === "current"
                          ? "bg-primary text-primary-foreground animate-pulse"
                          : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {cp.status === "passed" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : cp.status === "current" ? (
                      <Navigation className="h-4 w-4" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                  </div>
                  {index < CHECKPOINTS.length - 1 && (
                    <div className={cn("w-0.5 h-10", cp.status === "passed" ? "bg-success" : "bg-border")} />
                  )}
                </div>

                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between">
                    <p className={cn("font-medium", cp.status === "current" ? "text-primary" : "text-foreground")}>
                      {language === "ny" ? cp.nameNy : cp.name}
                    </p>
                    {cp.time && (
                      <span
                        className={cn(
                          "text-sm",
                          cp.status === "current" ? "text-primary font-medium" : "text-muted-foreground",
                        )}
                      >
                        {cp.time}
                      </span>
                    )}
                  </div>
                  {cp.status === "current" && (
                    <p className="text-sm text-success mt-1">
                      {language === "ny" ? "Galimoto ili pano" : "Vehicle is here now"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-4">
          <h3 className="font-semibold text-foreground mb-3">
            {language === "ny" ? "Za Katundu" : "Shipment Details"}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">{language === "ny" ? "Katundu" : "Cargo"}</p>
              <p className="font-medium text-foreground">{shipment.cargo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{language === "ny" ? "Kulemera" : "Weight"}</p>
              <p className="font-medium text-foreground">{shipment.weight.toLocaleString()} kg</p>
            </div>
            <div>
              <p className="text-muted-foreground">{language === "ny" ? "Mtengo" : "Price"}</p>
              <p className="font-medium text-primary">{formatMWK(shipment.price)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{language === "ny" ? "Nambala" : "Reference"}</p>
              <p className="font-medium text-foreground">{shipment.id}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground text-sm">{language === "ny" ? "Chitetezo" : "Safety Notice"}</p>
              <p className="text-sm text-muted-foreground">
                {language === "ny"
                  ? "Ngati muli ndi nkhawa, dinani SOS nthawi iliyonse."
                  : "If you have concerns, press SOS anytime for immediate assistance."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
