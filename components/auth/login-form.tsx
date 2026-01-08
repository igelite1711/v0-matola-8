"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Loader2, Package, Truck, Handshake, Shield } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import type { UserRole } from "@/contexts/app-context"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, showToast } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState(["", "", "", ""])
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    if (value && index < 3) {
      pinRefs[index + 1].current?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const pinString = pin.join("")
    const roleParam = searchParams.get("role") as UserRole | null
    
    // Format phone: convert 0999123456 to +265999123456
    const formattedPhone = phone.startsWith("0") 
      ? `+265${phone.slice(1)}` 
      : phone.includes("265") 
        ? phone.startsWith("+") ? phone : `+${phone}`
        : `+265${phone}`
    
    const success = await login(formattedPhone, pinString, roleParam || undefined)

    if (success) {
      showToast("Login successful! Welcome back.", "success")
      const dashboardRoutes: Record<UserRole, string> = {
        shipper: "/dashboard",
        transporter: "/dashboard/transporter",
        broker: "/dashboard/broker",
        admin: "/dashboard/admin",
      }

      if (roleParam && dashboardRoutes[roleParam]) {
        router.push(dashboardRoutes[roleParam])
      } else if (phone.startsWith("088")) {
        router.push("/dashboard/transporter")
      } else if (phone.startsWith("0884")) {
        router.push("/dashboard/broker")
      } else if (phone.startsWith("0991")) {
        router.push("/dashboard/admin")
      } else {
        router.push("/dashboard")
      }
    } else {
      showToast("Invalid PIN. Please try again.", "error")
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (demoPhone: string, role: UserRole) => {
    // Format: 0999123456 -> 9991234456 (without leading 0)
    const formatted = demoPhone.startsWith("0") ? demoPhone.slice(1) : demoPhone
    setPhone(formatted)
    setPin(["1", "2", "3", "4"])
  }

  const isPinComplete = pin.every((digit) => digit !== "")

  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phone">Nambala ya Foni / Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="0999 123 456"
                value={phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "")
                  if (cleaned.length <= 10) {
                    setPhone(cleaned)
                  }
                }}
                className="pl-10 text-lg"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">Lowetsani nambala yanu ya Airtel kapena TNM</p>
          </div>

          {/* 4-Digit PIN Input */}
          <div className="space-y-2">
            <Label>PIN (Manambala 4)</Label>
            <div className="flex justify-center gap-3">
              {pin.map((digit, index) => (
                <Input
                  key={index}
                  ref={pinRefs[index]}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  className="h-14 w-14 text-center text-2xl font-bold"
                  required
                />
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground">Lowetsani PIN yanu ya manambala 4</p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={isLoading || !isPinComplete || phone.length < 9}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Kulowa...
              </>
            ) : (
              "Lowani / Sign In"
            )}
          </Button>

          {/* Forgot PIN Option */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => showToast("SMS with reset code will be sent to your phone", "info")}
            >
              Mwayiwala PIN? / Forgot PIN?
            </button>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-center text-xs text-muted-foreground mb-3">Demo Quick Login (PIN: 1234)</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => handleQuickLogin("0999123456", "shipper")}
              >
                <Package className="h-4 w-4" />
                Shipper
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => handleQuickLogin("0888123456", "transporter")}
              >
                <Truck className="h-4 w-4" />
                Driver
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => handleQuickLogin("0884123456", "broker")}
              >
                <Handshake className="h-4 w-4" />
                Broker
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => handleQuickLogin("0991111111", "admin")}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
