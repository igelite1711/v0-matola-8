"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Package,
  Clock,
  Star,
  Truck,
  ArrowRight,
  CheckCircle,
  X,
  Bell,
  Route,
  Percent,
  Wallet,
  TrendingUp,
} from "lucide-react"
import { formatPrice } from "@/lib/matching-engine"
import type { Shipment } from "@/lib/types"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"
import { PLATFORM_COMMISSION_RATE } from "@/lib/pricing-engine"

interface LoadOfferModalProps {
  shipment: Shipment | null
  matchScore: number
  isBackhaul: boolean
  open: boolean
  onClose: () => void
  onAccept: (shipmentId: string) => void
  onDecline: (shipmentId: string) => void
  expiresIn?: number
  netEarnings?: number
  platformFee?: number
  surgeMultiplier?: number
}

export function LoadOfferModal({
  shipment,
  matchScore,
  isBackhaul,
  open,
  onClose,
  onAccept,
  onDecline,
  expiresIn = 60,
  netEarnings,
  platformFee,
  surgeMultiplier,
}: LoadOfferModalProps) {
  const router = useRouter()
  const { showToast } = useApp()
  const { language } = useLanguage()
  const [timeLeft, setTimeLeft] = useState(expiresIn)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  const grossPrice = shipment?.price || 0
  const calculatedPlatformFee = platformFee ?? Math.round(grossPrice * PLATFORM_COMMISSION_RATE)
  const calculatedNetEarnings = netEarnings ?? grossPrice - calculatedPlatformFee

  useEffect(() => {
    if (!open) {
      setTimeLeft(expiresIn)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          showToast(language === "en" ? "Load offer expired" : "Katundu watha nthawi", "info")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, expiresIn, onClose, showToast, language])

  const handleAccept = async () => {
    if (!shipment) return
    setIsAccepting(true)
    await new Promise((r) => setTimeout(r, 1000))
    onAccept(shipment.id)
    setIsAccepting(false)
    showToast(language === "en" ? "Load accepted! Check your active jobs." : "Katundu walandiridwa!", "success")
    router.push("/dashboard/transporter/my-jobs")
  }

  const handleDecline = async () => {
    if (!shipment) return
    setIsDeclining(true)
    await new Promise((r) => setTimeout(r, 500))
    onDecline(shipment.id)
    setIsDeclining(false)
  }

  if (!shipment) return null

  const getCargoName = (cargoType: string) => {
    const names: Record<string, { en: string; ny: string }> = {
      maize: { en: "Maize", ny: "Chimanga" },
      tobacco: { en: "Tobacco", ny: "Fodya" },
      tea: { en: "Tea", ny: "Tiyi" },
      sugar: { en: "Sugar", ny: "Shuga" },
      fertilizer: { en: "Fertilizer", ny: "Feteleza" },
      cement: { en: "Cement", ny: "Simenti" },
      agricultural: { en: "Agricultural", ny: "Zaulimi" },
      construction: { en: "Construction", ny: "Zomangira" },
      general: { en: "General Cargo", ny: "Katundu Wamba" },
      perishable: { en: "Perishable", ny: "Zoola Msanga" },
    }
    return names[cargoType]?.[language] || cargoType
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 animate-pulse">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{language === "en" ? "New Load Available!" : "Katundu Watsopano!"}</DialogTitle>
              <DialogDescription>
                {matchScore}% {language === "en" ? "match for your vehicle" : "ofanana ndi galimoto yanu"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timer */}
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-amber-500" />
            <div className="flex-1">
              <Progress value={(timeLeft / expiresIn) * 100} className="h-2" />
            </div>
            <span className={`text-sm font-medium ${timeLeft <= 10 ? "text-destructive" : "text-muted-foreground"}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Route Card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div className="h-8 w-0.5 bg-border" />
                  <MapPin className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <div>
                    <p className="font-semibold">{shipment.origin.city}</p>
                    <p className="text-xs text-muted-foreground">{shipment.origin.landmark}</p>
                  </div>
                  <div className="my-1">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">{shipment.destination.city}</p>
                    <p className="text-xs text-muted-foreground">{shipment.destination.landmark}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === "en" ? "Gross Price" : "Mtengo Wonse"}
                </span>
                <span className="font-medium">{formatPrice(grossPrice)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {language === "en" ? "Platform Fee" : "Ndalama za Platform"} (5%)
                </span>
                <span className="text-destructive">-{formatPrice(calculatedPlatformFee)}</span>
              </div>

              {isBackhaul && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Route className="h-3 w-3" />
                    {language === "en" ? "Backhaul Savings" : "Kupulumutsa Kwabwerera"}
                  </span>
                  <Badge className="bg-green-500/20 text-green-400">-40%</Badge>
                </div>
              )}

              {surgeMultiplier && surgeMultiplier > 1 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {language === "en" ? "Seasonal Surge" : "Nyengo Yapamwamba"}
                  </span>
                  <Badge className="bg-amber-500/20 text-amber-400">+{Math.round((surgeMultiplier - 1) * 100)}%</Badge>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-500" />
                  {language === "en" ? "Your Earnings" : "Ndalama Zanu"}
                </span>
                <span className="text-2xl font-bold text-green-500">{formatPrice(calculatedNetEarnings)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cargo Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{language === "en" ? "Cargo" : "Katundu"}</p>
                <p className="font-medium text-sm">{getCargoName(shipment.cargoType)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <Truck className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{language === "en" ? "Weight" : "Kulemera"}</p>
                <p className="font-medium text-sm">{shipment.weight.toLocaleString()} kg</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{language === "en" ? "Pickup" : "Kutenga"}</p>
                <p className="font-medium text-sm">{shipment.pickupDate.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
              <Star className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Shipper Rating" : "Mayiko a Otumiza"}
                </p>
                <p className="font-medium text-sm">4.7 / 5.0</p>
              </div>
            </div>
          </div>

          {/* Match Reason */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <Route className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-400">
              {isBackhaul
                ? language === "en"
                  ? "This load is on your return route - earn more, drive less!"
                  : "Katundu uyu ali pa njira yobwerera - pezani zambiri!"
                : language === "en"
                  ? `Matched for your ${shipment.requiredVehicleType} capacity`
                  : `Ofanana ndi galimoto yanu ya ${shipment.requiredVehicleType}`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleDecline}
              disabled={isDeclining || isAccepting}
            >
              <X className="mr-2 h-4 w-4" />
              {isDeclining
                ? language === "en"
                  ? "Declining..."
                  : "Kukana..."
                : language === "en"
                  ? "Decline"
                  : "Kanani"}
            </Button>
            <Button className="flex-1" onClick={handleAccept} disabled={isAccepting || isDeclining}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {isAccepting
                ? language === "en"
                  ? "Accepting..."
                  : "Kulandira..."
                : language === "en"
                  ? "Accept Load"
                  : "Landirani"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
