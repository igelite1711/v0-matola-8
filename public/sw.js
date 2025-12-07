// Service Worker for Matola PWA
// Implements caching strategies per PRD requirements

const CACHE_VERSION = "v2"
const APP_SHELL_CACHE = `matola-shell-${CACHE_VERSION}`
const DYNAMIC_CACHE = `matola-dynamic-${CACHE_VERSION}`
const IMAGE_CACHE = `matola-images-${CACHE_VERSION}`

// App shell files to cache immediately
const APP_SHELL_FILES = ["/", "/dashboard", "/offline", "/manifest.json"]

const DB_NAME = "matola-offline"
const PENDING_ACTIONS_STORE = "pendingActions"

// Install event - cache app shell
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...")
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => {
        console.log("[SW] Caching app shell")
        return cache.addAll(APP_SHELL_FILES)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return (
                name.startsWith("matola-") && name !== APP_SHELL_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE
              )
            })
            .map((name) => {
              console.log("[SW] Deleting old cache:", name)
              return caches.delete(name)
            }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) return

  // API requests - Network first with stale-while-revalidate
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE))
    return
  }

  // Images - Cache first with expiration
  if (request.destination === "image" || url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    event.respondWith(cacheFirstWithExpiration(request, IMAGE_CACHE, 7 * 24 * 60 * 60 * 1000))
    return
  }

  // App shell - Cache first
  if (APP_SHELL_FILES.includes(url.pathname) || url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, APP_SHELL_CACHE))
    return
  }

  // Default - Network first
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE))
})

// Cache-first strategy (for app shell)
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return caches.match("/offline")
  }
}

// Network-first with cache fallback (for API and dynamic content)
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName)

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/offline")
    }

    throw error
  }
}

// Cache-first with expiration (for images)
async function cacheFirstWithExpiration(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    const dateHeader = cachedResponse.headers.get("date")
    if (dateHeader) {
      const cachedDate = new Date(dateHeader).getTime()
      if (Date.now() - cachedDate < maxAge) {
        return cachedResponse
      }
    } else {
      return cachedResponse
    }
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag)

  if (event.tag === "sync-shipments" || event.tag === "sync-create_shipment") {
    event.waitUntil(syncPendingActions("create_shipment"))
  }

  if (event.tag === "sync-matches" || event.tag === "sync-accept_match") {
    event.waitUntil(syncPendingActions("accept_match"))
  }

  if (event.tag === "sync-update_status") {
    event.waitUntil(syncPendingActions("update_status"))
  }

  if (event.tag === "sync-all") {
    event.waitUntil(syncAllPendingActions())
  }
})

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

async function getPendingActions(type) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PENDING_ACTIONS_STORE, "readonly")
      const store = transaction.objectStore(PENDING_ACTIONS_STORE)

      if (type) {
        const index = store.index("type")
        const request = index.getAll(type)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      } else {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      }
    })
  } catch (error) {
    console.error("[SW] Failed to get pending actions:", error)
    return []
  }
}

async function removePendingAction(id) {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PENDING_ACTIONS_STORE, "readwrite")
      const store = transaction.objectStore(PENDING_ACTIONS_STORE)
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("[SW] Failed to remove pending action:", error)
  }
}

async function syncPendingActions(type) {
  console.log(`[SW] Syncing ${type || "all"} pending actions...`)

  const actions = await getPendingActions(type)
  console.log(`[SW] Found ${actions.length} pending actions`)

  for (const action of actions) {
    try {
      let response

      switch (action.type) {
        case "create_shipment":
          response = await fetch("/api/shipments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action.payload),
          })
          break

        case "accept_match":
          response = await fetch(`/api/matches/${action.payload.matchId}/accept`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
          break

        case "update_status":
          response = await fetch(`/api/shipments/${action.payload.shipmentId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: action.payload.status }),
          })
          break
      }

      if (response && response.ok) {
        await removePendingAction(action.id)
        console.log(`[SW] Synced action: ${action.id}`)
      } else {
        console.warn(`[SW] Failed to sync action: ${action.id}`)
      }
    } catch (error) {
      console.error(`[SW] Error syncing action ${action.id}:`, error)
    }
  }
}

async function syncAllPendingActions() {
  await syncPendingActions(null)
}

// Push notifications
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {}

  const options = {
    body: data.body || "New notification from Matola",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
    },
    actions: data.actions || [],
  }

  event.waitUntil(self.registration.showNotification(data.title || "Matola", options))
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const url = event.notification.data?.url || "/dashboard"

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "refresh-shipments") {
    event.waitUntil(refreshCachedData())
  }
})

async function refreshCachedData() {
  console.log("[SW] Refreshing cached data...")
  const cache = await caches.open(DYNAMIC_CACHE)

  // Refresh key API endpoints
  const endpoints = ["/api/shipments", "/api/health/ready"]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint)
      if (response.ok) {
        await cache.put(endpoint, response)
      }
    } catch (error) {
      console.warn(`[SW] Failed to refresh ${endpoint}`)
    }
  }
}
