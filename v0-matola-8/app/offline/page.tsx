"use client"

import { useState, useEffect } from "react"
import { WifiOff, RefreshCw, Phone, MessageCircle, Truck, ArrowLeft } from "lucide-react"
import { getPendingActionCount } from "@/lib/offline/indexed-db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function OfflinePage() {
  const [pendingCount, setPendingCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    const updateCount = async () => {
      try {
        const count = await getPendingActionCount()
        setPendingCount(count)
      } catch {
        // IndexedDB not available
      }
    }

    updateCount()
    const interval = setInterval(updateCount, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)

    // Wait a moment then check connection
    await new Promise((r) => setTimeout(r, 1000))

    if (navigator.onLine) {
      window.location.href = "/dashboard"
    } else {
      setIsRetrying(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Offline Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-muted-foreground" />
        </div>

        {/* Bilingual Header */}
        <h1 className="text-2xl font-bold text-foreground mb-2">Mulibe Intaneti</h1>
        <p className="text-lg text-foreground mb-1">You&apos;re Offline</p>

        <p className="text-muted-foreground mb-2">
          Palibe intaneti. Yesaninso pambuyo pake kapena pitani ku malo omwe muli nawo kale.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          No internet connection. Please try again later or visit pages you&apos;ve already viewed.
        </p>

        {/* Pending Actions Badge */}
        {pendingCount > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {pendingCount}
              </Badge>
              <span className="text-sm font-medium">pending {pendingCount === 1 ? "action" : "actions"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your changes are saved and will sync automatically when you&apos;re back online.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Button onClick={handleRetry} disabled={isRetrying} className="w-full py-6 text-lg">
            {isRetrying ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />}
            {isRetrying ? "Checking..." : "Yesaninso / Try Again"}
          </Button>

          <Button variant="secondary" onClick={() => window.history.back()} className="w-full py-6 text-lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Bwererani / Go Back
          </Button>
        </div>

        {/* Alternative Contact Methods */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">Need help? Contact us via:</p>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:*384*628652#"
              className="flex flex-col items-center p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <Phone className="w-6 h-6 mb-2 text-primary" />
              <span className="text-xs font-medium">USSD</span>
              <span className="text-xs text-muted-foreground">*384*628652#</span>
            </a>

            <a
              href="https://wa.me/265999000000"
              className="flex flex-col items-center p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <MessageCircle className="w-6 h-6 mb-2 text-green-600" />
              <span className="text-xs font-medium">WhatsApp</span>
              <span className="text-xs text-muted-foreground">Available 24/7</span>
            </a>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/10">
          <Truck className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-xs text-muted-foreground">
            Matola works offline for pages you&apos;ve visited before. Your pending shipments and actions are safely
            stored locally.
          </p>
        </div>
      </div>
    </div>
  )
}
