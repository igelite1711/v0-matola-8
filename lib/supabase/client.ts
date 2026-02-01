import { createClient } from "@supabase/supabase-js"

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          name: string
          email: string | null
          role: "transporter" | "shipper" | "broker" | "admin"
          verified: boolean
          verification_level: "none" | "phone" | "id" | "community" | "rtoa" | "full"
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>
      }
      shipments: {
        Row: {
          id: string
          user_id: string
          reference_number: string
          status: string
          weight_kg: number
          price_mwk: number
          pickup_location: string
          delivery_location: string
          pickup_date: string
          delivery_date: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database["public"]["Tables"]["shipments"]["Row"],
          "id" | "created_at" | "updated_at"
        >
        Update: Partial<Database["public"]["Tables"]["shipments"]["Row"]>
      }
      payments: {
        Row: {
          id: string
          user_id: string
          shipment_id: string
          reference: string
          amount_mwk: number
          platform_fee_mwk: number
          net_amount_mwk: number
          status: string
          escrow_status: string
          idempotency_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database["public"]["Tables"]["payments"]["Row"],
          "id" | "created_at" | "updated_at"
        >
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>
      }
      matches: {
        Row: {
          id: string
          shipment_id: string
          transporter_id: string
          status: string
          score: number
          final_price_mwk: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["matches"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["matches"]["Row"]>
      }
      ratings: {
        Row: {
          id: string
          shipment_id: string
          rater_id: string
          rated_user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["ratings"]["Row"], "id" | "created_at">
        Update: never
      }
      disputes: {
        Row: {
          id: string
          shipment_id: string
          status: string
          description: string
          assigned_to: string | null
          resolution: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["disputes"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["disputes"]["Row"]>
      }
    }
  }
}

export default supabase
