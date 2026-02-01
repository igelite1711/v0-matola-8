"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Loader2, Truck, ArrowRight, MessageCircle } from "lucide-react"
import { useApp } from "@/contexts/app-context"

export function SimpleLogin() {
  const router = useRouter()
  const { login, showToast } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(phone, pin)

    if (success) {
      showToast("Welcome back!", "success")
      router.push("/dashboard")
    } else {
      showToast("Invalid phone or PIN", "error")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Truck className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">Matola</span>
          </Link>
          <p className="mt-2 text-muted-foreground">Lowani / Sign In</p>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone Input */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="0999 123 456"
                  value={phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "")
                    if (cleaned.length <= 10) setPhone(cleaned)
                  }}
                  className="h-14 pl-12 text-lg"
                  required
                />
              </div>

              {/* PIN Input */}
              <div>
                <Input
                  type="password"
                  placeholder="PIN (4 digits)"
                  value={pin}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "")
                    if (cleaned.length <= 4) setPin(cleaned)
                  }}
                  maxLength={4}
                  className="h-14 text-center text-xl tracking-[1em] font-mono"
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-14 text-lg"
                disabled={isLoading || phone.length < 9 || pin.length < 4}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Lowani
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Forgot PIN */}
            <button className="w-full text-sm text-primary hover:underline mt-4">Ndayiwala PIN? / Forgot PIN?</button>
          </CardContent>
        </Card>

        {/* Alternative Access */}
        <div className="mt-6 p-4 rounded-lg border border-border bg-card/50">
          <p className="text-center text-sm text-muted-foreground mb-3">Njira zina / Other ways</p>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-secondary">
                <Phone className="h-5 w-5" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">USSD</p>
              <p className="text-sm font-medium text-primary">*555#</p>
            </div>
            <div className="text-center">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-green-500/20">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">WhatsApp</p>
              <p className="text-sm font-medium text-primary">0999123456</p>
            </div>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Mulibe akaunti?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Lembani
          </Link>
        </p>
      </div>
    </div>
  )
}
