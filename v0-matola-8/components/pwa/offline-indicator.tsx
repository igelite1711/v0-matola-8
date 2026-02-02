"use client"

import { useState, useEffect } from "react"
import { WifiOff, RefreshCw, Cloud, CloudOff } from "lucide-react"
import { getPendingActionCount } from "@/lib/offline/indexed-db"
import { syncPendingActions } from "@/lib/offline/sync-queue"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  // Track online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)

    setIsOnline(navigator.onLine)

    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  // Update pending count
  useEffect(() => {
    const updatePendingCount = async () => {
      try {
        const count = await getPendingActionCount()
        setPendingCount(count)
      } catch {
        // IndexedDB not available
      }
    }

    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000)
    return () => clearInterval(interval)
  }, [])

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      handleSync()
    }
  }, [isOnline])

  const handleSync = async () => {
    if (isSyncing || !isOnline) return

    setIsSyncing(true)
    setSyncProgress(0)

    try {
      const results = await syncPendingActions()
      const successCount = results.filter((r) => r.success).length
      setSyncProgress(100)
      setLastSyncTime(new Date())

      // Update pending count
      const remaining = await getPendingActionCount()
      setPendingCount(remaining)

      console.log(`[Sync] Completed: ${successCount}/${results.length} succeeded`)
    } catch (error) {
      console.error("[Sync] Failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Don't show anything if online with no pending actions
  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={isOnline ? "ghost" : "destructive"} size="sm" className="relative gap-2">
          {isOnline ? (
            <>
              <Cloud className="h-4 w-4" />
              {pendingCount > 0 && (
                <Badge variant="secondary" className="h-5 min-w-[20px] px-1">
                  {pendingCount}
                </Badge>
              )}
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span className="text-xs">Offline</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Cloud className="h-5 w-5 text-green-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-destructive" />
            )}
            <div>
              <p className="font-medium">{isOnline ? "Connected" : "Offline"}</p>
              <p className="text-xs text-muted-foreground">
                {isOnline ? "All systems operational" : "Changes will sync when online"}
              </p>
            </div>
          </div>

          {/* Pending Actions */}
          {pendingCount > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Actions</span>
                <Badge variant="outline">{pendingCount}</Badge>
              </div>

              {isSyncing && (
                <div className="space-y-1">
                  <Progress value={syncProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">Syncing...</p>
                </div>
              )}

              {isOnline && !isSyncing && (
                <Button size="sm" variant="outline" className="w-full bg-transparent" onClick={handleSync}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              )}
            </div>
          )}

          {/* Last Sync Time */}
          {lastSyncTime && (
            <p className="text-xs text-muted-foreground">Last synced: {lastSyncTime.toLocaleTimeString()}</p>
          )}

          {/* Offline Tips */}
          {!isOnline && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Tip:</strong> Your actions are saved locally and will automatically sync when you&apos;re back
                online.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
