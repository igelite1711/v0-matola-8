/**
 * Service Worker for Matola PWA
 * PRD Requirements: Offline-first PWA architecture
 */

const CACHE_NAME = "matola-v1"
const OFFLINE_PAGE = "/offline"

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      )
    }),
  )
  return self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  // API requests - network only (no caching)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return offline response for API calls
        return new Response(
          JSON.stringify({ error: "Offline", message: "Please check your connection" }),
          {
            headers: { "Content-Type": "application/json" },
          },
        )
      }),
    )
    return
  }

  // Static assets - cache first, fallback to network
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/) ||
    url.pathname.startsWith("/_next/static")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      }),
    )
    return
  }

  // HTML pages - network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached
          }
          // Fallback to offline page
          return caches.match(OFFLINE_PAGE)
        })
      }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-shipments") {
    event.waitUntil(syncShipments())
  }
})

async function syncShipments() {
  // Sync pending shipments when online
  // This would integrate with IndexedDB sync queue
  try {
    // Implementation would sync pending actions from IndexedDB
    console.log("Syncing shipments...")
  } catch (error) {
    console.error("Sync error:", error)
  }
}

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {}
  const title = data.title || "Matola"
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: data.url || "/",
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data || "/"),
  )
})
