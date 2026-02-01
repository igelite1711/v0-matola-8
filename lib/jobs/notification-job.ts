/**
 * Notification Job Processor
 * Handles sending notifications via multiple channels
 */

import { Job } from "bullmq"
import { prisma } from "@/lib/db/prisma"
import { sendSMS } from "@/lib/notifications/sms-service"
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp-service"
import { sendPushNotification } from "@/lib/notifications/push-service"

interface MatchFoundNotificationData {
  matchId: string
  shipmentId: string
  transporterId: string
  transporterPhone: string
  shipmentReference: string
  origin: string
  destination: string
  weight: number
  price: number
  priority?: "high" | "normal"
}

interface PaymentNotificationData {
  userId: string
  userPhone: string
  paymentId: string
  amount: number
  status: "completed" | "failed"
  method: string
}

interface ShipmentUpdateNotificationData {
  userId: string
  userPhone: string
  shipmentId: string
  shipmentReference: string
  status: string
  message: string
}

type NotificationJobData =
  | { type: "match-found-high-priority"; data: MatchFoundNotificationData }
  | { type: "match-found-normal"; data: MatchFoundNotificationData }
  | { type: "payment-update"; data: PaymentNotificationData }
  | { type: "shipment-update"; data: ShipmentUpdateNotificationData }

export async function processNotificationJob(job: Job<NotificationJobData>) {
  const { type, data } = job.data

  try {
    switch (type) {
      case "match-found-high-priority": {
        const notificationData = data as MatchFoundNotificationData

        // Send SMS (high priority only)
        await sendSMS(
          notificationData.transporterPhone,
          `Matola: New load ${notificationData.origin}→${notificationData.destination}, ${notificationData.weight}kg, MK${notificationData.price.toLocaleString()}. Check *384*628652# or WhatsApp.`,
        )

        // Send WhatsApp
        await sendWhatsAppMessage(
          notificationData.transporterPhone,
          `🚚 *New Load Available*\n\n` +
            `Ref: ${notificationData.shipmentReference}\n` +
            `Route: ${notificationData.origin} → ${notificationData.destination}\n` +
            `Weight: ${notificationData.weight}kg\n` +
            `Price: MK ${notificationData.price.toLocaleString()}\n\n` +
            `Reply ACCEPT to accept this load.`,
        )

        // Send push notification
        await sendPushNotification(notificationData.transporterId, {
          title: "New Load Available",
          body: `${notificationData.origin} → ${notificationData.destination}, ${notificationData.weight}kg`,
          data: {
            type: "match-found",
            matchId: notificationData.matchId,
            shipmentId: notificationData.shipmentId,
          },
        })

        // Create notification record
        await prisma.notification.create({
          data: {
            userId: notificationData.transporterId,
            type: "match_found",
            title: "New Load Available",
            message: `Load from ${notificationData.origin} to ${notificationData.destination}`,
            data: {
              matchId: notificationData.matchId,
              shipmentId: notificationData.shipmentId,
            },
            channels: ["sms", "whatsapp", "push"],
          },
        })

        break
      }

      case "match-found-normal": {
        const notificationData = data as MatchFoundNotificationData

        // Send WhatsApp only (no SMS for normal priority)
        await sendWhatsAppMessage(
          notificationData.transporterPhone,
          `🚚 *New Load Available*\n\n` +
            `Ref: ${notificationData.shipmentReference}\n` +
            `Route: ${notificationData.origin} → ${notificationData.destination}\n` +
            `Weight: ${notificationData.weight}kg\n` +
            `Price: MK ${notificationData.price.toLocaleString()}\n\n` +
            `Reply ACCEPT to accept this load.`,
        )

        // Send push notification
        await sendPushNotification(notificationData.transporterId, {
          title: "New Load Available",
          body: `${notificationData.origin} → ${notificationData.destination}`,
          data: {
            type: "match-found",
            matchId: notificationData.matchId,
            shipmentId: notificationData.shipmentId,
          },
        })

        // Create notification record
        await prisma.notification.create({
          data: {
            userId: notificationData.transporterId,
            type: "match_found",
            title: "New Load Available",
            message: `Load from ${notificationData.origin} to ${notificationData.destination}`,
            data: {
              matchId: notificationData.matchId,
              shipmentId: notificationData.shipmentId,
            },
            channels: ["whatsapp", "push"],
          },
        })

        break
      }

      case "payment-update": {
        const paymentData = data as PaymentNotificationData

        const message =
          paymentData.status === "completed"
            ? `Payment of MK ${paymentData.amount.toLocaleString()} via ${paymentData.method} completed successfully.`
            : `Payment of MK ${paymentData.amount.toLocaleString()} via ${paymentData.method} failed. Please try again.`

        await sendWhatsAppMessage(paymentData.userPhone, message)

        await sendPushNotification(paymentData.userId, {
          title: paymentData.status === "completed" ? "Payment Successful" : "Payment Failed",
          body: message,
          data: {
            type: "payment-update",
            paymentId: paymentData.paymentId,
            status: paymentData.status,
          },
        })

        await prisma.notification.create({
          data: {
            userId: paymentData.userId,
            type: "payment_update",
            title: paymentData.status === "completed" ? "Payment Successful" : "Payment Failed",
            message,
            data: {
              paymentId: paymentData.paymentId,
              status: paymentData.status,
            },
            channels: ["whatsapp", "push"],
          },
        })

        break
      }

      case "shipment-update": {
        const updateData = data as ShipmentUpdateNotificationData

        await sendWhatsAppMessage(updateData.userPhone, updateData.message)

        await sendPushNotification(updateData.userId, {
          title: "Shipment Update",
          body: updateData.message,
          data: {
            type: "shipment-update",
            shipmentId: updateData.shipmentId,
            status: updateData.status,
          },
        })

        await prisma.notification.create({
          data: {
            userId: updateData.userId,
            type: "shipment_update",
            title: "Shipment Update",
            message: updateData.message,
            data: {
              shipmentId: updateData.shipmentId,
              status: updateData.status,
            },
            channels: ["whatsapp", "push"],
          },
        })

        break
      }

      default:
        throw new Error(`Unknown notification type: ${(job.data as any).type}`)
    }

    return { success: true, type }
  } catch (error) {
    console.error(`Error processing notification job:`, error)
    throw error
  }
}
