"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package, Calendar, Loader2, ArrowRight, ArrowLeft, Check, Leaf } from "lucide-react"
import { malawiLocations, commonLandmarks, seasonalCargo, calculateEstimatedPrice } from "@/lib/malawi-data"
import { useApp } from "@/contexts/app-context"
import { useLanguage } from "@/contexts/language-context"

const locations = malawiLocations
  .filter((l) => l.type === "city" || l.type === "trading")
  .map((l) => ({
    name: l.name,
    district: l.district,
    region: l.region,
  }))

const cargoTypes = [
  { value: "maize", label: "Chimanga (Maize)", season: "Apr-Jun" },
  { value: "tobacco", label: "Fodya (Tobacco)", season: "Jan-Apr" },
  { value: "tea", label: "Tiyi (Tea)", season: "Sep-Nov" },
  { value: "fertilizer", label: "Feteleza (Fertilizer)", season: "Sep-Nov" },
  { value: "sugar", label: "Shuga (Sugar)", season: "Jul-Oct" },
  { value: "cement", label: "Simenti (Cement)", season: "All year" },
  { value: "agricultural", label: "Zaulimi Zina (Other Agricultural)", season: "Varies" },
  { value: "construction", label: "Zomangira (Construction Materials)", season: "All year" },
  { value: "general", label: "Katundu Wamba (General Goods)", season: "All year" },
  { value: "perishable", label: "Zoola Msanga (Perishables)", season: "All year" },
]

const paymentMethods = [
  { value: "airtel_money", label: "Airtel Money (*778#)" },
  { value: "tnm_mpamba", label: "TNM Mpamba (*712#)" },
  { value: "cash", label: "Ndalama Zenizeni (Cash)" },
  { value: "bank_transfer", label: "Bank Transfer" },
]

export function NewShipmentForm() {
  const router = useRouter()
  const { addShipment, showNotification, user } = useApp()
  const { language } = useLanguage()

  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    origin: "",
    originLandmark: "",
    destination: "",
    destLandmark: "",
    cargoType: "",
    weight: "",
    description: "",
    pickupDate: "",
    pickupTime: "",
    contactName: user?.name || "",
    contactPhone: user?.phone || "",
    paymentMethod: "",
  })

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const weightKg = Number.parseInt(formData.weight.replace(/\D/g, "") || "0")
    const cargoType = (formData.cargoType as keyof typeof seasonalCargo) || "general"
    const price = calculateEstimatedPrice(formData.origin, formData.destination, weightKg, cargoType)

    // Create a new shipment
    const newShipment = {
      id: `MAT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      shipperId: user?.id || "user-1",
      shipperName: formData.contactName || user?.name || "Unknown",
      origin: {
        city: formData.origin,
        landmark: formData.originLandmark || undefined,
        coordinates: { lat: -13.9626, lng: 33.7741 },
      },
      destination: {
        city: formData.destination,
        landmark: formData.destLandmark || undefined,
        coordinates: { lat: -15.7861, lng: 35.0058 },
      },
      cargoType: formData.cargoType as any,
      cargoDescription:
        formData.description || cargoTypes.find((c) => c.value === formData.cargoType)?.label || "General Cargo",
      weight: weightKg,
      price: price,
      status: "posted" as const,
      pickupDate: formData.pickupDate ? new Date(formData.pickupDate) : new Date(),
      createdAt: new Date(),
      isBackhaul: false,
    }

    addShipment(newShipment)
    showNotification(
      language === "en"
        ? "Shipment posted successfully! Transporters will be notified."
        : "Katundu waposidwa bwino! Oyendetsa adzadziwitsidwa.",
      "success",
    )
    setIsLoading(false)
    router.push("/dashboard/shipments")
  }

  const getEstimatedPrice = () => {
    if (!formData.origin || !formData.destination || !formData.weight) {
      return language === "en" ? "Enter details to see price" : "Lowetsani zambiri kuti mupeze mtengo"
    }
    const weightKg = Number.parseInt(formData.weight.replace(/\D/g, "") || "0")
    if (weightKg === 0) return language === "en" ? "Enter weight" : "Lowetsani kulemera"

    const cargoType = (formData.cargoType as keyof typeof seasonalCargo) || "general"
    const price = calculateEstimatedPrice(formData.origin, formData.destination, weightKg, cargoType)
    return `MK ${price.toLocaleString()}`
  }

  const getSeasonalInfo = () => {
    if (!formData.cargoType) return null
    const cargoInfo = cargoTypes.find((c) => c.value === formData.cargoType)
    const seasonData = seasonalCargo[formData.cargoType as keyof typeof seasonalCargo]
    const currentMonth = new Date().toLocaleString("en", { month: "long" })
    const isInSeason = seasonData?.peakMonths?.includes(currentMonth)

    return {
      season: cargoInfo?.season,
      isInSeason,
      multiplier: seasonData?.priceMultiplier || 1,
    }
  }

  const seasonalInfo = getSeasonalInfo()

  return (
    <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">
          {language === "en" ? "New Shipment" : "Tumizani Katundu"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === "en"
            ? "Enter your cargo details and we'll find verified transporters"
            : "Lowetsani katundu wanu ndipo tipeze oyendetsa otsimikizirika"}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-2">
        {[
          { num: 1, label: language === "en" ? "Route" : "Njira" },
          { num: 2, label: language === "en" ? "Cargo" : "Katundu" },
          { num: 3, label: language === "en" ? "Review" : "Onani" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors sm:h-10 sm:w-10 ${
                  step > s.num
                    ? "bg-primary text-primary-foreground"
                    : step === s.num
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-xs ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={`mx-2 h-0.5 w-8 rounded sm:mx-4 sm:w-16 ${step > s.num ? "bg-primary" : "bg-secondary"}`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MapPin className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              {language === "en" ? "Route Details" : "Njira"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {language === "en" ? "Where are you shipping from and to?" : "Mukuchokera kuti ndipo mukupita kuti?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{language === "en" ? "From" : "Kuchokera"}</Label>
                <Select value={formData.origin} onValueChange={(v) => updateForm("origin", v)}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue placeholder={language === "en" ? "Select city" : "Sankhani mzinda"} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc.name} value={loc.name}>
                        {loc.name} ({loc.region})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{language === "en" ? "Landmark" : "Malo Enieni"}</Label>
                <Select
                  value={formData.originLandmark}
                  onValueChange={(v) => updateForm("originLandmark", v)}
                  disabled={!formData.origin}
                >
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue placeholder={language === "en" ? "Select landmark" : "Sankhani malo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(commonLandmarks[formData.origin] || []).map((landmark) => (
                      <SelectItem key={landmark} value={landmark}>
                        {landmark}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">{language === "en" ? "Other" : "Malo Ena"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{language === "en" ? "To" : "Kupita"}</Label>
                <Select value={formData.destination} onValueChange={(v) => updateForm("destination", v)}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue placeholder={language === "en" ? "Select city" : "Sankhani mzinda"} />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter((l) => l.name !== formData.origin)
                      .map((loc) => (
                        <SelectItem key={loc.name} value={loc.name}>
                          {loc.name} ({loc.region})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{language === "en" ? "Landmark" : "Malo Enieni"}</Label>
                <Select
                  value={formData.destLandmark}
                  onValueChange={(v) => updateForm("destLandmark", v)}
                  disabled={!formData.destination}
                >
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue placeholder={language === "en" ? "Select landmark" : "Sankhani malo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(commonLandmarks[formData.destination] || []).map((landmark) => (
                      <SelectItem key={landmark} value={landmark}>
                        {landmark}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">{language === "en" ? "Other" : "Malo Ena"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{language === "en" ? "Pickup Date" : "Tsiku Lotenga"}</Label>
                <Input
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => updateForm("pickupDate", e.target.value)}
                  className="h-11 sm:h-10"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{language === "en" ? "Time" : "Nthawi"}</Label>
                <Select value={formData.pickupTime} onValueChange={(v) => updateForm("pickupTime", v)}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue placeholder={language === "en" ? "Select time" : "Sankhani nthawi"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="early">
                      {language === "en" ? "Early Morning (4am - 8am)" : "M'mawa Kwambiri (4am - 8am)"}
                    </SelectItem>
                    <SelectItem value="morning">
                      {language === "en" ? "Morning (8am - 12pm)" : "M'mawa (8am - 12pm)"}
                    </SelectItem>
                    <SelectItem value="afternoon">
                      {language === "en" ? "Afternoon (12pm - 5pm)" : "Masana (12pm - 5pm)"}
                    </SelectItem>
                    <SelectItem value="flexible">{language === "en" ? "Flexible" : "Nthawi Iliyonse"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.origin || !formData.destination}
                className="h-11 w-full gap-2 sm:h-10 sm:w-auto"
              >
                {language === "en" ? "Continue" : "Pitirizani"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Package className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              {language === "en" ? "Cargo Details" : "Katundu"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {language === "en" ? "What are you shipping?" : "Ndi katundu wanji?"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{language === "en" ? "Cargo Type" : "Mtundu wa Katundu"}</Label>
                <Select value={formData.cargoType} onValueChange={(v) => updateForm("cargoType", v)}>
                  <SelectTrigger className="h-11 sm:h-10">
                    <SelectValue placeholder={language === "en" ? "Select type" : "Sankhani mtundu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cargoTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center justify-between gap-2">
                          <span>{type.label}</span>
                          <span className="text-xs text-muted-foreground">({type.season})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{language === "en" ? "Weight (kg)" : "Kulemera (kg)"}</Label>
                <Input
                  type="text"
                  placeholder="e.g., 2500"
                  value={formData.weight}
                  onChange={(e) => updateForm("weight", e.target.value)}
                  className="h-11 sm:h-10"
                />
              </div>
            </div>

            {seasonalInfo && (
              <div
                className={`rounded-lg border p-3 ${
                  seasonalInfo.isInSeason ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Leaf className={`h-4 w-4 ${seasonalInfo.isInSeason ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">
                    {seasonalInfo.isInSeason
                      ? language === "en"
                        ? "Peak Season!"
                        : "Nyengo ya Peak Season!"
                      : `${language === "en" ? "Season" : "Nyengo"}: ${seasonalInfo.season}`}
                  </span>
                  {seasonalInfo.isInSeason && seasonalInfo.multiplier > 1 && (
                    <Badge className="bg-amber-500/20 text-amber-400">
                      +{Math.round((seasonalInfo.multiplier - 1) * 100)}% demand
                    </Badge>
                  )}
                </div>
                {seasonalInfo.isInSeason && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {language === "en"
                      ? "High vehicle demand this season"
                      : "Kufuna kwa magalimoto kwakwera nyengo ino"}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">
                {language === "en" ? "Description (Optional)" : "Kufotokoza Kwambiri"}
              </Label>
              <Textarea
                placeholder={
                  language === "en"
                    ? "Describe your cargo..."
                    : "Fotokozani katundu wanu, e.g., matumba a chimanga 50kg"
                }
                value={formData.description}
                onChange={(e) => updateForm("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm">{language === "en" ? "Payment Method" : "Njira Yolipirira"}</Label>
              <Select value={formData.paymentMethod} onValueChange={(v) => updateForm("paymentMethod", v)}>
                <SelectTrigger className="h-11 sm:h-10">
                  <SelectValue placeholder={language === "en" ? "Select method" : "Sankhani njira"} />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="h-11 gap-2 sm:h-10">
                <ArrowLeft className="h-4 w-4" />
                {language === "en" ? "Back" : "Bwererani"}
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!formData.cargoType || !formData.weight}
                className="h-11 gap-2 sm:h-10"
              >
                {language === "en" ? "Continue" : "Pitirizani"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              {language === "en" ? "Review & Confirm" : "Onani Zonse"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {language === "en" ? "Verify your shipment details" : "Tsimikizirani zambiri"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">
                  {language === "en" ? "Contact Name" : "Dzina la Olumikizana"}
                </Label>
                <Input
                  placeholder={language === "en" ? "Contact name" : "Dzina la kutenga"}
                  value={formData.contactName}
                  onChange={(e) => updateForm("contactName", e.target.value)}
                  className="h-11 sm:h-10"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm">{language === "en" ? "Phone Number" : "Nambala ya Foni"}</Label>
                <Input
                  type="tel"
                  placeholder="+265 999 123 456"
                  value={formData.contactPhone}
                  onChange={(e) => updateForm("contactPhone", e.target.value)}
                  className="h-11 sm:h-10"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg border border-border bg-secondary/50 p-3 sm:p-4">
              <h4 className="mb-2 text-sm font-semibold text-foreground sm:mb-3">
                {language === "en" ? "Summary" : "Zonse Mokwanira"}
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === "en" ? "Route" : "Njira"}</span>
                  <span className="font-medium text-foreground">
                    {formData.origin} → {formData.destination}
                  </span>
                </div>
                {formData.originLandmark && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "en" ? "From" : "Kuchokera"}</span>
                    <span className="font-medium text-foreground">{formData.originLandmark}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === "en" ? "Cargo" : "Katundu"}</span>
                  <span className="font-medium text-foreground">
                    {cargoTypes.find((c) => c.value === formData.cargoType)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === "en" ? "Weight" : "Kulemera"}</span>
                  <span className="font-medium text-foreground">{formData.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === "en" ? "Pickup" : "Tsiku"}</span>
                  <span className="font-medium text-foreground">{formData.pickupDate || "Flexible"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{language === "en" ? "Payment" : "Kulipira"}</span>
                  <span className="font-medium text-foreground">
                    {paymentMethods.find((m) => m.value === formData.paymentMethod)?.label || "Not selected"}
                  </span>
                </div>
                <hr className="my-2 border-border" />
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">
                    {language === "en" ? "Estimated Price" : "Mtengo Woyembekezeka"}
                  </span>
                  <span className="text-base font-bold text-primary sm:text-lg">{getEstimatedPrice()}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-chart-2/30 bg-chart-2/5 p-3">
              <p className="text-xs text-muted-foreground">
                {language === "en"
                  ? "After posting, we'll find verified transporters and send updates via SMS or WhatsApp."
                  : "Mukatumiza, tidzakupezani oyendetsa otsimikizirika ndipo mudzalandira mauthenga ku foni yanu kapena WhatsApp."}
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="h-11 gap-2 sm:h-10">
                <ArrowLeft className="h-4 w-4" />
                {language === "en" ? "Back" : "Bwererani"}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !formData.contactName || !formData.contactPhone}
                className="h-11 sm:h-10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "en" ? "Posting..." : "Ikutumiza..."}
                  </>
                ) : language === "en" ? (
                  "Post Shipment"
                ) : (
                  "Tumizani Katundu"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
