"use client"

import { useState } from "react"
import {
  X,
  MapPin,
  Package,
  Loader2,
  CheckCircle2,
  Star,
  Shield,
  Phone,
  MessageCircle,
  Navigation,
  Clock,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"
import { getTrustLevel } from "@/lib/trust/trust-system"
import { formatMWK } from "@/lib/payments/mobile-money"

interface LoadDetailModalProps {
  isOpen: boolean
  onClose: () => void
  load: {
    id: string
    origin: string
    destination: string
    cargo: string
    weight: number
    price: number
    distance: number
    shipper: { name: string; rating: number; trustScore: number; verified: boolean }
    matchScore: number
    isBackhaul: boolean
    urgency: string
    postedAt: string
  } | null
  onAccept?: () => void
}

export function LoadDetailModal({ isOpen, onClose, load, onAccept }: LoadDetailModalProps) {
  const { language } = useTranslation()
  const [isAccepting, setIsAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  if (!isOpen || !load) return null

  const trustLevel = getTrustLevel(load.shipper.trustScore)

  const handleAccept = async () => {
    setIsAccepting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsAccepting(false)
    setAccepted(true)
  }

  const handleClose = () => {
    setAccepted(false)
    onClose()
  }

  const handleCall = () => {
    // In production, this would use the actual shipper phone
    window.location.href = "tel:+265999123456"
  }

  const handleMessage = () => {
    // In production, this would use the actual shipper phone
    window.location.href = "sms:+265999123456"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {load.isBackhaul && (
              <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                {language === "ny" ? "Kubwerera" : "Backhaul"}
              </span>
            )}
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-bold text-primary">{load.matchScore}% match</span>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {!accepted ? (
            <div className="space-y-6">
              {/* Route */}
              <div className="flex items-center justify-center gap-3 py-4">
                <div className="text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 mx-auto mb-2">
                    <MapPin className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-semibold text-foreground">{load.origin}</p>
                </div>
                <div className="flex items-center gap-2 px-4">
                  <div className="w-12 border-t-2 border-dashed border-border" />
                  <div className="flex flex-col items-center">
                    <Navigation className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground mt-1">{load.distance} km</span>
                  </div>
                  <div className="w-12 border-t-2 border-dashed border-border" />
                </div>
                <div className="text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mx-auto mb-2">
                    <MapPin className="h-6 w-6 text-destructive" />
                  </div>
                  <p className="font-semibold text-foreground">{load.destination}</p>
                </div>
              </div>

              {/* Price Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-success/10 border border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-1">{language === "ny" ? "Malipiro" : "Payment"}</p>
                <p className="text-3xl font-bold text-primary">{formatMWK(load.price)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatMWK(Math.round(load.price / load.distance))} / km
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{language === "ny" ? "Katundu" : "Cargo"}</span>
                  </div>
                  <p className="font-medium text-foreground">{load.cargo}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{language === "ny" ? "Kulemera" : "Weight"}</span>
                  </div>
                  <p className="font-medium text-foreground">{load.weight.toLocaleString()} kg</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{language === "ny" ? "Nthawi" : "When"}</span>
                  </div>
                  <p className="font-medium text-foreground capitalize">{load.urgency}</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{language === "ny" ? "Postiwa" : "Posted"}</span>
                  </div>
                  <p className="font-medium text-foreground">{load.postedAt}</p>
                </div>
              </div>

              {/* Shipper Info */}
              <div className="p-4 rounded-2xl bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-3">{language === "ny" ? "Wotumiza" : "Shipper"}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                      <span className="font-bold text-foreground">
                        {load.shipper.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{load.shipper.name}</p>
                        {load.shipper.verified && <Shield className="h-4 w-4 text-success" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span className="text-sm text-muted-foreground">{load.shipper.rating}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span
                          className={cn(
                            "text-sm",
                            trustLevel.level === "highly_trusted" ? "text-success" : "text-primary",
                          )}
                        >
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
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCall}
                      className="h-10 w-10 rounded-full border-border bg-transparent"
                    >
                      <Phone className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 h-14 rounded-xl bg-transparent border-border text-lg"
                >
                  {language === "ny" ? "Bwerera" : "Back"}
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="flex-1 h-14 bg-primary text-primary-foreground rounded-xl text-lg font-semibold"
                >
                  {isAccepting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {language === "ny" ? "Kuvomera..." : "Accepting..."}
                    </>
                  ) : language === "ny" ? (
                    "Vomerani"
                  ) : (
                    "Accept Load"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                {language === "ny" ? "Mwavomera!" : "Load Accepted!"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === "ny"
                  ? "Wotumiza adzalumikizana nanu posachedwa."
                  : "The shipper will contact you shortly."}
              </p>

              <div className="p-4 rounded-2xl bg-card border border-border mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">{language === "ny" ? "Ulendo" : "Trip"}</span>
                  <span className="font-medium text-foreground">
                    {load.origin} → {load.destination}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{language === "ny" ? "Malipiro" : "Payment"}</span>
                  <span className="font-bold text-primary">{formatMWK(load.price)}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  handleClose()
                  onAccept?.()
                }}
                className="w-full h-14 bg-primary text-primary-foreground rounded-xl text-lg"
              >
                {language === "ny" ? "Onani Ntchito" : "View My Jobs"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
