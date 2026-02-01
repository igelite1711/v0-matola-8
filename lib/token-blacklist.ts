import { supabase } from './supabase-db'

export const tokenBlacklistManager = {
  async addToBlacklist(token: string, expiresAt: Date) {
    const { error } = await supabase
      .from('token_blacklist')
      .insert([
        {
          token,
          expires_at: expiresAt.toISOString(),
        },
      ])
    if (error) throw error
  },

  async isBlacklisted(token: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('token_blacklist')
      .select('id')
      .eq('token', token)
      .single()

    if (error && error.code === 'PGRST116') return false
    if (error) throw error
    return !!data
  },

  async cleanExpiredTokens() {
    const { error } = await supabase
      .from('token_blacklist')
      .delete()
      .lt('expires_at', new Date().toISOString())
    if (error) throw error
  },
}
