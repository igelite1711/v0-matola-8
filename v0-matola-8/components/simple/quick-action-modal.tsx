"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, MapPin, Package, ArrowRight, Check, Loader2, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuickActionModalProps {
  type: "post" | "find" | "track" | null
  onClose: () => void
}

const MALAWI_CITIES = ["Lilongwe", "Blantyre", "Mzuzu", "Zomba", "Mangochi", "Salima", "Karonga", "Kasungu"]

const CARGO_TYPES = [
  { id: "farm", label: "Farm Produce", icon: "🌽" },
  { id: "goods", label: "General Goods", icon: "📦" },
  { id: "materials", label: "Building Materials", icon: "🧱" },
  { id: "other", label: "Other", icon: "📋" },
]

const WEIGHT_OPTIONS = [
  { value: 500, label: "500 kg" },
  { value: 1000, label: "1 ton" },
  { value: 5000, label: "5 tons" },
  { value: 10000, label: "10 tons" },
]

export function QuickActionModal({ type, onClose }: QuickActionModalProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Form state
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [cargoType, setCargoType] = useState("")
  const [weight, setWeight] = useState(0)

  useEffect(() => {
    if (type) {
      setStep(1)
      setIsSuccess(false)
      setOrigin("")
      setDestination("")
      setCargoType("")
      setWeight(0)
    }
  }, [type])

  if (!type) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSuccess(true)

    // Auto close and redirect after success
    setTimeout(() => {
      onClose()
      router.push("/dashboard")
    }, 2000)
  }

  const canProceed = () => {
    if (step === 1) return origin && destination
    if (step === 2) return cargoType && weight
    return true
  }

  // Post Load Modal
  if (type === "post") {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-card md:rounded-3xl animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Post a Load</h2>
                <p className="text-sm text-muted-foreground">Step {step} of 2</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-secondary">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 2) * 100}%` }} />
          </div>

          {/* Content */}
          <div className="p-6">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Load Posted!</h3>
                <p className="text-muted-foreground">We&apos;re finding transporters for your route</p>
              </div>
            ) : step === 1 ? (
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-medium text-foreground">Where from?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MALAWI_CITIES.slice(0, 6).map((city) => (
                      <button
                        key={city}
                        onClick={() => setOrigin(city)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all touch-target",
                          origin === city
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50",
                        )}
                      >
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="font-medium">{city}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-foreground">Where to?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MALAWI_CITIES.filter((c) => c !== origin)
                      .slice(0, 6)
                      .map((city) => (
                        <button
                          key={city}
                          onClick={() => setDestination(city)}
                          className={cn(
                            "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all touch-target",
                            destination === city
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50",
                          )}
                        >
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="font-medium">{city}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="mb-3 block text-sm font-medium text-foreground">What are you shipping?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CARGO_TYPES.map((cargo) => (
                      <button
                        key={cargo.id}
                        onClick={() => setCargoType(cargo.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all touch-target",
                          cargoType === cargo.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50",
                        )}
                      >
                        <span className="text-2xl">{cargo.icon}</span>
                        <span className="font-medium">{cargo.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-foreground">How much weight?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {WEIGHT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setWeight(option.value)}
                        className={cn(
                          "rounded-xl border-2 px-4 py-3 text-center font-semibold transition-all touch-target",
                          weight === option.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Route summary */}
                <div className="rounded-xl bg-secondary/50 p-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-foreground">{origin}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{destination}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isSuccess && (
            <div className="flex gap-3 border-t border-border p-6">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Back
                </Button>
              )}
              <Button
                onClick={() => (step < 2 ? setStep(step + 1) : handleSubmit())}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : step < 2 ? "Continue" : "Post Load"}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Find Loads Modal
  if (type === "find") {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center md:items-center">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-lg overflow-hidden rounded-t-3xl bg-card md:rounded-3xl animate-slide-up">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Find Loads</h2>
                <p className="text-sm text-muted-foreground">Select your route</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-foreground">Where are you now?</label>
                <div className="grid grid-cols-2 gap-2">
                  {MALAWI_CITIES.slice(0, 6).map((city) => (
                    <button
                      key={city}
                      onClick={() => setOrigin(city)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all touch-target",
                        origin === city
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50",
                      )}
                    >
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{city}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-foreground">Where can you go?</label>
                <div className="grid grid-cols-2 gap-2">
                  {MALAWI_CITIES.filter((c) => c !== origin)
                    .slice(0, 6)
                    .map((city) => (
                      <button
                        key={city}
                        onClick={() => setDestination(city)}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all touch-target",
                          destination === city
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50",
                        )}
                      >
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="font-medium">{city}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 border-t border-border p-6">
            <Button
              onClick={() => {
                onClose()
                router.push(`/dashboard/loads?from=${origin}&to=${destination}`)
              }}
              disabled={!origin || !destination}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Search Loads
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
