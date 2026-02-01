import { supabase } from './supabase-db'

export const otpService = {
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  },

  async createOTP(phone: string, expiresIn: number = 300000) {
    const otp = this.generateOTP()
    const expiresAt = new Date(Date.now() + expiresIn).toISOString()

    const { error } = await supabase
      .from('otp_codes')
      .insert([
        {
          phone,
          code: otp,
          expires_at: expiresAt,
          attempts: 0,
        },
      ])
    if (error) throw error

    return otp
  },

  async verifyOTP(phone: string, code: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error && error.code === 'PGRST116') return false
    if (error) throw error

    if (data.attempts >= 3) {
      await supabase
        .from('otp_codes')
        .delete()
        .eq('id', data.id)
      return false
    }

    if (data.code === code) {
      await supabase
        .from('otp_codes')
        .delete()
        .eq('id', data.id)
      return true
    }

    await supabase
      .from('otp_codes')
      .update({ attempts: data.attempts + 1 })
      .eq('id', data.id)

    return false
  },

  async invalidateOTP(phone: string) {
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone', phone)
  },
}
