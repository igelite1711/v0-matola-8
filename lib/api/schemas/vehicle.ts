import { z } from "zod"

// Malawi vehicle registration format validation
// Format: XX 1234 (2 uppercase letters, space, 4 digits)
// Examples: BT 1234, LL 5678, RU 9012, NB 3456
export const vehiclePlateSchema = z
  .string()
  .transform((val) => val.toUpperCase().trim())
  .pipe(
    z
      .string()
      .regex(/^[A-Z]{2}\s\d{4}$/, "Invalid Malawi vehicle registration format. Use: XX 1234 (e.g., BT 1234, LL 5678)"),
  )

// Common Malawi registration prefixes by district
export const REGISTRATION_PREFIXES: Record<string, string> = {
  BT: "Blantyre",
  LL: "Lilongwe",
  MZ: "Mzuzu",
  ZA: "Zomba",
  KU: "Kasungu",
  MG: "Mangochi",
  SA: "Salima",
  KA: "Karonga",
  DD: "Dedza",
  NT: "Ntcheu",
  MC: "Mchinji",
  NB: "Nkhotakota",
  MW: "Mwanza",
  ML: "Mulanje",
  RU: "Rumphi",
  CH: "Chikwawa",
  TH: "Thyolo",
  PH: "Phalombe",
  BA: "Balaka",
  LW: "Liwonde",
  DW: "Dowa",
  NK: "Nkhata Bay",
  NS: "Nsanje",
}

// Validate and extract district from plate
export function parseVehiclePlate(plate: string): {
  valid: boolean
  prefix?: string
  district?: string
  number?: string
  error?: string
} {
  const normalized = plate.toUpperCase().trim()

  // Check format
  const match = normalized.match(/^([A-Z]{2})\s(\d{4})$/)
  if (!match) {
    return {
      valid: false,
      error: "Invalid format. Use: XX 1234 (e.g., BT 1234)",
    }
  }

  const [, prefix, number] = match
  const district = REGISTRATION_PREFIXES[prefix]

  return {
    valid: true,
    prefix,
    district: district || "Unknown",
    number,
  }
}

// Vehicle type enum matching Malawi common vehicles
export const vehicleTypeSchema = z.enum([
  "pickup", // Toyota Hilux, Isuzu KB
  "canter", // Mitsubishi Canter, Isuzu NQR (3-5 tons)
  "small_truck", // 5-7 tons
  "medium_truck", // FUSO Fighter, Hino (5-10 tons)
  "large_truck", // Scania, Mercedes Actros (20-30 tons)
  "flatbed", // Construction materials, machinery
  "refrigerated", // Cold chain, perishables
  "tanker", // Fuel transport
])

export type VehicleType = z.infer<typeof vehicleTypeSchema>

// Complete vehicle schema for registration
export const vehicleSchema = z.object({
  plateNumber: vehiclePlateSchema,
  type: vehicleTypeSchema,
  make: z.string().min(2, "Vehicle make required"),
  model: z.string().optional(),
  year: z
    .number()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .optional(),
  capacity: z.number().positive("Capacity must be positive").optional(),
  hasRefrigeration: z.boolean().default(false),
  roadWorthinessCertDate: z.string().datetime().optional(),
  insuranceExpiryDate: z.string().datetime().optional(),
})

export type Vehicle = z.infer<typeof vehicleSchema>
