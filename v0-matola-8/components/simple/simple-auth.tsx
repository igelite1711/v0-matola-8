"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Truck, Phone, Lock, ArrowRight, Loader2, Eye, EyeOff, User, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { cn } from "@/lib/utils"

interface SimpleAuthProps {
  mode: "login" | "register"
}

export function SimpleAuth({ mode }: SimpleAuthProps) {
  const router = useRouter()
  const { login } = useApp()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)

  // Form state
  const [phone, setPhone] = useState("")
  const [pin, setPin] = useState("")
  const [name, setName] = useState("")
  const [userType, setUserType] = useState<"shipper" | "transporter">("shipper")

  const handleSubmit = async () => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock login
    login({
      id: "user-1",
      name: name || "Demo User",
      phone,
      role: userType,
      verified: true,
    })

    setIsLoading(false)
    router.push("/simple/dashboard")
  }

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")
    // Format as Malawi phone number
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center justify-center border-b border-border px-4">
        <Link href="/simple" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Matola</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Enter your phone number to continue"
                : step === 1
                  ? "Choose how you'll use Matola"
                  : "Enter your details to get started"}
            </p>
          </div>

          {/* Registration Step 1: User Type */}
          {mode === "register" && step === 1 && (
            <div className="space-y-4">
              <button
                onClick={() => setUserType("shipper")}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                  userType === "shipper"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    userType === "shipper" ? "bg-primary" : "bg-secondary",
                  )}
                >
                  <Package
                    className={cn(
                      "h-6 w-6",
                      userType === "shipper" ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">I need to ship goods</p>
                  <p className="text-sm text-muted-foreground">Post loads and find transporters</p>
                </div>
              </button>

              <button
                onClick={() => setUserType("transporter")}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                  userType === "transporter"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/50",
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    userType === "transporter" ? "bg-primary" : "bg-secondary",
                  )}
                >
                  <Truck
                    className={cn(
                      "h-6 w-6",
                      userType === "transporter" ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">I have a truck</p>
                  <p className="text-sm text-muted-foreground">Find loads and fill empty trips</p>
                </div>
              </button>

              <Button
                onClick={() => setStep(2)}
                className="mt-6 h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Login or Registration Step 2: Phone & PIN */}
          {(mode === "login" || step === 2) && (
            <div className="space-y-4">
              {/* Name field (register only) */}
              {mode === "register" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Your name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="h-14 w-full rounded-xl border border-border bg-input pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              )}

              {/* Phone field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Phone number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <div className="absolute left-12 top-1/2 -translate-y-1/2 text-muted-foreground">+265</div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="999 123 456"
                    className="h-14 w-full rounded-xl border border-border bg-input pl-24 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    maxLength={12}
                  />
                </div>
              </div>

              {/* PIN field */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {mode === "register" ? "Create a 4-digit PIN" : "Enter your PIN"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    className="h-14 w-full rounded-xl border border-border bg-input pl-12 pr-12 text-center text-2xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground placeholder:tracking-[0.5em] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <Button
                onClick={handleSubmit}
                disabled={!phone || pin.length !== 4 || (mode === "register" && !name) || isLoading}
                className="mt-6 h-14 w-full bg-primary text-lg text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : mode === "login" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Back button for registration */}
              {mode === "register" && (
                <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-muted-foreground">
                  Back
                </Button>
              )}
            </div>
          )}

          {/* Footer link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/simple/register" className="font-medium text-primary hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/simple/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  )
}
