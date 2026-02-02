import { z } from "zod"

export const createShipmentSchema = z.object({
  origin: z.string().min(1).max(255),
  origin_lat: z.number().min(-90).max(90),
  origin_lng: z.number().min(-180).max(180),
  destination: z.string().min(1).max(255),
  destination_lat: z.number().min(-90).max(90),
  destination_lng: z.number().min(-180).max(180),
  cargo_type: z.string().min(1).max(100),
  weight_kg: z.number().positive("Weight must be greater than 0"),
  price_mwk: z.number().positive("Price must be greater than 0"),
  departure_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
})

export const updateShipmentSchema = z.object({
  cargo_type: z.string().min(1).max(100).optional(),
  weight_kg: z.number().positive().optional(),
  price_mwk: z.number().positive().optional(),
  departure_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
})

export const shipmentQuerySchema = z.object({
  status: z.enum(["pending", "matched", "in_transit", "delivered", "cancelled"]).optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>
export type UpdateShipmentInput = z.infer<typeof updateShipmentSchema>
export type ShipmentQuery = z.infer<typeof shipmentQuerySchema>
