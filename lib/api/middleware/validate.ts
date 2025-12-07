import { type NextRequest, NextResponse } from "next/server"
import { z, type ZodSchema, ZodError } from "zod"

export function createValidator<T>(schema: ZodSchema<T>) {
  return async function validate(req: NextRequest): Promise<{ data: T } | NextResponse> {
    try {
      const body = await req.json()
      const data = schema.parse(body)
      return { data }
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: error.errors.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 },
        )
      }
      return NextResponse.json({ error: "Invalid request body", code: "PARSE_ERROR" }, { status: 400 })
    }
  }
}

// Common validation schemas
export const phoneSchema = z.string().regex(/^\+265[89]\d{8}$/, "Invalid Malawi phone number format (+265XXXXXXXXX)")

export const uuidSchema = z.string().uuid()

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

// Validation helper
export function isValidated<T>(result: { data: T } | NextResponse): result is { data: T } {
  return "data" in result
}
