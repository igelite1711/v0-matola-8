// Core types for the Matola platform - Enhanced for Malawi context

export type UserRole = "shipper" | "transporter" | "broker" | "admin"

export type ShipmentStatus =
  | "draft"
  | "posted"
  | "matched"
  | "confirmed"
  | "picked_up"
  | "in_transit"
  | "at_checkpoint" // Added checkpoint status for Malawi's checkpoint-based tracking
  | "at_border" // Added border crossing status for landlocked logistics
  | "delivered"
  | "completed"
  | "cancelled"
  | "disputed"

export type VehicleType =
  | "pickup"
  | "canter" // Common Malawi term for small trucks
  | "small_truck"
  | "medium_truck"
  | "large_truck"
  | "flatbed"
  | "refrigerated"
  | "tanker" // Added for fuel transport

export type CargoType =
  | "general"
  | "agricultural"
  | "maize" // Chimanga
  | "tobacco" // Fodya
  | "tea" // Tiyi
  | "sugar" // Shuga
  | "fertilizer" // Feteleza
  | "construction"
  | "cement"
  | "fuel"
  | "fragile"
  | "perishable"
  | "hazardous"
  | "livestock"

export type PaymentMethod = "cash" | "airtel_money" | "tnm_mpamba" | "bank_transfer" // Specific Malawi mobile money

export type PaymentStatus = "pending" | "partial" | "completed" | "refunded" | "escrow" // Added escrow

export interface Location {
  city: string
  district: string
  region: "Northern" | "Central" | "Southern"
  coordinates?: {
    lat: number
    lng: number
  }
  landmark?: string // Critical for Malawi - people navigate by landmarks
  admarc?: string // Nearest ADMARC depot
  isBorderTown?: boolean
  borderWith?: string // Zambia, Mozambique, Tanzania
}

export type VerificationLevel = "none" | "phone" | "id" | "community" | "rtoa" | "full"

export interface User {
  id: string
  role: UserRole
  name: string
  phone: string
  whatsapp?: string
  pin?: string
  email?: string
  avatar?: string
  rating: number
  totalRatings: number
  verified: boolean
  verificationLevel: VerificationLevel
  communityVouchers?: string[] // IDs of users who vouched
  chiefReference?: {
    name: string
    village: string
    district: string
  }
  rtoaMembership?: string // RTOA membership number
  preferredLanguage: "en" | "ny" // English or Chichewa
  createdAt: Date
}

export interface Transporter extends User {
  role: "transporter"
  vehicleType: VehicleType
  vehiclePlate: string
  vehicleCapacity: number
  vehicleMake?: string // e.g., "Mitsubishi Canter", "FUSO Fighter"
  currentLocation?: Location
  isAvailable: boolean
  completedTrips: number
  onTimeRate: number
  preferredRoutes?: string[] // e.g., ["Lilongwe-Blantyre", "Lilongwe-Mzuzu"]
  hasRefrigeration?: boolean
  hasGPS?: boolean
  unionMembership?: "rtoa" | "masta" | "cooperative" | "independent"
  cooperativeName?: string
}

export interface Shipper extends User {
  role: "shipper"
  businessName?: string
  businessType?: "individual" | "sme" | "corporate" | "farmer" | "trader" | "manufacturer"
  totalShipments: number
  tpinNumber?: string // Taxpayer ID
  preferredPayment?: PaymentMethod
}

export interface Shipment {
  id: string
  shipperId: string
  shipperName: string
  origin: Location
  destination: Location
  cargoType: CargoType
  cargoDescription: string
  cargoDescriptionNy?: string // Chichewa description
  weight: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  requiredVehicleType: VehicleType
  pickupDate: Date
  pickupTimeWindow: string
  deliveryDate?: Date
  price: number
  currency: "MWK"
  paymentMethod: PaymentMethod
  status: ShipmentStatus
  isBackhaul: boolean
  backhaulDiscount?: number // Percentage discount for backhaul
  specialInstructions?: string
  checkpoints?: Checkpoint[]
  borderCrossing?: {
    required: boolean
    borderPost: string
    estimatedClearanceHours: number
  }
  seasonalCategory?: "maize_harvest" | "tobacco_auction" | "tea_season" | "fertilizer_import" | "general"
  createdAt: Date
  updatedAt: Date
}

export interface Checkpoint {
  name: string
  location: Location
  arrivedAt?: Date
  departedAt?: Date
  notes?: string
  confirmedBy?: "driver" | "shipper" | "automatic"
}

export interface Match {
  id: string
  shipmentId: string
  transporterId: string
  transporterName: string
  transporterRating: number
  transporterPhone: string
  vehicleType: VehicleType
  vehiclePlate: string
  matchScore: number
  isBackhaul: boolean
  estimatedPickup: Date
  proposedPrice?: number
  status: "pending" | "accepted" | "rejected" | "expired"
  createdAt: Date
}

export interface Bid {
  id: string
  shipmentId: string
  transporterId: string
  transporterName: string
  transporterRating: number
  proposedPrice: number
  message?: string
  messageNy?: string // Chichewa message
  estimatedPickup: Date
  status: "pending" | "accepted" | "rejected" | "withdrawn"
  createdAt: Date
}

export interface Broker extends User {
  role: "broker"
  networkSize: number
  activeTransporters: number
  activeShippers: number
  totalCommission: number
  matchesMade: number
  specializedRoutes?: string[]
  specializedCargo?: CargoType[]
  operatingRegions?: ("Northern" | "Central" | "Southern")[]
}

export type DisputeStatus = "open" | "investigating" | "resolved" | "escalated" | "closed"

export type DisputeType =
  | "delayed_delivery"
  | "damaged_goods"
  | "wrong_pickup"
  | "payment_issue"
  | "no_show"
  | "overcharge"
  | "border_delay"
  | "driver_no_show" // Added new dispute types
  | "cargo_lost"
  | "other"

export interface Dispute {
  id: string
  shipmentId: string
  reportedBy: string
  reportedByRole: UserRole
  againstUser: string
  againstUserRole: UserRole
  type: DisputeType
  description: string
  voiceNoteUrl?: string // Voice notes common for low-literacy users
  images?: string[]
  status: DisputeStatus
  resolution?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
}

export interface PlatformAnalytics {
  totalUsers: number
  activeUsers: number
  totalShipments: number
  completedShipments: number
  totalRevenue: number
  emptyReturnRate: number
  averageRating: number
  disputeRate: number
  // Malawi-specific metrics
  backhaulMatchRate: number
  avgBorderClearanceHours: number
  topRoutes: { route: string; volume: number; revenue: number }[]
  seasonalTrends: { season: string; volume: number }[]
  channelDistribution: { ussd: number; whatsapp: number; web: number; broker: number }
}

export interface Rating {
  id: string
  shipmentId: string
  fromUserId: string
  toUserId: string
  fromRole: UserRole
  toRole: UserRole
  overallRating: number
  categoryRatings: Record<string, number>
  tags: string[]
  review?: string
  createdAt: Date
}

export interface UserRatingStats {
  averageRating: number
  totalRatings: number
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>
  tags: Record<string, number>
  isProbation: boolean
  probationReason?: string
  probationUntil?: Date
}

export type TransactionType = "payment" | "payout" | "refund" | "escrow_hold" | "escrow_release" | "commission" | "tip"
export type TransactionStatus = "pending" | "completed" | "failed" | "held" | "released"

export interface WalletTransaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  shipmentId?: string
  method: PaymentMethod
  reference: string
  description: string
  createdAt: Date
  completedAt?: Date
  metadata?: {
    escrowId?: string
    commissionRate?: number
    netAmount?: number
    grossAmount?: number
  }
}

export interface EscrowHold {
  id: string
  shipmentId: string
  shipperId: string
  transporterId: string
  grossAmount: number
  platformFee: number
  netAmount: number
  status: "held" | "released" | "refunded" | "disputed"
  heldAt: Date
  releaseCondition: "delivery_confirmed" | "manual_release" | "dispute_resolved"
  releasedAt?: Date
}

export interface Wallet {
  userId: string
  availableBalance: number
  pendingBalance: number
  escrowBalance: number
  totalEarned: number
  totalWithdrawn: number
  paymentMethods: PaymentMethodConfig[]
  lastUpdated: Date
}

export interface PaymentMethodConfig {
  id: string
  type: PaymentMethod
  phoneNumber?: string
  accountNumber?: string
  bankName?: string
  isPrimary: boolean
  verified: boolean
  addedAt: Date
}

export interface DriverAvailability {
  isOnline: boolean
  capacityPercentage: number // 0-100 (0 = full, 100 = empty)
  currentLocation?: Location
  lastLocationUpdate?: Date
  preferredRouteRadius: number // km
  acceptingBackhaul: boolean
  acceptingSharedLoads: boolean
}

export interface LoadOffer {
  id: string
  shipmentId: string
  transporterId: string
  matchScore: number
  isBackhaul: boolean
  pricing: {
    grossPrice: number
    platformFee: number
    netEarnings: number
    surgeMultiplier?: number
  }
  status: "pending" | "accepted" | "declined" | "expired"
  expiresAt: Date
  createdAt: Date
  respondedAt?: Date
}

export interface GeofenceEvent {
  id: string
  shipmentId: string
  transporterId: string
  zone: "pickup" | "dropoff" | "checkpoint"
  zoneName: string
  eventType: "enter" | "exit"
  location: { lat: number; lng: number }
  timestamp: Date
  autoConfirmed: boolean
}
