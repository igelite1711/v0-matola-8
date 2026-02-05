"use client"

import { useState } from "react"
import { X, MapPin, Package, ArrowRight, Loader2, CheckCircle2, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"

const CITIES = [
  { en: "Lilongwe", ny: "Lilongwe" },
  { en: "Blantyre", ny: "Blantyre" },
  { en: "Mzuzu", ny: "Mzuzu" },
  { en: "Zomba", ny: "Zomba" },
  { en: "Salima", ny: "Salima" },
  { en: "Mangochi", ny: "Mangochi" },
  { en: "Kasungu", ny: "Kasungu" },
  { en: "Karonga", ny: "Karonga" },
]

const CARGO_TYPES = [
  { id: "farm", label: "Farm Produce", labelNy: "Zokolola", icon: "🌽" },
  { id: "general", label: "General Goods", labelNy: "Zinthu Zambiri", icon: "📦" },
  { id: "building", label: "Building Materials", labelNy: "Zomangira", icon: "🧱" },
  { id: "furniture", label: "Furniture", labelNy: "Mipando", icon: "🪑" },
  { id: "livestock", label: "Livestock", labelNy: "Ziweto", icon: "🐄" },
  { id: "other", label: "Other", labelNy: "Zina", icon: "📋" },
]

const WEIGHT_OPTIONS = [
  { value: 500, label: "500 kg" },
  { value: 1000, label: "1 ton" },
  { value: 2000, label: "2 tons" },
  { value: 5000, label: "5 tons" },
  { value: 10000, label: "10 tons" },
]

interface QuickPostModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function QuickPostModal({ isOpen, onClose, onSuccess }: QuickPostModalProps) {
  const { language } = useTranslation()
  const [step, setStep] = useState<"route" | "cargo" | "confirm" | "success">("route")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [cargoType, setCargoType] = useState("")
  const [weight, setWeight] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)

  if (!isOpen) return null

  const handleRouteNext = () => {
    if (origin && destination && origin !== destination) {
      setStep("cargo")
    }
  }

  const handleCargoNext = () => {
    if (cargoType && weight > 0) {
      setStep("confirm")
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setStep("success")
  }

  const handleClose = () => {
    setStep("route")
    setOrigin("")
    setDestination("")
    setCargoType("")
    setWeight(0)
    onClose()
  }

  const selectedCargo = CARGO_TYPES.find((c) => c.id === cargoType)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {step === "success"
              ? language === "ny"
                ? "Zapambana!"
                : "Success!"
              : language === "ny"
                ? "Tumizani Katundu"
                : "Post a Load"}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-secondary">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {/* Step 1: Route Selection */}
          {step === "route" && (
            <div className="space-y-6">
              {/* Voice Input */}
              <button
                onClick={() => setIsListening(!isListening)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed transition-colors",
                  isListening ? "border-primary bg-primary/10" : "border-border",
                )}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5 text-primary" />
                ) : (
                  <Mic className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={isListening ? "text-primary" : "text-muted-foreground"}>
                  {isListening
                    ? language === "ny"
                      ? "Ndikumvera..."
                      : "Listening..."
                    : language === "ny"
                      ? "Kapena nenani komwe mukupita"
                      : "Or speak your destination"}
                </span>
              </button>

              {/* Origin */}
              <div>
                <label htmlFor="origin-select" className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="inline h-4 w-4 mr-1 text-success" />
                  {language === "ny" ? "Kuchokera" : "From"} <span className="text-destructive" aria-label="required">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CITIES.map((city) => (
                    <button
                      key={city.en}
                      onClick={() => setOrigin(city.en)}
                      className={cn(
                        "p-3 rounded-xl text-sm font-medium transition-colors",
                        origin === city.en
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80",
                      )}
                    >
                      {language === "ny" ? city.ny : city.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <MapPin className="inline h-4 w-4 mr-1 text-destructive" />
                  {language === "ny" ? "Kupita" : "To"}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CITIES.map((city) => (
                    <button
                      key={city.en}
                      onClick={() => setDestination(city.en)}
                      disabled={city.en === origin}
                      className={cn(
                        "p-3 rounded-xl text-sm font-medium transition-colors",
                        destination === city.en
                          ? "bg-primary text-primary-foreground"
                          : city.en === origin
                            ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                            : "bg-secondary text-foreground hover:bg-secondary/80",
                      )}
                    >
                      {language === "ny" ? city.ny : city.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Route Summary */}
              {origin && destination && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{origin}</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{destination}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleRouteNext}
                disabled={!origin || !destination || origin === destination}
                className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground rounded-xl"
              >
                {language === "ny" ? "Pitirizani" : "Continue"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 2: Cargo Selection */}
          {step === "cargo" && (
            <div className="space-y-6">
              {/* Cargo Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Package className="inline h-4 w-4 mr-1" />
                  {language === "ny" ? "Mtundu wa Katundu" : "Cargo Type"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CARGO_TYPES.map((cargo) => (
                    <button
                      key={cargo.id}
                      onClick={() => setCargoType(cargo.id)}
                      className={cn(
                        "p-4 rounded-xl flex flex-col items-center gap-2 transition-colors",
                        cargoType === cargo.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80",
                      )}
                    >
                      <span className="text-2xl">{cargo.icon}</span>
                      <span className="text-xs font-medium text-center">
                        {language === "ny" ? cargo.labelNy : cargo.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {language === "ny" ? "Kulemera" : "Weight"}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {WEIGHT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setWeight(opt.value)}
                      className={cn(
                        "p-3 rounded-xl text-sm font-medium transition-colors",
                        weight === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("route")}
                  className="flex-1 h-12 rounded-xl bg-transparent border-border"
                >
                  {language === "ny" ? "Bwerera" : "Back"}
                </Button>
                <Button
                  onClick={handleCargoNext}
                  disabled={!cargoType || weight === 0}
                  className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl"
                >
                  {language === "ny" ? "Pitirizani" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirm" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{language === "ny" ? "Kuchokera" : "From"}</span>
                  <span className="font-medium text-foreground">{origin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{language === "ny" ? "Kupita" : "To"}</span>
                  <span className="font-medium text-foreground">{destination}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{language === "ny" ? "Katundu" : "Cargo"}</span>
                  <span className="font-medium text-foreground">
                    {selectedCargo?.icon} {language === "ny" ? selectedCargo?.labelNy : selectedCargo?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{language === "ny" ? "Kulemera" : "Weight"}</span>
                  <span className="font-medium text-foreground">{weight.toLocaleString()} kg</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-success/10 border border-success/20">
                <p className="text-sm text-success text-center">
                  {language === "ny"
                    ? "Mudzapeza oyendetsa mu mphindi zochepa!"
                    : "You'll get transporter matches within minutes!"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("cargo")}
                  className="flex-1 h-12 rounded-xl bg-transparent border-border"
                >
                  {language === "ny" ? "Bwerera" : "Back"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {language === "ny" ? "Kutumiza..." : "Posting..."}
                    </>
                  ) : language === "ny" ? (
                    "Tumizani"
                  ) : (
                    "Post Load"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">
                {language === "ny" ? "Katundu Walembedwa!" : "Load Posted!"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === "ny"
                  ? "Tikukufunirani oyendetsa abwino. Mudzalandira uthenga posachedwa."
                  : "We're finding the best transporters. You'll be notified soon."}
              </p>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1 h-12 rounded-xl bg-transparent">
                  {language === "ny" ? "Tsekani" : "Close"}
                </Button>
                <Button
                  onClick={() => {
                    handleClose()
                    onSuccess?.()
                  }}
                  className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl"
                >
                  {language === "ny" ? "Onani Ntchito" : "View Shipment"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
