/**
 * Matching Job Processor
 * Processes shipment matching in the background
 */

import { Job } from "bullmq"
import { prisma } from "@/lib/db/prisma"
import { matchingService } from "@/lib/matching-service"
import { notificationQueue } from "@/lib/queue/queue"

interface MatchingJobData {
  shipmentId: string
  priority?: "high" | "normal"
}

export async function processMatchingJob(job: Job<MatchingJobData>) {
  const { shipmentId, priority = "normal" } = job.data

  try {
    // Fetch shipment with shipper details
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        shipper: true,
      },
    })

    if (!shipment) {
      throw new Error(`Shipment ${shipmentId} not found`)
    }

    // Only match pending shipments
    if (shipment.status !== "posted" && shipment.status !== "pending") {
      return { skipped: true, reason: `Shipment status is ${shipment.status}` }
    }

    // Fetch available transporters
    const transporters = await prisma.user.findMany({
      where: {
        role: "transporter",
        verified: true,
        transporterProfile: {
          isAvailable: true,
        },
      },
      include: {
        transporterProfile: true,
        vehicles: {
          where: {
            capacity: {
              gte: shipment.weight,
            },
          },
        },
      },
    })

    if (transporters.length === 0) {
      return { matched: false, reason: "No available transporters" }
    }

    // Convert to matching service format
    const transporterCandidates = transporters
      .filter((t) => t.transporterProfile && t.vehicles.length > 0)
      .map((t) => ({
        userId: t.id,
        name: t.name,
        phone: t.phone,
        rating: t.rating,
        totalRatings: t.totalRatings,
        verified: t.verified,
        vehicleType: t.transporterProfile!.vehicleType,
        vehicleCapacity: t.transporterProfile!.vehicleCapacity,
        currentCity: t.transporterProfile!.currentCity || undefined,
        currentRegion: t.transporterProfile!.currentRegion || undefined,
        completedTrips: t.transporterProfile!.completedTrips,
        onTimeRate: t.transporterProfile!.onTimeRate,
      }))

    // Find matches using matching service
    const matches = await matchingService.findMatches(
      {
        id: shipment.id,
        originCity: shipment.originCity,
        destinationCity: shipment.destinationCity,
        weight: shipment.weight,
        cargoType: shipment.cargoType,
        requiredVehicleType: shipment.requiredVehicleType,
        pickupDate: shipment.pickupDate,
        price: shipment.price,
      },
      transporterCandidates,
      {
        maxMatches: 10,
        minScore: 30,
      },
    )

    if (matches.length === 0) {
      return { matched: false, reason: "No matches found" }
    }

    // Create match records in database
    const matchRecords = await Promise.all(
      matches.map((match) =>
        prisma.match.create({
          data: {
            shipmentId: shipment.id,
            transporterId: match.transporter.userId,
            matchScore: match.score,
            isBackhaul: match.isBackhaul || false,
            estimatedPickup: match.estimatedPickup || shipment.pickupDate,
            proposedPrice: match.proposedPrice || shipment.price,
            status: "pending",
          },
        }),
      ),
    )

    // Update shipment status to matched
    await prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: "matched",
      },
    })

    // Group matches by notification priority
    const { highPriority, normalPriority } = matchingService.groupByNotificationPriority(matches)

    // Queue notifications
    for (const match of highPriority) {
      await notificationQueue.add(
        "match-found-high-priority",
        {
          matchId: matchRecords.find((m) => m.transporterId === match.transporter.userId)?.id,
          shipmentId: shipment.id,
          transporterId: match.transporter.userId,
          transporterPhone: match.transporter.phone,
          shipmentReference: shipment.reference,
          origin: shipment.originCity,
          destination: shipment.destinationCity,
          weight: shipment.weight,
          price: shipment.price,
        },
        {
          priority: 1,
        },
      )
    }

    for (const match of normalPriority) {
      await notificationQueue.add(
        "match-found-normal",
        {
          matchId: matchRecords.find((m) => m.transporterId === match.transporter.userId)?.id,
          shipmentId: shipment.id,
          transporterId: match.transporter.userId,
          transporterPhone: match.transporter.phone,
          shipmentReference: shipment.reference,
          origin: shipment.originCity,
          destination: shipment.destinationCity,
          weight: shipment.weight,
          price: shipment.price,
        },
        {
          priority: 0,
        },
      )
    }

    return {
      matched: true,
      matchCount: matches.length,
      highPriorityCount: highPriority.length,
      normalPriorityCount: normalPriority.length,
    }
  } catch (error) {
    console.error(`Error processing matching job for shipment ${shipmentId}:`, error)
    throw error
  }
}
