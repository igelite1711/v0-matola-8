// Offline sync queue for managing pending actions
// Handles background sync with retry logic

import {
  addPendingAction,
  getPendingActions,
  removePendingAction,
  updatePendingActionRetry,
  type PendingAction,
} from "./indexed-db"

const MAX_RETRY_ATTEMPTS = 5
const RETRY_DELAYS = [1000, 5000, 15000, 60000, 300000] // 1s, 5s, 15s, 1m, 5m

export interface SyncResult {
  actionId: string
  success: boolean
  error?: string
}

type SyncHandler = (payload: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>

const syncHandlers: Map<string, SyncHandler> = new Map()

// Register sync handlers for different action types
export function registerSyncHandler(type: string, handler: SyncHandler): void {
  syncHandlers.set(type, handler)
}

// Queue an action for offline sync
export async function queueAction(type: PendingAction["type"], payload: Record<string, unknown>): Promise<string> {
  const actionId = await addPendingAction({ type, payload })

  // Try to sync immediately if online
  if (navigator.onLine) {
    syncPendingActions()
  } else {
    // Register for background sync
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const registration = await navigator.serviceWorker.ready
      try {
        await (registration as any).sync.register(`sync-${type}`)
      } catch {
        // Background sync not supported or permission denied
        console.warn("[SyncQueue] Background sync registration failed")
      }
    }
  }

  return actionId
}

// Process all pending actions
export async function syncPendingActions(): Promise<SyncResult[]> {
  const results: SyncResult[] = []
  const actions = await getPendingActions()

  // Sort by createdAt to process in order
  actions.sort((a, b) => a.createdAt - b.createdAt)

  for (const action of actions) {
    const result = await processAction(action)
    results.push(result)

    // Small delay between actions to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  return results
}

async function processAction(action: PendingAction): Promise<SyncResult> {
  const handler = syncHandlers.get(action.type)

  if (!handler) {
    console.error(`[SyncQueue] No handler for action type: ${action.type}`)
    return { actionId: action.id, success: false, error: "No handler registered" }
  }

  if (action.retryCount >= MAX_RETRY_ATTEMPTS) {
    console.error(`[SyncQueue] Max retries exceeded for action: ${action.id}`)
    // Move to dead letter queue (keep in DB but don't process)
    return { actionId: action.id, success: false, error: "Max retries exceeded" }
  }

  try {
    const result = await handler(action.payload)

    if (result.success) {
      await removePendingAction(action.id)
      return { actionId: action.id, success: true }
    } else {
      await updatePendingActionRetry(action.id, result.error || "Unknown error")

      // Schedule retry with exponential backoff
      const delay = RETRY_DELAYS[Math.min(action.retryCount, RETRY_DELAYS.length - 1)]
      setTimeout(() => processAction({ ...action, retryCount: action.retryCount + 1 }), delay)

      return { actionId: action.id, success: false, error: result.error }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await updatePendingActionRetry(action.id, errorMessage)
    return { actionId: action.id, success: false, error: errorMessage }
  }
}

// Default sync handlers for common actions
export function initDefaultHandlers(): void {
  // Create shipment handler
  registerSyncHandler("create_shipment", async (payload) => {
    try {
      const response = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        return { success: true }
      } else {
        const data = await response.json()
        return { success: false, error: data.error || `HTTP ${response.status}` }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Network error" }
    }
  })

  // Accept match handler
  registerSyncHandler("accept_match", async (payload) => {
    try {
      const response = await fetch(`/api/matches/${payload.matchId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        return { success: true }
      } else {
        const data = await response.json()
        // Don't retry if match is no longer available
        if (data.code === "MATCH_UNAVAILABLE") {
          return { success: true } // Remove from queue
        }
        return { success: false, error: data.error || `HTTP ${response.status}` }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Network error" }
    }
  })

  // Update status handler
  registerSyncHandler("update_status", async (payload) => {
    try {
      const response = await fetch(`/api/shipments/${payload.shipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: payload.status }),
      })

      if (response.ok) {
        return { success: true }
      } else {
        const data = await response.json()
        return { success: false, error: data.error || `HTTP ${response.status}` }
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Network error" }
    }
  })
}

// Listen for online/offline events
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("[SyncQueue] Back online, syncing pending actions...")
    syncPendingActions()
  })

  // Initialize default handlers
  initDefaultHandlers()
}
