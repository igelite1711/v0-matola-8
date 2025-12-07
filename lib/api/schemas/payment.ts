import { z } from "zod"
import { uuidSchema } from "../middleware/validate"

export const initiatePaymentSchema = z.object({
  shipment_id: uuidSchema,
  method: z.enum(["airtel_money", "tnm_mpamba", "cash"]),
})

export const airtelWebhookSchema = z.object({
  transaction_id: z.string(),
  status: z.enum(["SUCCESS", "FAILED", "PENDING"]),
  amount: z.number(),
  phone_number: z.string(),
  reference: z.string(),
  timestamp: z.string(),
  signature: z.string(),
})

export const tnmWebhookSchema = z.object({
  transactionId: z.string(),
  resultCode: z.string(),
  resultDesc: z.string(),
  amount: z.number(),
  msisdn: z.string(),
  reference: z.string(),
  timestamp: z.string(),
  checksum: z.string(),
})

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>
export type AirtelWebhookPayload = z.infer<typeof airtelWebhookSchema>
export type TnmWebhookPayload = z.infer<typeof tnmWebhookSchema>
