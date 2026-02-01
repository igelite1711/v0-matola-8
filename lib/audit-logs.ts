import { dbPersistence } from './supabase-db'

export const auditLogger = {
  async logAction(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    changes: Record<string, any>,
    ipAddress?: string,
  ) {
    try {
      await dbPersistence.createAuditLog({
        user_id: userId,
        action,
        entity,
        entity_id: entityId,
        changes,
        ip_address: ipAddress,
        created_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Audit log error:', error)
    }
  },

  async getActionHistory(entityId: string, entity: string) {
    return await dbPersistence.getAuditLogs({
      entity_id: entityId,
      entity,
    })
  },

  async getUserActivity(userId: string, limit: number = 50) {
    const logs = await dbPersistence.getAuditLogs({
      user_id: userId,
    })
    return logs.slice(0, limit)
  },

  async getComplianceReport(startDate: Date, endDate: Date) {
    const logs = await dbPersistence.getAuditLogs({})
    return logs.filter((log) => {
      const date = new Date(log.created_at)
      return date >= startDate && date <= endDate
    })
  },
}
