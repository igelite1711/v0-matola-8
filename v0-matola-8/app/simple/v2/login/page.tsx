"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Truck, Eye, EyeOff, ArrowLeft, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTranslation } from "@/lib/i18n/use-language"

export default function LoginPage() {
  const router = useRouter()
  const { language, setLanguage } = useTranslation()
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phone || phone.length < 9) {
      setError(language === "ny" ? "Lembani nambala yabwino" : "Enter a valid phone number")
      return
    }

    if (!pin || pin.length !== 4) {
      setError(language === "ny" ? "PIN iyenera kukhala manambala 4" : "PIN must be 4 digits")
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // For demo, redirect based on phone prefix
    if (phone.startsWith("099")) {
      router.push("/simple/v2/transporter")
    } else {
      router.push("/simple/v2/shipper")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="mx-auto max-w-lg px-4 py-3 flex items-center justify-between">
          <Link href="/simple/v2" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
            <span>{language === "ny" ? "Bwerera" : "Back"}</span>
          </Link>
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
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Truck className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-2">
            {language === "ny" ? "Lowani mu Matola" : "Log in to Matola"}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {language === "ny" ? "Lembani nambala yanu ndi PIN" : "Enter your phone and PIN"}
          </p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone Input */}
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

            {/* PIN Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">PIN</label>
              <div className="relative">
                <Input
                  type={showPin ? "text" : "password"}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="h-14 text-lg text-center tracking-[0.5em] bg-card border-border rounded-xl"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive text-center">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold bg-primary text-primary-foreground rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {language === "ny" ? "Kulowa..." : "Logging in..."}
                </>
              ) : language === "ny" ? (
                "Lowani"
              ) : (
                "Log In"
              )}
            </Button>

            {/* Forgot PIN */}
            <button type="button" className="w-full text-center text-sm text-primary">
              {language === "ny" ? "Mwayiwala PIN?" : "Forgot your PIN?"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              {language === "ny" ? "Mulibe akaunti?" : "Don't have an account?"}{" "}
              <Link href="/simple/v2/register" className="text-primary font-medium">
                {language === "ny" ? "Lembetsani" : "Sign up"}
              </Link>
            </p>
          </div>

          {/* USSD Option */}
          <div className="mt-8 p-4 rounded-2xl bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {language === "ny" ? "Kapena gwiritsani ntchito USSD" : "Or use USSD"}
            </p>
            <p className="text-lg font-bold text-primary">*384*628652#</p>
          </div>
        </div>
      </div>
    </div>
  )
}
