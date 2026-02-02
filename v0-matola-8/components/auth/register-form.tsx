"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, User, Truck, Package, Loader2, MessageCircle, CheckCircle2, Handshake, Shield } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import type { UserRole } from "@/contexts/app-context"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { register, showToast } = useApp()

  const getDefaultType = (): UserRole => {
    const type = searchParams.get("type")
    if (type === "transporter") return "transporter"
    if (type === "broker") return "broker"
    if (type === "admin") return "admin"
    return "shipper"
  }

  const [step, setStep] = useState<"details" | "verify" | "pin">("details")
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState<UserRole>(getDefaultType())
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""])
  const [pin, setPin] = useState(["", "", "", ""])
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""])

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    useWhatsappSame: true,
    businessName: "",
    referralCode: "",
  })

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newCode = [...verificationCode]
    newCode[index] = value
    setVerificationCode(newCode)
    // Auto-advance to next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handlePinChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[],
    index: number,
    value: string,
    prefix: string,
  ) => {
    if (value.length > 1) return
    const newPin = [...current]
    newPin[index] = value
    setter(newPin)
    // Auto-advance to next field
    if (value && index < 3) {
      const nextInput = document.getElementById(`${prefix}-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleSendCode = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setStep("verify")
    showToast("Verification code sent to your phone!", "success")
  }

  const handleVerifyCode = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    setStep("pin")
    showToast("Phone verified successfully!", "success")
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()

    if (pin.join("") !== confirmPin.join("")) {
      showToast("PINs do not match!", "error")
      return
    }

    setIsLoading(true)

    const success = await register({
      name: formData.name,
      phone: formData.phone,
      pin: pin.join(""),
      role: userType,
    })

    if (success) {
      showToast("Account created successfully!", "success")
      const dashboardRoutes: Record<UserRole, string> = {
        shipper: "/dashboard",
        transporter: "/dashboard/transporter",
        broker: "/dashboard/broker",
        admin: "/dashboard/admin",
      }
      router.push(dashboardRoutes[userType])
    } else {
      showToast("Registration failed. Please try again.", "error")
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const typeDescriptions: Record<UserRole, { en: string; ny: string }> = {
    shipper: {
      en: "Send cargo, find reliable transporters.",
      ny: "Tumizani katundu, pezani oyendetsa amagalimoto.",
    },
    transporter: {
      en: "Find loads, earn more, reduce empty returns.",
      ny: "Pezani katundu, chititsani ndalama zambiri, chepetsani maulendo opanda katundu.",
    },
    broker: {
      en: "Connect shippers with transporters, earn commissions.",
      ny: "Lumikizani otumiza ndi oyendetsa, pezani ma commission.",
    },
    admin: {
      en: "Platform administration and management.",
      ny: "Kuyang'anira ndi kukonza pulogalamu.",
    },
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-6">
        <Tabs value={userType} onValueChange={(v) => setUserType(v as UserRole)} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="shipper" className="gap-1 text-xs sm:text-sm py-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Shipper</span>
            </TabsTrigger>
            <TabsTrigger value="transporter" className="gap-1 text-xs sm:text-sm py-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Driver</span>
            </TabsTrigger>
            <TabsTrigger value="broker" className="gap-1 text-xs sm:text-sm py-2">
              <Handshake className="h-4 w-4" />
              <span className="hidden sm:inline">Broker</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-1 text-xs sm:text-sm py-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          {(["shipper", "transporter", "broker", "admin"] as UserRole[]).map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              <p className="text-sm text-muted-foreground">{typeDescriptions[type].en}</p>
            </TabsContent>
          ))}
        </Tabs>

        {/* Step 1: Basic Details */}
        {step === "details" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dzina Lanu / Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Mwai Banda"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {userType === "broker" && (
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name (Optional)</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Banda Logistics Agency"
                  value={formData.businessName}
                  onChange={(e) => updateFormData("businessName", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reg-phone">Nambala ya Foni / Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="0999 123 456"
                  value={formData.phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "")
                    if (cleaned.length <= 10) {
                      updateFormData("phone", cleaned)
                      if (formData.useWhatsappSame) {
                        updateFormData("whatsapp", cleaned)
                      }
                    }
                  }}
                  className="pl-10 text-lg"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Tidzatumiza code pa nambalayi</p>
            </div>

            {/* WhatsApp Option */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="same-whatsapp"
                  checked={formData.useWhatsappSame}
                  onChange={(e) => {
                    updateFormData("useWhatsappSame", e.target.checked)
                    if (e.target.checked) {
                      updateFormData("whatsapp", formData.phone)
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="same-whatsapp" className="text-sm font-normal">
                  WhatsApp ndi nambala imodzi / Same as phone
                </Label>
              </div>

              {!formData.useWhatsappSame && (
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
                  <Input
                    type="tel"
                    placeholder="WhatsApp number"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "")
                      if (cleaned.length <= 10) {
                        updateFormData("whatsapp", cleaned)
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              )}
            </div>

            {userType === "broker" && (
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <Input
                  id="referralCode"
                  type="text"
                  placeholder="BROKER2024"
                  value={formData.referralCode}
                  onChange={(e) => updateFormData("referralCode", e.target.value.toUpperCase())}
                />
                <p className="text-xs text-muted-foreground">Enter a referral code if you have one</p>
              </div>
            )}

            {userType === "admin" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  Admin accounts require approval. You will be notified once your account is verified.
                </p>
              </div>
            )}

            <Button
              onClick={handleSendCode}
              className="w-full h-12 text-lg mt-4"
              disabled={isLoading || formData.phone.length < 9 || !formData.name}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Kutumiza code...
                </>
              ) : (
                "Tumizani Code / Send Code"
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Verify Phone */}
        {step === "verify" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold">Tsimikizani Nambala Yanu</h3>
              <p className="mt-1 text-sm text-muted-foreground">Talowetsa code pa {formData.phone}</p>
            </div>

            <div className="flex justify-center gap-2">
              {verificationCode.map((digit, index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ""))}
                  className="h-12 w-10 text-center text-xl font-bold"
                />
              ))}
            </div>

            <Button
              onClick={handleVerifyCode}
              className="w-full h-12"
              disabled={isLoading || verificationCode.some((d) => !d)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Kutsimikizira...
                </>
              ) : (
                "Tsimikizani / Verify"
              )}
            </Button>

            <button
              type="button"
              className="w-full text-sm text-primary hover:underline"
              onClick={() => setStep("details")}
            >
              Tumizaninso code / Resend code
            </button>
          </div>
        )}

        {/* Step 3: Create PIN */}
        {step === "pin" && (
          <form onSubmit={handleCreateAccount} className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold">Pangani PIN Yanu</h3>
              <p className="mt-1 text-sm text-muted-foreground">PIN idzakhala yachinsinsi yanu yolowera</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-center block">PIN (Manambala 4)</Label>
                <div className="flex justify-center gap-3">
                  {pin.map((digit, index) => (
                    <Input
                      key={index}
                      id={`pin-${index}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(setPin, pin, index, e.target.value.replace(/\D/g, ""), "pin")}
                      className="h-14 w-14 text-center text-2xl font-bold"
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-center block">Bwerezani PIN / Confirm PIN</Label>
                <div className="flex justify-center gap-3">
                  {confirmPin.map((digit, index) => (
                    <Input
                      key={index}
                      id={`confirm-${index}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handlePinChange(setConfirmPin, confirmPin, index, e.target.value.replace(/\D/g, ""), "confirm")
                      }
                      className="h-14 w-14 text-center text-2xl font-bold"
                      required
                    />
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isLoading || pin.some((d) => !d) || confirmPin.some((d) => !d)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Kupanga akaunti...
                </>
              ) : (
                "Pangani Akaunti / Create Account"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
