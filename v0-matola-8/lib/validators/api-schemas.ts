/**
 * Zod Validation Schemas for All API Routes
 * PRD Requirements: Input validation on all API endpoints
 */

import { z } from "zod"

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const loginSchema = z.object({
  phone: z.string().regex(/^\+?265\d{9}$/, "Invalid Malawi phone number"),
  pin: z.string().length(4, "PIN must be 4 digits").regex(/^\d{4}$/, "PIN must be numeric"),
  role: z.enum(["shipper", "transporter", "broker", "admin"]).optional(),
})

export const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+?265\d{9}$/, "Invalid Malawi phone number"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  phone: z.string().regex(/^\+?265\d{9}$/, "Invalid Malawi phone number"),
  pin: z.string().length(4, "PIN must be 4 digits").regex(/^\d{4}$/, "PIN must be numeric"),
  role: z.enum(["shipper", "transporter", "broker"]),
  email: z.string().email("Invalid email").optional(),
  whatsapp: z.string().regex(/^\+?265\d{9}$/, "Invalid WhatsApp number").optional(),
  preferredLanguage: z.enum(["en", "ny"]).default("en"),
  // Transporter-specific
  vehicleType: z
    .enum(["pickup", "canter", "small_truck", "medium_truck", "large_truck", "flatbed", "refrigerated", "tanker"])
    .optional(),
  vehiclePlate: z.string().min(1).max(20).optional(),
  vehicleCapacity: z.coerce.number().int().positive().max(50000).optional(),
  // Shipper-specific
  businessName: z.string().max(100).optional(),
  businessType: z.enum(["individual", "sme", "corporate", "farmer", "trader", "manufacturer"]).optional(),
})

// ============================================
// SHIPMENT SCHEMAS
// ============================================

export const createShipmentSchema = z.object({
  originCity: z.string().min(2, "Origin city required"),
  originDistrict: z.string().min(2, "Origin district required"),
  originRegion: z.enum(["Northern", "Central", "Southern"]),
  originLat: z.coerce.number().min(-90).max(90).optional(),
  originLng: z.coerce.number().min(-180).max(180).optional(),
  originLandmark: z.string().max(200).optional(),
  originAdmarc: z.string().max(100).optional(),
  destinationCity: z.string().min(2, "Destination city required"),
  destinationDistrict: z.string().min(2, "Destination district required"),
  destinationRegion: z.enum(["Northern", "Central", "Southern"]),
  destinationLat: z.coerce.number().min(-90).max(90).optional(),
  destinationLng: z.coerce.number().min(-180).max(180).optional(),
  destinationLandmark: z.string().max(200).optional(),
  destinationAdmarc: z.string().max(100).optional(),
  cargoType: z.enum([
    "general",
    "agricultural",
    "maize",
    "tobacco",
    "tea",
    "sugar",
    "fertilizer",
    "construction",
    "cement",
    "fuel",
    "fragile",
    "perishable",
    "hazardous",
    "livestock",
  ]),
  cargoDescription: z.string().min(3, "Cargo description required").max(500),
  cargoDescriptionNy: z.string().max(500).optional(),
  weight: z.coerce.number().int().positive("Weight must be positive").max(50000, "Weight too large"),
  length: z.coerce.number().positive().max(1000).optional(),
  width: z.coerce.number().positive().max(1000).optional(),
  height: z.coerce.number().positive().max(1000).optional(),
  requiredVehicleType: z.enum([
    "pickup",
    "canter",
    "small_truck",
    "medium_truck",
    "large_truck",
    "flatbed",
    "refrigerated",
    "tanker",
  ]),
  pickupDate: z.string().datetime("Invalid date format"),
  pickupTimeWindow: z.string().min(1).max(100),
  price: z.coerce.number().positive("Price must be positive").max(10000000, "Price too large"),
  paymentMethod: z.enum(["cash", "airtel_money", "tnm_mpamba", "bank_transfer"]),
  isBackhaul: z.boolean().default(false),
  backhaulDiscount: z.coerce.number().min(0).max(100).optional(),
  specialInstructions: z.string().max(1000).optional(),
  borderCrossingRequired: z.boolean().default(false),
  borderPost: z.string().max(100).optional(),
  estimatedClearanceHours: z.coerce.number().int().min(0).max(168).optional(),
  seasonalCategory: z.enum(["maize_harvest", "tobacco_auction", "tea_season", "fertilizer_import", "general"]).optional(),
})

export const updateShipmentSchema = createShipmentSchema.partial().extend({
  status: z
    .enum([
      "draft",
      "posted",
      "matched",
      "confirmed",
      "picked_up",
      "in_transit",
      "at_checkpoint",
      "at_border",
      "delivered",
      "completed",
      "cancelled",
      "disputed",
    ])
    .optional(),
})

export const getShipmentsSchema = z.object({
  status: z
    .enum([
      "draft",
      "posted",
      "matched",
      "confirmed",
      "picked_up",
      "in_transit",
      "at_checkpoint",
      "at_border",
      "delivered",
      "completed",
      "cancelled",
      "disputed",
    ])
    .optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
  originCity: z.string().optional(),
  destinationCity: z.string().optional(),
  cargoType: z.string().optional(),
})

// ============================================
// MATCH SCHEMAS
// ============================================

export const acceptMatchSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
})

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const createPaymentSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  amount: z.coerce.number().positive("Amount must be positive").max(10000000, "Amount too large"),
  method: z.enum(["cash", "airtel_money", "tnm_mpamba", "bank_transfer"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
  phoneNumber: z.string().regex(/^\+?265\d{9}$/, "Invalid Malawi phone number").optional(),
})

export const getPaymentsSchema = z.object({
  shipmentId: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
})

export const paymentWebhookSchema = z.object({
  reference: z.string().min(1, "Reference is required"),
  transactionId: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  status: z.enum(["completed", "success", "failed", "error", "pending"]),
  method: z.enum(["airtel_money", "tnm_mpamba"]).optional(),
  provider: z.string().optional(),
})

// ============================================
// BID SCHEMAS
// ============================================

export const submitBidSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  amount: z.coerce.number().positive("Price must be positive").max(10000000),
  message: z.string().max(500).optional(),
  messageNy: z.string().max(500).optional(),
  estimatedPickup: z.string().datetime("Invalid date format").optional(),
})

export const getBidsSchema = z.object({
  shipmentId: z.string().optional(),
  transporterId: z.string().optional(),
  status: z.enum(["pending", "accepted", "rejected", "withdrawn"]).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
})

// ============================================
// USER SCHEMAS
// ============================================

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().regex(/^\+?265\d{9}$/).optional(),
  preferredLanguage: z.enum(["en", "ny"]).optional(),
  avatar: z.string().url().optional(),
})

// ============================================
// RATING SCHEMAS
// ============================================

export const createRatingSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  toUserId: z.string().min(1, "User ID is required"),
  overallRating: z.coerce.number().int().min(1).max(5),
  categoryRatings: z.record(z.coerce.number().int().min(1).max(5)).optional(),
  tags: z.array(z.string()).optional(),
  review: z.string().max(1000).optional(),
})

export const getRatingsSchema = z.object({
  userId: z.string().optional(),
  shipmentId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ============================================
// DISPUTE SCHEMAS
// ============================================

export const createDisputeSchema = z.object({
  shipmentId: z.string().min(1, "Shipment ID is required"),
  type: z.enum([
    "delayed_delivery",
    "damaged_goods",
    "wrong_pickup",
    "payment_issue",
    "no_show",
    "overcharge",
    "border_delay",
    "driver_no_show",
    "cargo_lost",
    "other",
  ]),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  images: z.array(z.string().url()).max(5).optional(),
  voiceNoteUrl: z.string().url().optional(),
})

export const updateDisputeSchema = z.object({
  status: z.enum(["open", "investigating", "resolved", "escalated", "closed"]).optional(),
  resolution: z.string().max(2000).optional(),
})

export const getDisputesSchema = z.object({
  shipmentId: z.string().optional(),
  status: z.enum(["open", "investigating", "resolved", "escalated", "closed"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ============================================
// CHECKPOINT SCHEMAS
// ============================================

export const createCheckpointSchema = z.object({
  name: z.string().min(2, "Checkpoint name required"),
  city: z.string().min(2, "City required"),
  district: z.string().min(2, "District required"),
  region: z.enum(["Northern", "Central", "Southern"]),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  notes: z.string().max(500).optional(),
})

export const updateCheckpointSchema = z.object({
  arrivedAt: z.string().datetime().optional(),
  departedAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  confirmedBy: z.enum(["driver", "shipper", "automatic"]).optional(),
})

// ============================================
// EMERGENCY/SOS SCHEMAS
// ============================================

export const createEmergencySchema = z.object({
  shipmentId: z.string().optional(),
  type: z.enum(["sos", "accident", "breakdown", "theft", "other"]),
  location: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    address: z.string().max(200).optional(),
  }),
  message: z.string().max(500).optional(),
})

// ============================================
// ACHIEVEMENT SCHEMAS
// ============================================

export const getAchievementsSchema = z.object({
  userId: z.string().optional(),
  category: z.enum(["milestone", "streak", "community", "seasonal", "route", "earnings", "trips"]).optional(),
  unlocked: z.coerce.boolean().optional(),
})

export const getLeaderboardSchema = z.object({
  period: z.enum(["weekly", "monthly", "all_time"]).default("weekly"),
  region: z.enum(["Northern", "Central", "Southern"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

