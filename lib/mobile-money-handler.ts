import { supabase } from './supabase-db'

export const mobileMoneyHandler = {
  async initiateAirtelPayment(
    amount: number,
    phone: string,
    reference: string,
  ) {
    const apiKey = process.env.AIRTEL_MONEY_API_KEY
    if (!apiKey) throw new Error('Airtel Money API key not configured')

    const response = await fetch('https://api.airtel.mg/v1/payments/initiate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        phone: phone.replace('+265', '0'),
        reference,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/airtel`,
      }),
    })

    if (!response.ok) {
      throw new Error(`Airtel payment failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      transactionId: data.transaction_id,
      ussdPrompt: data.ussd_prompt,
    }
  },

  async initiateTNMPayment(amount: number, phone: string, reference: string) {
    const apiKey = process.env.TNM_MPAMBA_API_KEY
    if (!apiKey) throw new Error('TNM Mpamba API key not configured')

    const response = await fetch('https://api.tnm.mg/v1/payments/initiate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        phone: phone.replace('+265', '0'),
        reference,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/tnm`,
      }),
    })

    if (!response.ok) {
      throw new Error(`TNM payment failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      transactionId: data.transaction_id,
      ussdPrompt: data.ussd_prompt,
    }
  },

  async disburseFunds(amount: number, phone: string, method: 'airtel' | 'tnm') {
    const apiKey =
      method === 'airtel'
        ? process.env.AIRTEL_MONEY_API_KEY
        : process.env.TNM_MPAMBA_API_KEY

    if (!apiKey) throw new Error(`${method} API key not configured`)

    const endpoint =
      method === 'airtel'
        ? 'https://api.airtel.mg/v1/disbursements'
        : 'https://api.tnm.mg/v1/disbursements'

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        phone: phone.replace('+265', '0'),
      }),
    })

    if (!response.ok) {
      throw new Error(`Disbursement failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.transaction_id
  },
}
