import crypto from 'crypto'

export const webhookValidator = {
  verifyAirtelWebhook(payload: string, signature: string): boolean {
    const secret = process.env.AIRTEL_WEBHOOK_SECRET
    if (!secret) return false

    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return hash === signature
  },

  verifyTNMWebhook(payload: string, signature: string): boolean {
    const secret = process.env.TNM_WEBHOOK_SECRET
    if (!secret) return false

    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    return hash === signature
  },

  generateWebhookSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  },
}
