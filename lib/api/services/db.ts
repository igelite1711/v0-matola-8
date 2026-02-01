// Database service using Prisma ORM
// All data is persisted to the configured database

import { prisma } from "@/lib/db/prisma"

export const db = {
  // ==================== Users ====================
  async createUser(data: {
    phone: string
    name: string
    role: "shipper" | "transporter" | "broker" | "admin"
  }) {
    try {
      const user = await prisma.user.create({
        data: {
          phone: data.phone,
          name: data.name,
          role: data.role,
          verified: false,
          verificationLevel: "none",
          preferredLanguage: "en",
        },
      })
      return user
    } catch (error) {
      console.error("Failed to create user:", error)
      throw error
    }
  },

  async getUserByPhone(phone: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { phone },
      })
      return user
    } catch (error) {
      console.error("Failed to get user by phone:", error)
      throw error
    }
  },

  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })
      return user
    } catch (error) {
      console.error("Failed to get user by id:", error)
      throw error
    }
  },

  async updateUser(id: string, data: Partial<{
    name: string
    email: string
    phone: string
    whatsapp: string
    avatar: string
    verified: boolean
    verificationLevel: string
  }>) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
      })
      return user
    } catch (error) {
      console.error("Failed to update user:", error)
      throw error
    }
  },

  // ==================== Shipments ====================
  async createShipment(data: {
    userId: string
    referenceNumber: string
    description: string
    cargoType: string
    weight: number
    estimatedValue?: number
    pickupLocation: string
    deliveryLocation: string
    pickupDate: Date
    deliveryDate: Date
    paymentMethod?: string
    seasonalCategory?: string
  }) {
    try {
      const shipment = await prisma.shipment.create({
        data: {
          userId: data.userId,
          referenceNumber: data.referenceNumber,
          description: data.description,
          cargoType: data.cargoType,
          weight: data.weight,
          estimatedValue: data.estimatedValue,
          pickupLocation: data.pickupLocation,
          deliveryLocation: data.deliveryLocation,
          pickupDate: data.pickupDate,
          deliveryDate: data.deliveryDate,
          paymentMethod: data.paymentMethod,
          seasonalCategory: data.seasonalCategory,
          status: "draft",
        },
      })
      return shipment
    } catch (error) {
      console.error("Failed to create shipment:", error)
      throw error
    }
  },

  async getShipmentById(id: string) {
    try {
      const shipment = await prisma.shipment.findUnique({
        where: { id },
      })
      return shipment
    } catch (error) {
      console.error("Failed to get shipment by id:", error)
      throw error
    }
  },

  async getShipments(query: {
    status?: string
    origin?: string
    destination?: string
    date_from?: string
    date_to?: string
    page: number
    limit: number
  }) {
    try {
      const where: any = {}

      if (query.status) {
        where.status = query.status
      }
      if (query.origin) {
        where.pickupLocation = {
          contains: query.origin,
          mode: "insensitive",
        }
      }
      if (query.destination) {
        where.deliveryLocation = {
          contains: query.destination,
          mode: "insensitive",
        }
      }
      if (query.date_from) {
        where.pickupDate = {
          ...where.pickupDate,
          gte: new Date(query.date_from),
        }
      }
      if (query.date_to) {
        where.pickupDate = {
          ...where.pickupDate,
          lte: new Date(query.date_to),
        }
      }

      const total = await prisma.shipment.count({ where })
      const offset = (query.page - 1) * query.limit

      const items = await prisma.shipment.findMany({
        where,
        skip: offset,
        take: query.limit,
        orderBy: { createdAt: "desc" },
      })

      return {
        items,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      }
    } catch (error) {
      console.error("Failed to get shipments:", error)
      throw error
    }
  },

  async updateShipment(id: string, data: Partial<{
    description: string
    status: string
    quotedPrice: number
    finalPrice: number
    paymentMethod: string
  }>) {
    try {
      const shipment = await prisma.shipment.update({
        where: { id },
        data,
      })
      return shipment
    } catch (error) {
      console.error("Failed to update shipment:", error)
      throw error
    }
  },

  // ==================== Matches ====================
  async createMatch(data: {
    shipmentId: string
    transporterId: string
    status: string
    matchScore: number
  }) {
    try {
      const match = await prisma.match.create({
        data: {
          shipmentId: data.shipmentId,
          transporterId: data.transporterId,
          status: data.status,
          matchScore: data.matchScore,
        },
      })
      return match
    } catch (error) {
      console.error("Failed to create match:", error)
      throw error
    }
  },

  async getMatchById(id: string) {
    try {
      const match = await prisma.match.findUnique({
        where: { id },
      })
      return match
    } catch (error) {
      console.error("Failed to get match by id:", error)
      throw error
    }
  },

  async getMatchesByUser(userId: string, role: string) {
    try {
      let matches
      if (role === "shipper") {
        // Get matches for shipments created by this user
        matches = await prisma.match.findMany({
          where: {
            shipment: {
              userId: userId,
            },
          },
        })
      } else {
        // Get matches for shipments assigned to this transporter
        matches = await prisma.match.findMany({
          where: {
            transporterId: userId,
          },
        })
      }
      return matches
    } catch (error) {
      console.error("Failed to get matches by user:", error)
      throw error
    }
  },

  async updateMatch(id: string, data: Partial<{
    status: string
    matchScore: number
  }>) {
    try {
      const match = await prisma.match.update({
        where: { id },
        data,
      })
      return match
    } catch (error) {
      console.error("Failed to update match:", error)
      throw error
    }
  },

  // ==================== Payments / Wallet Transactions ====================
  async createPayment(data: {
    userId: string
    shipmentId?: string
    type: string
    amount: number
    description?: string
    paymentMethod?: string
  }) {
    try {
      const transaction = await prisma.walletTransaction.create({
        data: {
          userId: data.userId,
          shipmentId: data.shipmentId,
          type: data.type,
          amount: data.amount,
          description: data.description,
          status: "pending",
        },
      })
      return transaction
    } catch (error) {
      console.error("Failed to create payment:", error)
      throw error
    }
  },

  async getPaymentById(id: string) {
    try {
      const payment = await prisma.walletTransaction.findUnique({
        where: { id },
      })
      return payment
    } catch (error) {
      console.error("Failed to get payment by id:", error)
      throw error
    }
  },

  async getPaymentByReference(reference: string) {
    try {
      // Note: WalletTransaction doesn't have a reference field
      // This is a placeholder for payment systems that might use external references
      const payment = await prisma.walletTransaction.findFirst({
        where: {
          description: {
            contains: reference,
          },
        },
      })
      return payment
    } catch (error) {
      console.error("Failed to get payment by reference:", error)
      throw error
    }
  },

  async updatePayment(id: string, data: Partial<{
    status: string
    amount: number
    description: string
  }>) {
    try {
      const payment = await prisma.walletTransaction.update({
        where: { id },
        data,
      })
      return payment
    } catch (error) {
      console.error("Failed to update payment:", error)
      throw error
    }
  },

  // ==================== USSD Sessions ====================
  async getUssdSession(sessionId: string) {
    try {
      const session = await prisma.uSSDSession.findUnique({
        where: { sessionId },
      })
      return session
    } catch (error) {
      console.error("Failed to get USSD session:", error)
      throw error
    }
  },

  async upsertUssdSession(sessionId: string, data: {
    phoneNumber: string
    state: string
    context?: string
    userId?: string
  }) {
    try {
      const session = await prisma.uSSDSession.upsert({
        where: { sessionId },
        create: {
          sessionId,
          phoneNumber: data.phoneNumber,
          state: data.state,
          context: data.context,
          userId: data.userId,
        },
        update: {
          state: data.state,
          context: data.context,
          userId: data.userId,
          lastActivity: new Date(),
          stepCount: {
            increment: 1,
          },
        },
      })
      return session
    } catch (error) {
      console.error("Failed to upsert USSD session:", error)
      throw error
    }
  },

  // ==================== Audit Logs ====================
  async createAuditLog(data: {
    userId?: string
    action: string
    resourceType: string
    resourceId?: string
    details?: string
    ipAddress?: string
  }) {
    try {
      const log = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          details: data.details,
          ipAddress: data.ipAddress,
        },
      })
      return log
    } catch (error) {
      console.error("Failed to create audit log:", error)
      throw error
    }
  },
}

// Direct Prisma exports for when you need lower-level access
export { prisma }
