/**
 * Cleanup Job Processor
 * Handles periodic cleanup tasks
 */

import { Job } from "bullmq"
import { prisma } from "@/lib/db/prisma"

interface CleanupJobData {
  type: "expired-sessions" | "expired-matches" | "old-notifications" | "audit-logs"
}

export async function processCleanupJob(job: Job<CleanupJobData>) {
  const { type } = job.data

  try {
    switch (type) {
      case "expired-sessions": {
        // Delete USSD sessions older than 1 hour
        const deleted = await prisma.uSSDSession.deleteMany({
          where: {
            expiresAt: {
              lt: new Date(),
            },
          },
        })

        return { deleted: deleted.count, type: "expired-sessions" }
      }

      case "expired-matches": {
        // Mark matches as expired if older than 24 hours and still pending
        const expired = await prisma.match.updateMany({
          where: {
            status: "pending",
            createdAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
            },
          },
          data: {
            status: "expired",
          },
        })

        return { expired: expired.count, type: "expired-matches" }
      }

      case "old-notifications": {
        // Delete read notifications older than 30 days
        const deleted = await prisma.notification.deleteMany({
          where: {
            read: true,
            createdAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          },
        })

        return { deleted: deleted.count, type: "old-notifications" }
      }

      case "audit-logs": {
        // Delete audit logs older than 90 days
        const deleted = await prisma.auditLog.deleteMany({
          where: {
            createdAt: {
              lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            },
          },
        })

        return { deleted: deleted.count, type: "audit-logs" }
      }

      default:
        throw new Error(`Unknown cleanup type: ${type}`)
    }
  } catch (error) {
    console.error(`Error processing cleanup job:`, error)
    throw error
  }
}

