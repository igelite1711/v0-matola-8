/**
 * Background Workers
 * Processes jobs from queues
 */

import { Worker } from "bullmq"
import { matchingQueue, notificationQueue, cleanupQueue, redisConnection } from "@/lib/queue/queue"
import { processMatchingJob } from "@/lib/jobs/matching-job"
import { processNotificationJob } from "@/lib/jobs/notification-job"
import { processCleanupJob } from "@/lib/jobs/cleanup-job"

// Matching worker
export const matchingWorker = new Worker("matching", processMatchingJob, {
  connection: redisConnection,
  concurrency: 5, // Process 5 matching jobs concurrently
  limiter: {
    max: 10,
    duration: 1000, // Max 10 jobs per second
  },
})

// Notification worker
export const notificationWorker = new Worker("notifications", processNotificationJob, {
  connection: redisConnection,
  concurrency: 10, // Process 10 notifications concurrently
  limiter: {
    max: 50,
    duration: 1000, // Max 50 notifications per second
  },
})

// Cleanup worker
export const cleanupWorker = new Worker("cleanup", processCleanupJob, {
  connection: redisConnection,
  concurrency: 1, // Process cleanup jobs one at a time
})

// Event handlers
matchingWorker.on("completed", (job) => {
  console.log(`Matching job ${job.id} completed`)
})

matchingWorker.on("failed", (job, err) => {
  console.error(`Matching job ${job?.id} failed:`, err)
})

notificationWorker.on("completed", (job) => {
  console.log(`Notification job ${job.id} completed`)
})

notificationWorker.on("failed", (job, err) => {
  console.error(`Notification job ${job?.id} failed:`, err)
})

cleanupWorker.on("completed", (job) => {
  console.log(`Cleanup job ${job.id} completed`)
})

// Start workers (only in server environment)
if (typeof window === "undefined") {
  console.log("Background workers started")
}
