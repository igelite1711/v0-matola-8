/**
 * Background Job Queue Configuration
 * Uses BullMQ with Redis for reliable job processing
 */

import { Queue, Worker, QueueEvents } from "bullmq"
import { Redis } from "ioredis"

// Redis connection
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

// Queue definitions
export const matchingQueue = new Queue("matching", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
  },
})

export const notificationQueue = new Queue("notifications", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600,
      count: 5000,
    },
  },
})

export const cleanupQueue = new Queue("cleanup", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: {
      age: 1800,
      count: 100,
    },
  },
})

// Queue events for monitoring
export const matchingQueueEvents = new QueueEvents("matching", {
  connection: redisConnection,
})

export const notificationQueueEvents = new QueueEvents("notifications", {
  connection: redisConnection,
})

// Export Redis connection for other uses
export { redisConnection }

