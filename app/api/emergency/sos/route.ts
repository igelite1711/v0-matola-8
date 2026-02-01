/**
 * Emergency SOS API
 * POST /api/emergency/sos - Trigger emergency alert
 */

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/middleware"
import { createEmergencySchema } from "@/lib/validators/api-schemas"
import { notificationQueue } from "@/lib/queue/queue"
import { sendSMS } from "@/lib/notifications/sms-service"
import { sendWhatsAppMessage } from "@/lib/notifications/whatsapp-service"
import { logger } from "@/lib/monitoring/logger"

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    const body = await request.json()
    const data = createEmergencySchema.parse(body)

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get shipment details if provided
    let shipment = null
    if (data.shipmentId) {
      shipment = await prisma.shipment.findUnique({
        where: { id: data.shipmentId },
        include: {
          shipper: {
            select: { name: true, phone: true },
          },
          matches: {
            where: { status: "accepted" },
            include: {
              transporter: {
                select: { name: true, phone: true },
              },
            },
            take: 1,
          },
        },
      })
    }

    // Emergency message
    const emergencyMessage = `🚨 EMERGENCY ALERT 🚨\n\n` +
      `User: ${user.name} (${user.phone})\n` +
      `Type: ${data.type}\n` +
      `Location: ${data.location.lat}, ${data.location.lng}\n` +
      (data.location.address ? `Address: ${data.location.address}\n` : "") +
      (data.message ? `Message: ${data.message}\n` : "") +
      (shipment ? `Shipment: ${shipment.reference}\n` : "")

    // Send SMS to emergency contacts
    const emergencyContacts = [
      "+265997123456", // Police
      "+265998123456", // Ambulance
      "+265999123456", // Matola Support
    ]

    for (const contact of emergencyContacts) {
      await sendSMS(contact, emergencyMessage)
    }

    // Notify other party if shipment exists
    if (shipment) {
      const otherParty = shipment.shipperId === auth.userId
        ? shipment.matches[0]?.transporter
        : shipment.shipper

      if (otherParty) {
        await sendWhatsAppMessage(
          otherParty.phone,
          `🚨 Emergency Alert from ${user.name}\n\n${data.message || "Please check on them immediately."}\n\nLocation: ${data.location.lat}, ${data.location.lng}`,
        )
      }
    }

    // Queue notification to Matola support team
    await notificationQueue.add("emergency-alert", {
      userId: auth.userId,
      userName: user.name,
      userPhone: user.phone,
      type: data.type,
      location: data.location,
      message: data.message,
      shipmentId: data.shipmentId,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: auth.userId,
        action: "emergency_sos",
        resource: "emergency",
        details: {
          type: data.type,
          location: data.location,
          shipmentId: data.shipmentId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "Emergency alert sent",
      alertId: `sos-${Date.now()}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    logger.error("Error processing emergency SOS", {
      userId: auth?.userId,
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
