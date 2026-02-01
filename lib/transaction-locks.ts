import { supabase } from './supabase-db'

export const transactionLocks = {
  async acquireLock(resource: string, duration: number = 30000) {
    const lockId = `${resource}-${Date.now()}`
    const expiresAt = new Date(Date.now() + duration)

    const { error } = await supabase.from('transaction_locks').insert([
      {
        resource,
        lock_id: lockId,
        expires_at: expiresAt.toISOString(),
      },
    ])

    if (error) return null
    return lockId
  },

  async releaseLock(resource: string, lockId: string) {
    const { error } = await supabase
      .from('transaction_locks')
      .delete()
      .eq('resource', resource)
      .eq('lock_id', lockId)

    return !error
  },

  async isLocked(resource: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('transaction_locks')
      .select('id')
      .eq('resource', resource)
      .gt('expires_at', new Date().toISOString())
      .limit(1)

    if (error) return false
    return data && data.length > 0
  },

  async cleanExpiredLocks() {
    await supabase
      .from('transaction_locks')
      .delete()
      .lt('expires_at', new Date().toISOString())
  },
}
