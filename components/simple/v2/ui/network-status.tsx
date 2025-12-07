"use client"

import { useState, useEffect } from "react"
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-language"

export function NetworkStatus() {
  const { language } = useTranslation()
  const [isOnline, setIsOnline] = useState(true)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowReconnected(true)
      setTimeout(() => setShowReconnected(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowReconnected(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline && !showReconnected) return null

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 transition-all duration-300",
        !isOnline ? "bg-warning/90 text-warning-foreground" : "bg-success/90 text-white",
      )}
    >
      {!isOnline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            {language === "ny" ? "Simuli pa intaneti - Mungagwiritsirebe ntchito" : "You're offline - App still works"}
          </span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">{language === "ny" ? "Mwabwerera pa intaneti" : "Back online"}</span>
        </>
      )}
    </div>
  )
}

// Sync indicator for offline changes
export function SyncStatus({ pendingChanges = 0 }: { pendingChanges?: number }) {
  const { language } = useTranslation()
  const [isSyncing, setIsSyncing] = useState(false)

  if (pendingChanges === 0 && !isSyncing) return null

  return (
    <div className="fixed bottom-24 right-4 z-40">
      <div className="flex items-center gap-2 rounded-full bg-card border border-border px-3 py-2 shadow-lg">
        <RefreshCw className={cn("h-4 w-4 text-primary", isSyncing && "animate-spin")} />
        <span className="text-xs text-muted-foreground">
          {isSyncing
            ? language === "ny"
              ? "Ikugwirizana..."
              : "Syncing..."
            : `${pendingChanges} ${language === "ny" ? "zomwe zinasintha" : "pending"}`}
        </span>
      </div>
    </div>
  )
}
