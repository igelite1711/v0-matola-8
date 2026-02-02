/**
 * Start Background Workers
 * Run this script to start processing background jobs
 * Usage: tsx scripts/start-workers.ts
 */

import "@/lib/workers/worker"

console.log("Background workers started")
console.log("- Matching worker: Processing shipment matching jobs")
console.log("- Notification worker: Processing notification jobs")
console.log("- Cleanup worker: Processing cleanup jobs")

// Keep process alive
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down workers...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down workers...")
  process.exit(0)
})

