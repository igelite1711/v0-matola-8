import { type NextRequest, NextResponse } from "next/server"
import { nasfamBulkImportSchema } from "@/lib/api/schemas/user"
import { sql } from "@/lib/api/services/db"
import { logAuditEvent } from "@/lib/audit-logger"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = nasfamBulkImportSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request body", details: validation.error.errors }, { status: 400 })
    }

    const { members, autoCreateAccounts, sendWelcomeSms } = validation.data

    const results = {
      imported: 0,
      updated: 0,
      created: 0,
      errors: [] as { phone: string; error: string }[],
    }

    for (const member of members) {
      try {
        // Check if user exists
        const existingUser = await sql`
          SELECT id, phone, name FROM users WHERE phone = ${member.phone}
        `

        if (existingUser.length > 0) {
          // Update existing user with NASFAM info
          await sql`
            UPDATE users SET
              nasfam_member_id = ${member.nasfamId},
              nasfam_district = ${member.district},
              nasfam_club = ${member.club || null},
              nasfam_verified = true,
              nasfam_verified_at = NOW(),
              nasfam_crop_types = ${member.cropTypes || []},
              business_type = 'farmer',
              updated_at = NOW()
            WHERE phone = ${member.phone}
          `
          results.updated++
        } else if (autoCreateAccounts) {
          // Create new user account
          await sql`
            INSERT INTO users (
              phone, name, user_type, business_type,
              nasfam_member_id, nasfam_district, nasfam_club,
              nasfam_verified, nasfam_verified_at, nasfam_crop_types,
              language, verification_level
            ) VALUES (
              ${member.phone}, ${member.name}, 'shipper', 'farmer',
              ${member.nasfamId}, ${member.district}, ${member.club || null},
              true, NOW(), ${member.cropTypes || []},
              'en', 'phone'
            )
          `
          results.created++

          // Send welcome SMS if enabled
          if (sendWelcomeSms) {
            // Queue SMS sending (would integrate with Africa's Talking)
            console.log(`[NASFAM Import] Would send welcome SMS to ${member.phone}`)
          }
        }

        results.imported++
      } catch (error) {
        results.errors.push({
          phone: member.phone,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Log audit event
    await logAuditEvent({
      action: "nasfam_bulk_import",
      actorId: "admin", // Would get from session
      resourceType: "users",
      resourceId: "bulk",
      changes: {
        totalMembers: members.length,
        imported: results.imported,
        updated: results.updated,
        created: results.created,
        errors: results.errors.length,
      },
      ipAddress: req.headers.get("x-forwarded-for") || "unknown",
    })

    return NextResponse.json({
      success: true,
      results,
      message: `Successfully processed ${results.imported} NASFAM members`,
    })
  } catch (error) {
    console.error("NASFAM import error:", error)
    return NextResponse.json({ error: "Failed to import NASFAM members" }, { status: 500 })
  }
}

// GET endpoint to download import template
export async function GET() {
  const template = {
    description: "NASFAM Member Import Template",
    format: "JSON",
    example: {
      members: [
        {
          phone: "+265888123456",
          name: "John Banda",
          nasfamId: "NASFAM-2024-001234",
          district: "Kasungu",
          club: "Kasungu Central",
          cropTypes: ["maize", "tobacco", "groundnuts"],
        },
      ],
      autoCreateAccounts: true,
      sendWelcomeSms: true,
    },
    fields: {
      phone: "Required. Malawi phone number starting with +265",
      name: "Required. Full name of the member",
      nasfamId: "Required. Format: NASFAM-YYYY-NNNNNN",
      district: "Required. District name",
      club: "Optional. NASFAM club name",
      cropTypes: "Optional. Array of crop types",
    },
  }

  return NextResponse.json(template)
}
