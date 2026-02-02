"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Truck, Package, ArrowLeft, Globe, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"

type UserType = "shipper" | "transporter"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, setLanguage } = useTranslation()

  const [step, setStep] = useState<"type" | "details" | "pin" | "success">(
    searchParams.get("type") ? "details" : "type",
  )
  const [userType, setUserType] = useState<UserType>((searchParams.get("type") as UserType) || "shipper")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSelectType = (type: UserType) => {
    setUserType(type)
    setStep("details")
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || name.length < 2) {
      setError(language === "ny" ? "Lembani dzina lanu" : "Enter your name")
      return
    }

    if (!phone || phone.length < 9) {
      setError(language === "ny" ? "Lembani nambala yabwino" : "Enter a valid phone number")
      return
    }

    setStep("pin")
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!pin || pin.length !== 4) {
      setError(language === "ny" ? "PIN iyenera kukhala manambala 4" : "PIN must be 4 digits")
      return
    }

    if (pin !== confirmPin) {
      setError(language === "ny" ? "PIN sizofanana" : "PINs don't match")
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setStep("success")
  }

  const handleGoToDashboard = () => {
    router.push(userType === "transporter" ? "/simple/v2/transporter" : "/simple/v2/shipper")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center justify-between">
          {step !== "success" ? (
            <button
              onClick={() => {
                if (step === "type") router.push("/simple/v2")
                else if (step === "details") setStep("type")
                else if (step === "pin") setStep("details")
              }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{language === "ny" ? "Bwerera" : "Back"}</span>
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={() => setLanguage(language === "en" ? "ny" : "en")}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-foreground"
          >
            <Globe className="h-4 w-4" />
            {language === "en" ? "Chichewa" : "English"}
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="mx-auto w-full max-w-sm">
          {/* Step 1: Select Type */}
          {step === "type" && (
            <>
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">
                {language === "ny" ? "Lembetsani ku Matola" : "Join Matola"}
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                {language === "ny" ? "Sankhani momwe mukufunira kugwiritsa ntchito" : "How will you use Matola?"}
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleSelectType("shipper")}
                  className="w-full p-6 rounded-2xl bg-card border-2 border-border hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <Package className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {language === "ny" ? "Ndikufuna kutumiza" : "I need to ship goods"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === "ny"
                          ? "Pezani oyendetsa otsimikizidwa"
                          : "Find verified transporters for your cargo"}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-2" />
                  </div>
                </button>

                <button
                  onClick={() => handleSelectType("transporter")}
                  className="w-full p-6 rounded-2xl bg-card border-2 border-border hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <Truck className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {language === "ny" ? "Ndili ndi galimoto" : "I have a truck"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === "ny" ? "Pezani katundu ndipo mupeze ndalama" : "Find loads and earn money"}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-2" />
                  </div>
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  {language === "ny" ? "Muli ndi akaunti kale?" : "Already have an account?"}{" "}
                  <Link href="/simple/v2/login" className="text-primary font-medium">
                    {language === "ny" ? "Lowani" : "Log in"}
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Step 2: Details */}
          {step === "details" && (
            <>
              <div className="flex justify-center mb-6">
                <div
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-xl",
                    userType === "transporter" ? "bg-primary/10" : "bg-primary/10",
                  )}
                >
                  {userType === "transporter" ? (
                    <Truck className="h-7 w-7 text-primary" />
                  ) : (
                    <Package className="h-7 w-7 text-primary" />
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-bold text-center text-foreground mb-2">
                {language === "ny" ? "Za Inu" : "Your Details"}
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                {language === "ny" ? "Tidziwani za inu" : "Tell us about yourself"}
              </p>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === "ny" ? "Dzina Lanu Lonse" : "Full Name"}
                  </label>
                  <Input
                    type="text"
                    placeholder={language === "ny" ? "mwa. Chisomo Banda" : "e.g. Chisomo Banda"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-lg bg-card border-border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === "ny" ? "Nambala ya Foni" : "Phone Number"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">+265</span>
                    <Input
                      type="tel"
                      placeholder="999 123 456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                      className="h-14 pl-16 text-lg bg-card border-border rounded-xl"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive text-center">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground rounded-xl"
                >
                  {language === "ny" ? "Pitirizani" : "Continue"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </>
          )}

          {/* Step 3: PIN */}
          {step === "pin" && (
            <>
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">
                {language === "ny" ? "Pangani PIN" : "Create PIN"}
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                {language === "ny" ? "PIN yanu idzateteza akaunti yanu" : "Your PIN will keep your account secure"}
              </p>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">PIN (4 digits)</label>
                  <Input
                    type="password"
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="h-14 text-lg text-center tracking-[0.5em] bg-card border-border rounded-xl"
                    maxLength={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {language === "ny" ? "Bwerezani PIN" : "Confirm PIN"}
                  </label>
                  <Input
                    type="password"
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="h-14 text-lg text-center tracking-[0.5em] bg-card border-border rounded-xl"
                    maxLength={4}
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive text-center">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {language === "ny" ? "Kupanga akaunti..." : "Creating account..."}
                    </>
                  ) : language === "ny" ? (
                    "Lembetsani"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-2">
                {language === "ny" ? "Zikomo, " : "Welcome, "}
                {name.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground mb-8">
                {language === "ny" ? "Akaunti yanu yapangidwa bwino" : "Your account has been created successfully"}
              </p>

              <div className="p-4 rounded-2xl bg-card border border-border mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    {language === "ny" ? "Mtundu wa akaunti" : "Account type"}
                  </span>
                  <span className="font-medium text-foreground capitalize">
                    {userType === "transporter"
                      ? language === "ny"
                        ? "Woyendetsa"
                        : "Transporter"
                      : language === "ny"
                        ? "Wotumiza"
                        : "Shipper"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {language === "ny" ? "Nambala ya foni" : "Phone"}
                  </span>
                  <span className="font-medium text-foreground">+265 {phone}</span>
                </div>
              </div>

              <Button
                onClick={handleGoToDashboard}
                className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground rounded-xl"
              >
                {language === "ny" ? "Pitani ku Dashboard" : "Go to Dashboard"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
