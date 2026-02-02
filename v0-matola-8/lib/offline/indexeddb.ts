/**
 * IndexedDB Offline Storage
 * Provides offline data persistence and sync capabilities
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface MatolaDB extends DBSchema {
  shipments: {
    key: string
    value: {
      id: string
      data: any
      synced: boolean
      lastModified: number
    }
  }
  bids: {
    key: string
    value: {
      id: string
      data: any
      synced: boolean
      lastModified: number
    }
  }
  notifications: {
    key: string
    value: {
      id: string
      data: any
      synced: boolean
      lastModified: number
    }
  }
  syncQueue: {
    key: string
    value: {
      id: string
      action: 'create' | 'update' | 'delete'
      entity: 'shipment' | 'bid' | 'notification'
      data: any
      timestamp: number
      retries: number
    }
  }
}

class OfflineStorage {
  private db: IDBPDatabase<MatolaDB> | null = null
  private dbName = 'matola-offline'
  private version = 1

  async init(): Promise<void> {
    if (this.db) return

    this.db = await openDB<MatolaDB>(this.dbName, this.version, {
      upgrade(db) {
        // Shipments store
        if (!db.objectStoreNames.contains('shipments')) {
          const shipmentStore = db.createObjectStore('shipments', { keyPath: 'id' })
          shipmentStore.createIndex('synced', 'synced')
          shipmentStore.createIndex('lastModified', 'lastModified')
        }

        // Bids store
        if (!db.objectStoreNames.contains('bids')) {
          const bidStore = db.createObjectStore('bids', { keyPath: 'id' })
          bidStore.createIndex('synced', 'synced')
          bidStore.createIndex('lastModified', 'lastModified')
        }

        // Notifications store
        if (!db.objectStoreNames.contains('notifications')) {
          const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' })
          notificationStore.createIndex('synced', 'synced')
          notificationStore.createIndex('lastModified', 'lastModified')
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
          syncStore.createIndex('timestamp', 'timestamp')
          syncStore.createIndex('retries', 'retries')
        }
      },
    })
  }

  /**
   * Save shipment to offline storage
   */
  async saveShipment(shipment: any): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    await this.db.put('shipments', {
      id: shipment.id || `offline_${Date.now()}`,
      data: shipment,
      synced: false,
      lastModified: Date.now(),
    })
  }

  /**
   * Get all shipments from offline storage
   */
  async getShipments(): Promise<any[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const shipments = await this.db.getAll('shipments')
    return shipments.map((s) => s.data)
  }

  /**
   * Get unsynced shipments
   */
  async getUnsyncedShipments(): Promise<any[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const index = this.db.transaction('shipments').store.index('synced')
    const shipments = await index.getAll(false)
    return shipments.map((s) => s.data)
  }

  /**
   * Mark shipment as synced
   */
  async markShipmentSynced(id: string): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const shipment = await this.db.get('shipments', id)
    if (shipment) {
      shipment.synced = true
      await this.db.put('shipments', shipment)
    }
  }

  /**
   * Save bid to offline storage
   */
  async saveBid(bid: any): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    await this.db.put('bids', {
      id: bid.id || `offline_${Date.now()}`,
      data: bid,
      synced: false,
      lastModified: Date.now(),
    })
  }

  /**
   * Get all bids from offline storage
   */
  async getBids(): Promise<any[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const bids = await this.db.getAll('bids')
    return bids.map((b) => b.data)
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(
    action: 'create' | 'update' | 'delete',
    entity: 'shipment' | 'bid' | 'notification',
    data: any,
  ): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    await this.db.add('syncQueue', {
      action,
      entity,
      data,
      timestamp: Date.now(),
      retries: 0,
    })
  }

  /**
   * Get sync queue items
   */
  async getSyncQueue(): Promise<any[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    return await this.db.getAll('syncQueue')
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(id: number): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    await this.db.delete('syncQueue', id)
  }

  /**
   * Increment retry count for sync queue item
   */
  async incrementSyncRetry(id: number): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    const item = await this.db.get('syncQueue', id)
    if (item) {
      item.retries += 1
      await this.db.put('syncQueue', item)
    }
  }

  /**
   * Clear all offline data
   */
  async clear(): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')

    await this.db.clear('shipments')
    await this.db.clear('bids')
    await this.db.clear('notifications')
    await this.db.clear('syncQueue')
  }
}

export const offlineStorage = new OfflineStorage()

