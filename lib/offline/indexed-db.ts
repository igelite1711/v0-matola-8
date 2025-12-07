// IndexedDB wrapper for offline data storage
// Stores pending actions, cached shipments, and sync queue

const DB_NAME = "matola-offline"
const DB_VERSION = 1

export interface PendingAction {
  id: string
  type: "create_shipment" | "accept_match" | "update_status" | "payment"
  payload: Record<string, unknown>
  createdAt: number
  retryCount: number
  lastError?: string
}

export interface CachedShipment {
  id: string
  data: Record<string, unknown>
  cachedAt: number
  isStale: boolean
}

let dbInstance: IDBDatabase | null = null

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Pending actions queue
      if (!db.objectStoreNames.contains("pendingActions")) {
        const store = db.createObjectStore("pendingActions", { keyPath: "id" })
        store.createIndex("type", "type", { unique: false })
        store.createIndex("createdAt", "createdAt", { unique: false })
      }

      // Cached shipments
      if (!db.objectStoreNames.contains("cachedShipments")) {
        const store = db.createObjectStore("cachedShipments", { keyPath: "id" })
        store.createIndex("cachedAt", "cachedAt", { unique: false })
      }

      // Idempotency keys
      if (!db.objectStoreNames.contains("idempotencyKeys")) {
        const store = db.createObjectStore("idempotencyKeys", { keyPath: "key" })
        store.createIndex("expiresAt", "expiresAt", { unique: false })
      }
    }
  })
}

// Pending Actions Queue
export async function addPendingAction(
  action: Omit<PendingAction, "id" | "createdAt" | "retryCount">,
): Promise<string> {
  const db = await getDB()
  const id = `action-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  const pendingAction: PendingAction = {
    ...action,
    id,
    createdAt: Date.now(),
    retryCount: 0,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("pendingActions", "readwrite")
    const store = transaction.objectStore("pendingActions")
    const request = store.add(pendingAction)

    request.onsuccess = () => resolve(id)
    request.onerror = () => reject(request.error)
  })
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("pendingActions", "readonly")
    const store = transaction.objectStore("pendingActions")
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getPendingActionCount(): Promise<number> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("pendingActions", "readonly")
    const store = transaction.objectStore("pendingActions")
    const request = store.count()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function removePendingAction(id: string): Promise<void> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("pendingActions", "readwrite")
    const store = transaction.objectStore("pendingActions")
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function updatePendingActionRetry(id: string, error: string): Promise<void> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("pendingActions", "readwrite")
    const store = transaction.objectStore("pendingActions")
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const action = getRequest.result as PendingAction
      if (action) {
        action.retryCount++
        action.lastError = error
        const updateRequest = store.put(action)
        updateRequest.onsuccess = () => resolve()
        updateRequest.onerror = () => reject(updateRequest.error)
      } else {
        resolve()
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

// Cached Shipments
export async function cacheShipment(id: string, data: Record<string, unknown>): Promise<void> {
  const db = await getDB()

  const cached: CachedShipment = {
    id,
    data,
    cachedAt: Date.now(),
    isStale: false,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("cachedShipments", "readwrite")
    const store = transaction.objectStore("cachedShipments")
    const request = store.put(cached)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getCachedShipment(id: string): Promise<CachedShipment | null> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("cachedShipments", "readonly")
    const store = transaction.objectStore("cachedShipments")
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllCachedShipments(): Promise<CachedShipment[]> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("cachedShipments", "readonly")
    const store = transaction.objectStore("cachedShipments")
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function markShipmentsStale(): Promise<void> {
  const db = await getDB()
  const shipments = await getAllCachedShipments()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("cachedShipments", "readwrite")
    const store = transaction.objectStore("cachedShipments")

    let completed = 0
    for (const shipment of shipments) {
      shipment.isStale = true
      const request = store.put(shipment)
      request.onsuccess = () => {
        completed++
        if (completed === shipments.length) resolve()
      }
      request.onerror = () => reject(request.error)
    }

    if (shipments.length === 0) resolve()
  })
}

// Idempotency Keys
export async function checkIdempotencyKey(key: string): Promise<{ exists: boolean; response?: unknown }> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("idempotencyKeys", "readonly")
    const store = transaction.objectStore("idempotencyKeys")
    const request = store.get(key)

    request.onsuccess = () => {
      const result = request.result
      if (result && result.expiresAt > Date.now()) {
        resolve({ exists: true, response: result.response })
      } else {
        resolve({ exists: false })
      }
    }
    request.onerror = () => reject(request.error)
  })
}

export async function setIdempotencyKey(key: string, response: unknown, ttlMs = 24 * 60 * 60 * 1000): Promise<void> {
  const db = await getDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("idempotencyKeys", "readwrite")
    const store = transaction.objectStore("idempotencyKeys")
    const request = store.put({
      key,
      response,
      expiresAt: Date.now() + ttlMs,
    })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Cleanup expired entries
export async function cleanupExpiredData(): Promise<{ idempotencyKeys: number; staleShipments: number }> {
  const db = await getDB()
  let idempotencyKeysDeleted = 0
  let staleShipmentsDeleted = 0
  const now = Date.now()
  const staleThreshold = 7 * 24 * 60 * 60 * 1000 // 7 days

  // Clean idempotency keys
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("idempotencyKeys", "readwrite")
    const store = transaction.objectStore("idempotencyKeys")
    const index = store.index("expiresAt")
    const range = IDBKeyRange.upperBound(now)
    const request = index.openCursor(range)

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        cursor.delete()
        idempotencyKeysDeleted++
        cursor.continue()
      } else {
        resolve()
      }
    }
    request.onerror = () => reject(request.error)
  })

  // Clean old stale shipments
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("cachedShipments", "readwrite")
    const store = transaction.objectStore("cachedShipments")
    const index = store.index("cachedAt")
    const range = IDBKeyRange.upperBound(now - staleThreshold)
    const request = index.openCursor(range)

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        const shipment = cursor.value as CachedShipment
        if (shipment.isStale) {
          cursor.delete()
          staleShipmentsDeleted++
        }
        cursor.continue()
      } else {
        resolve()
      }
    }
    request.onerror = () => reject(request.error)
  })

  return { idempotencyKeys: idempotencyKeysDeleted, staleShipments: staleShipmentsDeleted }
}
