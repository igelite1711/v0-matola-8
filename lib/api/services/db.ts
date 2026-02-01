// Database service abstraction
// This is a placeholder - connect to Neon/Supabase in production

import { v4 as uuidv4 } from "uuid"

// In-memory stores for development
const users = new Map<string, any>()
const shipments = new Map<string, any>()
const matches = new Map<string, any>()
const payments = new Map<string, any>()
const ussdSessions = new Map<string, any>()
const auditLogs: any[] = []

export const db = {
  // Users
  async createUser(data: {
    phone: string
    name: string
    role: string
  }) {
    const id = uuidv4()
    const user = {
      id,
      ...data,
      verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    users.set(id, user)
    users.set(`phone:${data.phone}`, user) // Index by phone
    return user
  },

  async getUserByPhone(phone: string) {
    return users.get(`phone:${phone}`) || null
  },

  async getUserById(id: string) {
    return users.get(id) || null
  },

  // Shipments
  async createShipment(data: any) {
    const id = uuidv4()
    const shipment = {
      id,
      ...data,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    shipments.set(id, shipment)
    return shipment
  },

  async getShipmentById(id: string) {
    return shipments.get(id) || null
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
    let results = Array.from(shipments.values())

    if (query.status) {
      results = results.filter((s) => s.status === query.status)
    }
    if (query.origin) {
      results = results.filter((s) => s.origin.toLowerCase().includes(query.origin!.toLowerCase()))
    }
    if (query.destination) {
      results = results.filter((s) => s.destination.toLowerCase().includes(query.destination!.toLowerCase()))
    }
    if (query.date_from) {
      results = results.filter((s) => new Date(s.departure_date) >= new Date(query.date_from!))
    }
    if (query.date_to) {
      results = results.filter((s) => new Date(s.departure_date) <= new Date(query.date_to!))
    }

    const total = results.length
    const offset = (query.page - 1) * query.limit
    const items = results.slice(offset, offset + query.limit)

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    }
  },

  async updateShipment(id: string, data: any) {
    const shipment = shipments.get(id)
    if (!shipment) return null

    const updated = {
      ...shipment,
      ...data,
      updated_at: new Date().toISOString(),
    }
    shipments.set(id, updated)
    return updated
  },

  // Matches
  async createMatch(data: any) {
    const id = uuidv4()
    const match = {
      id,
      ...data,
      status: "pending",
      matched_at: new Date().toISOString(),
    }
    matches.set(id, match)
    return match
  },

  async getMatchById(id: string) {
    return matches.get(id) || null
  },

  async getMatchesByUser(userId: string, role: string) {
    return Array.from(matches.values()).filter((m) => {
      if (role === "shipper") {
        const shipment = shipments.get(m.shipment_id)
        return shipment?.shipper_id === userId
      }
      return m.transporter_id === userId
    })
  },

  async updateMatch(id: string, data: any) {
    const match = matches.get(id)
    if (!match) return null

    const updated = { ...match, ...data }
    matches.set(id, updated)
    return updated
  },

  // Payments
  async createPayment(data: any) {
    const id = uuidv4()
    const reference = `MAT${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    const payment = {
      id,
      reference,
      ...data,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    payments.set(id, payment)
    payments.set(`ref:${reference}`, payment)
    return payment
  },

  async getPaymentById(id: string) {
    return payments.get(id) || null
  },

  async getPaymentByReference(reference: string) {
    return payments.get(`ref:${reference}`) || null
  },

  async updatePayment(id: string, data: any) {
    const payment = payments.get(id)
    if (!payment) return null

    const updated = {
      ...payment,
      ...data,
      updated_at: new Date().toISOString(),
    }
    payments.set(id, updated)
    if (payment.reference) {
      payments.set(`ref:${payment.reference}`, updated)
    }
    return updated
  },

  // USSD Sessions
  async getUssdSession(sessionId: string) {
    return ussdSessions.get(sessionId) || null
  },

  async upsertUssdSession(sessionId: string, data: any) {
    const session = {
      session_id: sessionId,
      ...data,
      updated_at: new Date().toISOString(),
    }
    ussdSessions.set(sessionId, session)
    return session
  },

  // Audit Logs
  async createAuditLog(data: {
    user_id?: string
    action: string
    entity: string
    entity_id?: string
    changes?: any
    ip_address?: string
  }) {
    const log = {
      id: uuidv4(),
      ...data,
      timestamp: new Date().toISOString(),
    }
    auditLogs.push(log)
    return log
  },
}

// SQL tagged template function for raw SQL queries (Neon/Postgres compatible)
// SQL tagged template literal for database queries
// In production, replace with actual Neon/Supabase client
type SQLValue = string | number | boolean | null | undefined | Date
type SQLResult = Record<string, any>[]

export function sql(strings: TemplateStringsArray, ...values: SQLValue[]): Promise<SQLResult> {
  // Build the query string with placeholders
  const query = strings.reduce((acc, str, i) => {
    return acc + str + (i < values.length ? `$${i + 1}` : "")
  }, "")

  // Log the query in development
  console.log("[SQL Query]", query, values)

  // In development, return empty array
  // In production, this would execute against Neon/Supabase
  return Promise.resolve([])
}

// Export for Neon-style usage
export { sql as neon }
