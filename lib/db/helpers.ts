/**
 * Database Query Helpers
 * Common database operations and utilities
 */

import { prisma } from "./prisma"

export const dbHelpers = {
  // User helpers
  user: {
    getWithProfile: (userId: string) => {
      return prisma.user.findUnique({
        where: { id: userId },
        include: {
          transporterProfile: true,
          shipperProfile: true,
          brokerProfile: true,
        },
      })
    },

    getStats: async (userId: string) => {
      const [shipments, ratings, transactions] = await Promise.all([
        prisma.shipment.count({ where: { userId } }),
        prisma.rating.count({ where: { receiverId: userId } }),
        prisma.walletTransaction.count({
          where: { userId, status: "completed" },
        }),
      ])

      return { shipments, ratings, transactions }
    },
  },

  // Shipment helpers
  shipment: {
    getWithMatches: (shipmentId: string) => {
      return prisma.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          matches: {
            include: {
              transporter: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  rating: true,
                  verified: true,
                },
              },
            },
          },
          bids: {
            include: {
              transporter: {
                select: {
                  id: true,
                  name: true,
                  rating: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              rating: true,
            },
          },
        },
      })
    },

    getAvailableShipments: (filters?: {
      pickupCity?: string
      deliveryCity?: string
      cargoType?: string
      minPrice?: number
      maxPrice?: number
    }) => {
      const where: any = { status: "posted" }

      if (filters?.pickupCity) {
        where.pickupLocation = { contains: filters.pickupCity }
      }
      if (filters?.deliveryCity) {
        where.deliveryLocation = { contains: filters.deliveryCity }
      }
      if (filters?.cargoType) {
        where.cargoType = filters.cargoType
      }
      if (filters?.minPrice) {
        where.quotedPrice = { gte: filters.minPrice }
      }
      if (filters?.maxPrice) {
        where.quotedPrice = where.quotedPrice || {}
        where.quotedPrice.lte = filters.maxPrice
      }

      return prisma.shipment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              rating: true,
              verified: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    },
  },

  // Transaction helpers
  transaction: {
    createPaymentTransaction: async (
      userId: string,
      amount: number,
      shipmentId?: string
    ) => {
      return prisma.walletTransaction.create({
        data: {
          userId,
          shipmentId,
          type: "payment",
          amount,
          status: "pending",
          description: `Payment for shipment ${shipmentId || ""}`,
        },
      })
    },

    getBalance: async (userId: string) => {
      const transactions = await prisma.walletTransaction.findMany({
        where: { userId, status: "completed" },
        select: { type: true, amount: true },
      })

      let balance = 0
      transactions.forEach((tx) => {
        if (["payment", "payout", "refund"].includes(tx.type)) {
          balance += tx.amount
        }
      })

      return Math.max(0, balance)
    },
  },

  // Rating helpers
  rating: {
    getUserRating: async (userId: string) => {
      const ratings = await prisma.rating.findMany({
        where: { receiverId: userId },
        select: { overallRating: true },
      })

      if (!ratings.length) return 0

      const avg = ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length
      return parseFloat(avg.toFixed(2))
    },
  },

  // Dispute helpers
  dispute: {
    getActive: (userId: string) => {
      return prisma.dispute.findMany({
        where: {
          OR: [{ raisedById: userId }, { shipment: { userId } }],
          status: { in: ["open", "investigating"] },
        },
        include: {
          shipment: true,
          raisedBy: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      })
    },
  },
}
