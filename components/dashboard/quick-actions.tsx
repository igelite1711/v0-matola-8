"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Package, Truck, MapPin, ArrowRight, Loader2, Check, Phone, MessageCircle, Search } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"
import { calculateEstimatedPrice } from "@/lib/malawi-data"

const QUICK_LOCATIONS = [
  { value: "Lilongwe", label: "Lilongwe" },
  { value: "Blantyre", label: "Blantyre" },
  { value: "Mzuzu", label: "Mzuzu" },
  { value: "Zomba", label: "Zomba" },
  { value: "Kasungu", label: "Kasungu" },
  { value: "Mangochi", label: "Mangochi" },
]

const QUICK_CARGO = [
  { value: "maize", label: "Chimanga", labelEn: "Maize" },
  { value: "fertilizer", label: "Feteleza", labelEn: "Fertilizer" },
  { value: "cement", label: "Simenti", labelEn: "Cement" },
  { value: "tobacco", label: "Fodya", labelEn: "Tobacco" },
  { value: "general", label: "Zina", labelEn: "Other" },
]

interface QuickPostLoadProps {
  open: boolean
  onClose: () => void
}

export function QuickPostLoad({ open, onClose }: QuickPostLoadProps) {
  const router = useRouter()
  const { addShipment, showNotification, user } = useApp()
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    cargo: "",
    weight: "",
  })

  const estimatedPrice =
    form.origin && form.destination && form.weight
      ? calculateEstimatedPrice(
          form.origin,
          form.destination,
          Number.parseInt(form.weight) || 0,
          (form.cargo || "general") as any,
        )
      : 0

  const canSubmit = form.origin && form.destination && form.cargo && form.weight && form.origin !== form.destination

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsLoading(true)

    await new Promise((r) => setTimeout(r, 1000))

    const newShipment = {
      id: `MAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      shipperId: user?.id || "user-1",
      shipperName: user?.name || "Unknown",
      origin: { city: form.origin, coordinates: { lat: 0, lng: 0 } },
      destination: { city: form.destination, coordinates: { lat: 0, lng: 0 } },
      cargoType: form.cargo as any,
      cargoDescription: QUICK_CARGO.find((c) => c.value === form.cargo)?.labelEn || "General",
      weight: Number.parseInt(form.weight),
      price: estimatedPrice,
      status: "posted" as const,
      pickupDate: new Date(),
      createdAt: new Date(),
      isBackhaul: false,
    }

    addShipment(newShipment)
    showNotification(
      language === "en"
        ? "Load posted! Transporters will be notified."
        : "Katundu waposidwa! Oyendetsa adzadziwitsidwa.",
      "success",
    )
    setIsLoading(false)
    onClose()
    router.push("/dashboard/shipments")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {language === "en" ? "Post a Load" : "Ikani Katundu"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Route Selection - Single Row */}
          <div className="flex items-center gap-2">
            <Select value={form.origin} onValueChange={(v) => setForm((f) => ({ ...f, origin: v }))}>
              <SelectTrigger className="flex-1 h-12">
                <SelectValue placeholder={language === "en" ? "From" : "Kuchokera"} />
              </SelectTrigger>
              <SelectContent>
                {QUICK_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

            <Select value={form.destination} onValueChange={(v) => setForm((f) => ({ ...f, destination: v }))}>
              <SelectTrigger className="flex-1 h-12">
                <SelectValue placeholder={language === "en" ? "To" : "Kupita"} />
              </SelectTrigger>
              <SelectContent>
                {QUICK_LOCATIONS.filter((l) => l.value !== form.origin).map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cargo Type - Quick Buttons */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {language === "en" ? "What are you sending?" : "Ndi chiyani?"}
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_CARGO.map((cargo) => (
                <Button
                  key={cargo.value}
                  type="button"
                  variant={form.cargo === cargo.value ? "default" : "outline"}
                  size="sm"
                  className={form.cargo === cargo.value ? "" : "bg-transparent"}
                  onClick={() => setForm((f) => ({ ...f, cargo: cargo.value }))}
                >
                  {cargo.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Weight - Simple Input */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {language === "en" ? "How much? (kg)" : "Kulemera kwake (kg)"}
            </p>
            <div className="flex gap-2">
              {["500", "1000", "2000", "5000"].map((w) => (
                <Button
                  key={w}
                  type="button"
                  variant={form.weight === w ? "default" : "outline"}
                  size="sm"
                  className={form.weight === w ? "" : "bg-transparent"}
                  onClick={() => setForm((f) => ({ ...f, weight: w }))}
                >
                  {Number.parseInt(w).toLocaleString()}
                </Button>
              ))}
              <Input
                type="number"
                placeholder={language === "en" ? "Other" : "Zina"}
                value={!["500", "1000", "2000", "5000"].includes(form.weight) ? form.weight : ""}
                onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                className="w-24 h-9"
              />
            </div>
          </div>

          {/* Price Preview */}
          {estimatedPrice > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm">{language === "en" ? "Estimated Price" : "Mtengo Woyembekezeka"}</span>
                <span className="text-xl font-bold text-primary">MK {estimatedPrice.toLocaleString()}</span>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button onClick={handleSubmit} disabled={!canSubmit || isLoading} className="w-full h-12 text-base">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === "en" ? "Posting..." : "Kuika..."}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {language === "en" ? "Post Load" : "Ikani Katundu"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface QuickTrackProps {
  open: boolean
  onClose: () => void
}

export function QuickTrack({ open, onClose }: QuickTrackProps) {
  const router = useRouter()
  const { language } = useLanguage()
  const [trackingId, setTrackingId] = useState("")

  const handleTrack = () => {
    if (trackingId.trim()) {
      router.push(`/track/${trackingId.trim().toUpperCase()}`)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {language === "en" ? "Track Shipment" : "Tsatani Katundu"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Input
            placeholder="MAT-XXXXXX"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            className="h-12 text-center text-lg font-mono"
            autoFocus
          />

          <Button onClick={handleTrack} disabled={!trackingId.trim()} className="w-full h-12">
            <Search className="mr-2 h-4 w-4" />
            {language === "en" ? "Track" : "Tsatani"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function QuickActionsBar({ userType }: { userType: "shipper" | "transporter" }) {
  const { language } = useLanguage()
  const router = useRouter()
  const [showPostLoad, setShowPostLoad] = useState(false)
  const [showTrack, setShowTrack] = useState(false)

  if (userType === "shipper") {
    return (
      <>
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1 h-14 text-base gap-2" onClick={() => setShowPostLoad(true)}>
                <Package className="h-5 w-5" />
                {language === "en" ? "Post a Load" : "Ikani Katundu"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-14 text-base gap-2 bg-transparent"
                onClick={() => setShowTrack(true)}
              >
                <MapPin className="h-5 w-5" />
                {language === "en" ? "Track Shipment" : "Tsatani"}
              </Button>
            </div>

            {/* Alternative access hint */}
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>USSD: *555#</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                <span>WhatsApp: 0999123456</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <QuickPostLoad open={showPostLoad} onClose={() => setShowPostLoad(false)} />
        <QuickTrack open={showTrack} onClose={() => setShowTrack(false)} />
      </>
    )
  }

  // Transporter view
  return (
    <Card className="border-chart-3/30 bg-gradient-to-r from-chart-3/10 to-chart-3/5">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="flex-1 h-14 text-base gap-2 bg-chart-3 hover:bg-chart-3/90"
            onClick={() => router.push("/dashboard/transporter/find-loads")}
          >
            <Search className="h-5 w-5" />
            {language === "en" ? "Find Loads" : "Pezani Katundu"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14 text-base gap-2 bg-transparent"
            onClick={() => router.push("/dashboard/transporter/my-jobs")}
          >
            <Truck className="h-5 w-5" />
            {language === "en" ? "My Jobs" : "Ntchito Zanga"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
