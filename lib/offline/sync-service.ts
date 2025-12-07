// Background sync service for offline-first functionality
// Syncs pending actions when network is restored

import { getPendingActions, removePendingAction, updatePendingActionRetry, type PendingAction } from "./indexed-db"

const MAX_RETRIES = 3
const SYNC_INTERVAL = 30000 // 30 seconds

class SyncService {
  private isOnline = true
  private syncInterval: NodeJS.Timeout | null = null
  private listeners: Set<(status: SyncStatus) => void> = new Set()

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine
      window.addEventListener("online", this.handleOnline)
      window.addEventListener("offline", this.handleOffline)
    }
  }

  private handleOnline = () => {
    this.isOnline = true
    this.notifyListeners({ online: true, syncing: true, pendingCount: 0 })
    this.syncNow()
  }

  private handleOffline = () => {
    this.isOnline = false
    this.notifyListeners({ online: false, syncing: false, pendingCount: 0 })
  }

  // Start periodic sync
  startPeriodicSync() {
    if (this.syncInterval) return

    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncNow()
      }
    }, SYNC_INTERVAL)

    // Initial sync
    if (this.isOnline) {
      this.syncNow()
    }
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Manual sync trigger
  async syncNow(): Promise<SyncResult> {
    if (!this.isOnline) {
      return { success: false, synced: 0, failed: 0, pending: 0 }
    }

    const pendingActions = await getPendingActions()

    if (pendingActions.length === 0) {
      this.notifyListeners({ online: true, syncing: false, pendingCount: 0 })
      return { success: true, synced: 0, failed: 0, pending: 0 }
    }

    this.notifyListeners({ online: true, syncing: true, pendingCount: pendingActions.length })

    let synced = 0
    let failed = 0

    for (const action of pendingActions) {
      try {
        await this.processAction(action)
        await removePendingAction(action.id)
        synced++
      } catch (error) {
        failed++
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        if (action.retryCount >= MAX_RETRIES) {
          // Move to dead letter queue or notify user
          console.error(`Action ${action.id} failed after ${MAX_RETRIES} retries:`, errorMessage)
          await removePendingAction(action.id)
        } else {
          await updatePendingActionRetry(action.id, errorMessage)
        }
      }
    }

    const remaining = await getPendingActions()
    this.notifyListeners({ online: true, syncing: false, pendingCount: remaining.length })

    return {
      success: failed === 0,
      synced,
      failed,
      pending: remaining.length,
    }
  }

  private async processAction(action: PendingAction): Promise<void> {
    const endpoints: Record<PendingAction["type"], string> = {
      create_shipment: "/api/shipments",
      accept_match: "/api/matches/accept",
      update_status: "/api/shipments/status",
      payment: "/api/payments",
    }

    const endpoint = endpoints[action.type]
    if (!endpoint) {
      throw new Error(`Unknown action type: ${action.type}`)
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": action.id,
      },
      body: JSON.stringify(action.payload),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API error: ${response.status} - ${error}`)
    }
  }

  // Subscribe to sync status changes
  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  private notifyListeners(status: SyncStatus) {
    this.listeners.forEach((callback) => callback(status))
  }

  // Get current status
  async getStatus(): Promise<SyncStatus> {
    const pending = await getPendingActions()
    return {
      online: this.isOnline,
      syncing: false,
      pendingCount: pending.length,
    }
  }
}

export interface SyncStatus {
  online: boolean
  syncing: boolean
  pendingCount: number
}

export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  pending: number
}

export const syncService = new SyncService()
