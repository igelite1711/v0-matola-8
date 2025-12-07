"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker after page load
      window.addEventListener("load", async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          })

          console.log("[PWA] Service worker registered:", registration.scope)

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content available, show update prompt
                  console.log("[PWA] New content available, refresh to update")
                }
              })
            }
          })
        } catch (error) {
          console.error("[PWA] Service worker registration failed:", error)
        }
      })

      // Handle controller change (new service worker took over)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[PWA] New service worker activated")
      })
    }
  }, [])

  return null
}
