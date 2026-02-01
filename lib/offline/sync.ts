/**
 * Offline Sync Service
 * Handles synchronization of offline data with server
 */

import { offlineStorage } from './indexeddb'
import { api } from '../api/client'

class SyncService {
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null

  /**
   * Start automatic sync (every 30 seconds when online)
   */
  startAutoSync(): void {
    if (this.syncInterval) return

    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.sync()
      }
    }, 30000) // Sync every 30 seconds
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /**
   * Manual sync trigger
   */
  async sync(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) {
      return
    }

    this.isSyncing = true

    try {
      // Sync shipments
      await this.syncShipments()

      // Sync bids
      await this.syncBids()

      // Process sync queue
      await this.processSyncQueue()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Sync shipments
   */
  private async syncShipments(): Promise<void> {
    const unsynced = await offlineStorage.getUnsyncedShipments()

    for (const shipment of unsynced) {
      try {
        if (shipment.id?.startsWith('offline_')) {
          // New shipment - create on server
          const response = await api.shipments.create(shipment.data)
          await offlineStorage.markShipmentSynced(response.shipment.id)
        } else {
          // Existing shipment - update on server
          await api.shipments.update(shipment.id, shipment.data)
          await offlineStorage.markShipmentSynced(shipment.id)
        }
      } catch (error) {
        console.error(`Failed to sync shipment ${shipment.id}:`, error)
        // Will retry on next sync
      }
    }
  }

  /**
   * Sync bids
   */
  private async syncBids(): Promise<void> {
    const unsynced = await offlineStorage.getBids()
    const unsyncedBids = unsynced.filter((b) => !b.synced)

    for (const bid of unsyncedBids) {
      try {
        if (bid.id?.startsWith('offline_')) {
          // New bid - submit to server
          await api.bids.submit(bid.data)
          await offlineStorage.markShipmentSynced(bid.id) // Reuse method
        }
      } catch (error) {
        console.error(`Failed to sync bid ${bid.id}:`, error)
      }
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    const queue = await offlineStorage.getSyncQueue()

    for (const item of queue) {
      try {
        // Process based on entity type
        switch (item.entity) {
          case 'shipment':
            if (item.action === 'create') {
              await api.shipments.create(item.data)
            } else if (item.action === 'update') {
              await api.shipments.update(item.data.id, item.data)
            }
            break
          case 'bid':
            if (item.action === 'create') {
              await api.bids.submit(item.data)
            }
            break
        }

        // Remove from queue on success
        await offlineStorage.removeFromSyncQueue(item.id)
      } catch (error) {
        console.error(`Failed to process sync queue item ${item.id}:`, error)
        await offlineStorage.incrementSyncRetry(item.id)

        // Remove if too many retries
        if (item.retries >= 5) {
          await offlineStorage.removeFromSyncQueue(item.id)
        }
      }
    }
  }
}

export const syncService = new SyncService()

// Auto-start sync when module loads (browser only)
if (typeof window !== 'undefined') {
  syncService.startAutoSync()

  // Also sync when coming back online
  window.addEventListener('online', () => {
    syncService.sync()
  })
}
