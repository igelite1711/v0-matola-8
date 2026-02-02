import { z } from "zod"

// Malawi phone number validation
export const malawiPhoneSchema = z
  .string()
  .regex(/^\+265[89]\d{8}$/, "Invalid Malawi phone number. Format: +265 followed by 8 or 9 and 8 more digits")

// User type enum
export const userTypeSchema = z.enum(["shipper", "transporter", "broker", "admin"])

// Business type for shippers
export const businessTypeSchema = z.enum(["individual", "sme", "corporate", "farmer", "trader", "manufacturer"])

// Transport union membership
export const unionMembershipSchema = z.enum([
  "rtoa", // Road Transport Operators Association
  "masta", // Malawi Bus and Taxi Association
  "cooperative", // Local transport cooperative
  "independent", // Not affiliated
])

// Verification level
export const verificationLevelSchema = z.enum(["none", "phone", "id", "community", "full"])

// NASFAM member schema
export const nasfamMemberSchema = z.object({
  memberId: z.string().regex(/^NASFAM-\d{4}-\d{6}$/, "Invalid NASFAM ID format"),
  district: z.string(),
  club: z.string().optional(),
  verified: z.boolean().default(false),
  verifiedAt: z.string().datetime().optional(),
  cropTypes: z.array(z.string()).optional(),
})

// User registration schema
export const userRegistrationSchema = z.object({
  phone: malawiPhoneSchema,
  name: z.string().min(2, "Name must be at least 2 characters"),
  userType: userTypeSchema,
  language: z.enum(["en", "ny"]).default("en"),

  // Optional fields based on user type
  businessType: businessTypeSchema.optional(),
  businessName: z.string().optional(),

  // For transporters
  unionMembership: unionMembershipSchema.optional(),
  rtoaMembership: z
    .string()
    .regex(/^RTOA-\d{4}-\d{4}$/)
    .optional(),

  // For farmers/agricultural shippers
  nasfamMember: nasfamMemberSchema.optional(),

  // Location
  district: z.string().optional(),
  region: z.enum(["Central", "Southern", "Northern"]).optional(),
})

// User profile update schema
export const userProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  language: z.enum(["en", "ny"]).optional(),
  whatsappNumber: malawiPhoneSchema.optional(),

  // Business info
  businessName: z.string().optional(),
  businessType: businessTypeSchema.optional(),

  // Union membership
  unionMembership: unionMembershipSchema.optional(),
  rtoaMembership: z.string().optional(),

  // NASFAM
  nasfamMember: nasfamMemberSchema.optional(),

  // Notification preferences
  notificationPreferences: z
    .object({
      sms: z.boolean(),
      whatsapp: z.boolean(),
      push: z.boolean(),
      email: z.boolean(),
    })
    .optional(),
})

// NASFAM bulk import schema (for admin)
export const nasfamBulkImportSchema = z.object({
  members: z.array(
    z.object({
      phone: malawiPhoneSchema,
      name: z.string(),
      nasfamId: z.string().regex(/^NASFAM-\d{4}-\d{6}$/),
      district: z.string(),
      club: z.string().optional(),
      cropTypes: z.array(z.string()).optional(),
    }),
  ),
  autoCreateAccounts: z.boolean().default(false),
  sendWelcomeSms: z.boolean().default(true),
})

export type UserRegistration = z.infer<typeof userRegistrationSchema>
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>
export type NAASFAMMember = z.infer<typeof nasfamMemberSchema>
export type NASFAMBulkImport = z.infer<typeof nasfamBulkImportSchema>
