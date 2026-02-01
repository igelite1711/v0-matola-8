import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export const dbPersistence = {
  // Users
  async createUser(data: any) {
    const { data: user, error } = await supabase
      .from('users')
      .insert([data])
      .select()
      .single()
    if (error) throw error
    return user
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async getUserByPhone(phone: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  // Shipments
  async createShipment(data: any) {
    const { data: shipment, error } = await supabase
      .from('shipments')
      .insert([data])
      .select()
      .single()
    if (error) throw error
    return shipment
  },

  async getShipmentById(id: string) {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  async updateShipment(id: string, updates: any) {
    const { data, error } = await supabase
      .from('shipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Payments
  async createPayment(data: any) {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([data])
      .select()
      .single()
    if (error) throw error
    return payment
  },

  async getPaymentById(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data || null
  },

  // Audit logs
  async createAuditLog(data: any) {
    const { error } = await supabase
      .from('audit_logs')
      .insert([data])
    if (error) throw error
  },

  async getAuditLogs(filters: any = {}) {
    let query = supabase.from('audit_logs').select('*')
    if (filters.user_id) query = query.eq('user_id', filters.user_id)
    if (filters.entity) query = query.eq('entity', filters.entity)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },
}
