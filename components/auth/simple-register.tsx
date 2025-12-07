"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, User, Loader2, Truck, Package, ArrowRight, Check } from "lucide-react"
import { useApp } from "@/contexts/app-context"

export function SimpleRegister() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, showToast } = useApp()

  const defaultType = searchParams.get("type") === "transporter" ? "transporter" : "shipper"

  const [step, setStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<"shipper" | "transporter">(defaultType)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    pin: "",
    confirmPin: "",
  })

  const handleStep1 = () => {
    if (form.name && form.phone.length >= 9) {
      setStep(2)
    }
  }

  const handleRegister = async () => {
    if (form.pin !== form.confirmPin) {
      showToast("PINs do not match", "error")
      return
    }

    setIsLoading(true)

    const success = await register({
      name: form.name,
      phone: form.phone,
      pin: form.pin,
      role: userType,
    })

    if (success) {
      showToast("Account created!", "success")
      router.push(userType === "transporter" ? "/dashboard/transporter" : "/dashboard")
    } else {
      showToast("Registration failed", "error")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Truck className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Matola</span>
          </Link>
          <p className="mt-2 text-muted-foreground">Lembani / Register</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
          <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
        </div>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="space-y-4">
                {/* User Type Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={userType === "shipper" ? "default" : "outline"}
                    className={`h-14 flex-col gap-1 ${userType !== "shipper" && "bg-transparent"}`}
                    onClick={() => setUserType("shipper")}
                  >
                    <Package className="h-5 w-5" />
                    <span className="text-xs">Shipper</span>
                  </Button>
                  <Button
                    type="button"
                    variant={userType === "transporter" ? "default" : "outline"}
                    className={`h-14 flex-col gap-1 ${userType !== "transporter" && "bg-transparent"}`}
                    onClick={() => setUserType("transporter")}
                  >
                    <Truck className="h-5 w-5" />
                    <span className="text-xs">Driver</span>
                  </Button>
                </div>

                {/* Name */}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Dzina lanu / Your name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-14 pl-12 text-lg"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="0999 123 456"
                    value={form.phone}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "")
                      if (cleaned.length <= 10) setForm((f) => ({ ...f, phone: cleaned }))
                    }}
                    className="h-14 pl-12 text-lg"
                  />
                </div>

                <Button
                  onClick={handleStep1}
                  className="w-full h-14 text-lg"
                  disabled={!form.name || form.phone.length < 9}
                >
                  Pitirizani
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Pangani PIN yanu / Create your PIN</p>
                </div>

                {/* PIN */}
                <Input
                  type="password"
                  placeholder="PIN (4 digits)"
                  value={form.pin}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "")
                    if (cleaned.length <= 4) setForm((f) => ({ ...f, pin: cleaned }))
                  }}
                  maxLength={4}
                  className="h-14 text-center text-xl tracking-[1em] font-mono"
                />

                {/* Confirm PIN */}
                <Input
                  type="password"
                  placeholder="Bwerezani PIN / Confirm PIN"
                  value={form.confirmPin}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "")
                    if (cleaned.length <= 4) setForm((f) => ({ ...f, confirmPin: cleaned }))
                  }}
                  maxLength={4}
                  className="h-14 text-center text-xl tracking-[1em] font-mono"
                />

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-14 bg-transparent">
                    Back
                  </Button>
                  <Button
                    onClick={handleRegister}
                    className="flex-1 h-14 text-lg"
                    disabled={isLoading || form.pin.length < 4 || form.confirmPin.length < 4}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Lembani
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Muli ndi akaunti?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Lowani
          </Link>
        </p>
      </div>
    </div>
  )
}
