# MATOLA System Invariants - Supabase Implementation

## Overview

This guide explains how the MATOLA system invariants are enforced using **Supabase (PostgreSQL)** as the backend. The system uses a **three-layer defense** approach:

1. **Database Level** - PostgreSQL constraints and triggers
2. **Row Level Security (RLS)** - Fine-grained authorization
3. **Application Level** - TypeScript validators

---

## Table of Contents

1. [Architecture](#architecture)
2. [Database Constraints](#database-constraints)
3. [Row Level Security](#row-level-security)
4. [Application Validators](#application-validators)
5. [API Integration](#api-integration)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

### Three-Layer Defense Model

```
┌─────────────────────────────────────┐
│  Application Layer (TypeScript)     │
│  - Input validation                 │
│  - Business logic checks            │
│  - Idempotency & deduplication      │
└────────────┬────────────────────────┘
             │ (Supabase Client)
┌────────────▼────────────────────────┐
│  Row Level Security (Supabase RLS)  │
│  - Authorization checks             │
│  - Data privacy enforcement         │
│  - User/role-based access control   │
└────────────┬────────────────────────┘
             │ (PostgreSQL)
┌────────────▼────────────────────────┐
│  Database Level (PostgreSQL)        │
│  - CHECK constraints                │
│  - UNIQUE constraints               │
│  - Triggers & Functions             │
│  - State machines                   │
└─────────────────────────────────────┘
```

### Why Three Layers?

- **Database Level**: Protects against direct SQL injection and ensures data consistency even if app code is compromised
- **RLS Policies**: Enforces authorization at query time, ensures users only see/modify their data
- **Application Level**: Catches business logic violations early, provides better UX, and prevents cascading failures

---

## Database Constraints

### Migration Files

All database constraints are defined in two migration files:

#### `scripts/migrations/005_invariant_constraints.sql`
- CHECK constraints for positive values
- UNIQUE constraints for references
- Triggers for state machine validation
- Triggers for immutability enforcement

#### `scripts/migrations/006_rls_policies.sql`
- Row Level Security policies for all tables
- Role-based access control
- Data privacy enforcement

### Running Migrations

```bash
# Connect to Supabase and run migrations
psql postgresql://user:password@host/database < scripts/migrations/005_invariant_constraints.sql
psql postgresql://user:password@host/database < scripts/migrations/006_rls_policies.sql

# Or using Supabase CLI
supabase db push
```

---

## Row Level Security

### RLS Policies Overview

All tables have RLS enabled with specific policies:

#### Users Table
```sql
-- Users can only see their own profile
CREATE POLICY "users_select_own_profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id OR role = 'admin');

-- Users can only update their own profile
CREATE POLICY "users_update_own_profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);
```

#### Shipments Table
```sql
-- Users can only see their own shipments
CREATE POLICY "shipments_select_own"
  ON shipments FOR SELECT
  USING (auth.uid()::text = user_id);

-- Matched transporters can see shipments they're matched to
CREATE POLICY "shipments_select_matched"
  ON shipments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.shipment_id = shipments.id
      AND matches.transporter_id = auth.uid()::text
    )
  );
```

#### Payments Table
```sql
-- Users can only see their own payments
CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (auth.uid()::text = user_id);

-- Prevent modification of completed payments
CREATE POLICY "payments_forbid_update_completed"
  ON payments FOR UPDATE
  USING (status != 'completed' OR escrow_status != 'released')
  WITH CHECK (status != 'completed' OR escrow_status != 'released');
```

### Enabling RLS in Your App

Supabase RLS automatically works when you:
1. Call Supabase client methods with `auth.uid()` context
2. Have a valid JWT token in the request
3. RLS policies are correctly defined on tables

```typescript
// RLS automatically restricts this query to current user
const { data } = await supabase
  .from("shipments")
  .select("*")
  // RLS policy ensures only user's own shipments are returned
```

---

## Application Validators

### Available Validators

All validators are in `/lib/invariants/supabase-validators.ts`:

#### User Validators
```typescript
import { invariantValidators } from "@/lib/invariants/supabase-validators"

// Validate phone number format (E.164)
invariantValidators.validateE164PhoneFormat("+265123456789")

// Validate unique phone
await invariantValidators.validateUniquePhoneNumber("+265123456789")

// Validate verification can only progress upward
await invariantValidators.validateVerificationProgression(userId, "full")
```

#### Shipment Validators
```typescript
// Validate positive weight
invariantValidators.validateShipmentWeight(500) // kg

// Validate positive price
invariantValidators.validateShipmentPrice(50000) // MWK

// Validate dates
invariantValidators.validatePickupDate(new Date("2026-02-05"))
invariantValidators.validateDeliveryDate(pickupDate, deliveryDate)

// Validate origin != destination
invariantValidators.validateOriginDestinationDifferent("Lilongwe", "Blantyre")

// Validate state machine
invariantValidators.validateShipmentStatusTransition("draft", "pending")
```

#### Payment Validators
```typescript
// Validate amounts
invariantValidators.validatePaymentAmount(50000)
invariantValidators.validatePlatformFee(50000, 5000) // amount and fee
invariantValidators.validateNetAmount(50000, 5000, 45000)

// Validate no double-release
await invariantValidators.validateNoDoubleEscrowRelease(paymentId)

// Validate no refund after completion
await invariantValidators.validateNoRefundAfterCompletion(paymentId)

// Check for idempotent payment
const existing = await invariantValidators.getIdempotentPayment(key)
if (existing) return existing // Return existing instead of creating new
```

#### Match Validators
```typescript
// Validate score
invariantValidators.validateMatchScore(85) // 0-100

// Validate price (can't exceed 150% of shipment price)
await invariantValidators.validateMatchPrice(shipmentId, finalPrice)

// Validate no duplicate active matches
await invariantValidators.validateNoDuplicateActiveMatches(shipmentId, transporterId)

// Validate status transition
invariantValidators.validateMatchStatusTransition("pending", "accepted")
```

#### Rating & Dispute Validators
```typescript
// Rating must be 1-5
invariantValidators.validateRatingValue(4)

// No duplicate ratings per shipment
await invariantValidators.validateNoDuplicateRatings(shipmentId, raterId, ratedUserId)

// Dispute must reference shipment
await invariantValidators.validateDisputeShipmentReference(shipmentId)

// Dispute resolution requires assignment and explanation
invariantValidators.validateDisputeAssignment("resolved", agentId)
invariantValidators.validateDisputeExplanation("resolved", explanation)
```

---

## API Integration

### Invariant Middleware

Use the middleware in `/lib/api/invariant-middleware.ts`:

```typescript
import { 
  validateShipmentCreation,
  validatePaymentCreation,
  invariantErrorHandler
} from "@/lib/api/invariant-middleware"

export const POST = invariantErrorHandler(async (req: NextRequest) => {
  const body = await req.json()

  // Validate invariants
  await validateShipmentCreation(body, userId)

  // Create shipment
  const { data } = await supabase
    .from("shipments")
    .insert(body)

  return NextResponse.json(data)
})
```

### Available Middleware Functions

```typescript
// Shipment operations
await validateShipmentCreation(data, userId)
await validateShipmentUpdate(shipmentId, currentStatus, newStatus, updateData)

// Payment operations
await validatePaymentCreation(data, userId)
await validatePaymentRelease(paymentId, shipmentId)

// Match operations
await validateMatchCreation(data)
await validateMatchAcceptance(matchId, currentStatus)

// Rating operations
await validateRatingCreation(data)

// Dispute operations
await validateDisputeCreation(data)
await validateDisputeResolution(status, assignedTo, resolution)

// User operations
await validateUserRegistration(data)
await validateUserVerificationUpdate(userId, newLevel)
```

### Error Handling

```typescript
import { InvariantError } from "@/lib/invariants/supabase-validators"
import { createErrorResponse } from "@/lib/api/invariant-middleware"

try {
  await validateShipmentCreation(data, userId)
} catch (error) {
  if (error instanceof InvariantError) {
    // Custom error with code and status
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
      },
      { status: error.statusCode }
    )
  }
  throw error
}
```

### Error Codes Reference

```
USER_PHONE_DUPLICATE         - Phone already registered
INVALID_PHONE_FORMAT         - Phone not in E.164 format
VERIFICATION_DOWNGRADE_FORBIDDEN - Can't downgrade verification

INVALID_SHIPMENT_WEIGHT      - Weight must be > 0
INVALID_SHIPMENT_PRICE       - Price must be > 0
INVALID_PICKUP_DATE          - Pickup in the past
INVALID_DELIVERY_DATE        - Delivery before pickup
INVALID_SHIPMENT_LOCATIONS   - Origin = destination
SHIPMENT_REFERENCE_DUPLICATE - Reference not unique
INVALID_STATUS_TRANSITION    - Invalid state machine transition
SHIPMENT_IMMUTABLE           - Completed shipments can't change

INVALID_MATCH_SCORE          - Score not 0-100
MATCH_PRICE_EXCEEDS_LIMIT    - Price > 150% of shipment
DUPLICATE_ACTIVE_MATCH       - Transporter already matched to shipment
MATCH_IMMUTABLE              - Completed matches can't change

INVALID_PAYMENT_AMOUNT       - Amount must be > 0
PLATFORM_FEE_EXCEEDS_LIMIT   - Fee > 10% of amount
INVALID_NET_AMOUNT           - Net amount calculation error
ESCROW_ALREADY_RELEASED      - Can't double-release
PAYMENT_CANNOT_REFUND        - Can't refund completed payment

INVALID_RATING_VALUE         - Rating not 1-5
DUPLICATE_RATING             - Already rated this user for this shipment
SELF_RATING_FORBIDDEN        - Can't rate yourself
SHIPMENT_NOT_COMPLETED       - Can't rate incomplete shipment

DISPUTE_ASSIGNMENT_REQUIRED  - Dispute not assigned to agent
DISPUTE_EXPLANATION_REQUIRED - Dispute resolution needs explanation
DISPUTE_BLOCKS_PAYMENT_RELEASE - Open dispute prevents payment release
```

---

## Usage Examples

### Example 1: Create Shipment with Invariant Validation

```typescript
// app/api/shipments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { 
  validateShipmentCreation,
  invariantErrorHandler 
} from "@/lib/api/invariant-middleware"

export const POST = invariantErrorHandler(async (req: NextRequest) => {
  const userId = req.headers.get("x-user-id")!
  const body = await req.json()

  // 1. Validate invariants
  const validatedData = await validateShipmentCreation(body, userId)

  // 2. Create shipment (RLS ensures it's for current user)
  const { data: shipment, error } = await supabase
    .from("shipments")
    .insert({
      user_id: userId,
      ...validatedData,
    })
    .select()
    .single()

  if (error) throw error

  return NextResponse.json(shipment, { status: 201 })
})
```

### Example 2: Process Payment with Idempotency

```typescript
// app/api/payments/route.ts
import { 
  validatePaymentCreation,
  getIdempotentPayment 
} from "@/lib/api/invariant-middleware"

export const POST = invariantErrorHandler(async (req: NextRequest) => {
  const body = await req.json()
  const userId = req.headers.get("x-user-id")!

  // Check for idempotent payment (prevents duplicate charges)
  if (body.idempotency_key) {
    const existing = await getIdempotentPayment(body.idempotency_key)
    if (existing) {
      return NextResponse.json(existing) // Return existing
    }
  }

  // Validate invariants
  await validatePaymentCreation(body, userId)

  // Create payment
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      ...body,
    })
    .select()
    .single()

  if (error) throw error

  return NextResponse.json(payment, { status: 201 })
})
```

### Example 3: Accept Match with State Validation

```typescript
// app/api/matches/[id]/accept/route.ts
import { 
  validateMatchAcceptance,
  logInvariantViolation 
} from "@/lib/api/invariant-middleware"

export const POST = invariantErrorHandler(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  // Get match
  const { data: match, error: getError } = await supabase
    .from("matches")
    .select("*")
    .eq("id", params.id)
    .single()

  if (getError) throw getError
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Validate state transition
  try {
    await validateMatchAcceptance(params.id, match.status)
  } catch (error) {
    // Log violation
    await logInvariantViolation(
      "matches",
      "UPDATE",
      params.id,
      req.headers.get("x-user-id"),
      (error as Error).message
    )
    throw error
  }

  // Update match
  const { data: updated, error: updateError } = await supabase
    .from("matches")
    .update({ status: "accepted", updated_at: new Date() })
    .eq("id", params.id)
    .select()
    .single()

  if (updateError) throw updateError

  return NextResponse.json(updated)
})
```

---

## Testing

### Unit Tests for Validators

```typescript
// lib/__tests__/invariant-validators.test.ts
import { invariantValidators, InvariantError } from "@/lib/invariants/supabase-validators"

describe("Invariant Validators", () => {
  describe("Phone Format Validation", () => {
    it("accepts valid E.164 format", () => {
      expect(() => {
        invariantValidators.validateE164PhoneFormat("+265123456789")
      }).not.toThrow()
    })

    it("rejects invalid format", () => {
      expect(() => {
        invariantValidators.validateE164PhoneFormat("0123456789")
      }).toThrow(InvariantError)
    })
  })

  describe("Shipment Validation", () => {
    it("rejects zero or negative weight", () => {
      expect(() => {
        invariantValidators.validateShipmentWeight(0)
      }).toThrow(InvariantError)
    })

    it("rejects same origin and destination", () => {
      expect(() => {
        invariantValidators.validateOriginDestinationDifferent("Lilongwe", "Lilongwe")
      }).toThrow(InvariantError)
    })

    it("validates state machine transitions", () => {
      expect(() => {
        // Valid: draft -> pending
        invariantValidators.validateShipmentStatusTransition("draft", "pending")
      }).not.toThrow()

      expect(() => {
        // Invalid: draft -> delivered (skips states)
        invariantValidators.validateShipmentStatusTransition("draft", "delivered")
      }).toThrow(InvariantError)
    })
  })

  describe("Payment Validation", () => {
    it("validates fee calculation", () => {
      const amount = 50000
      const fee = 5000 // 10%
      const netAmount = 45000

      expect(() => {
        invariantValidators.validateNetAmount(amount, fee, netAmount)
      }).not.toThrow()

      expect(() => {
        invariantValidators.validateNetAmount(amount, fee, 44999)
      }).toThrow(InvariantError)
    })
  })
})
```

---

## Troubleshooting

### Issue: "Row Level Security policy violation"

**Cause**: Query violates RLS policy
**Solution**: 
1. Ensure user is authenticated with valid JWT
2. Check policy matches your use case
3. Verify user has necessary role/permissions

### Issue: "Invariant violation" errors in production

**Steps**:
1. Check `audit_logs` table for details
2. Review invariant error code and message
3. Look for patterns (e.g., always same operation)
4. Consider if business logic changed

### Issue: "Idempotency key" conflicts

**Cause**: Different requests with same key
**Solution**:
1. Ensure client generates unique keys per request
2. Use client timestamp + random in key
3. Consider request deduplication window (default: 24 hours)

### Issue: Performance with RLS policies

**Optimization**:
1. Add indexes on RLS policy columns
2. Use materialized views for complex policies
3. Cache policy results where appropriate
4. Monitor query performance with EXPLAIN

---

## Migration Checklist

Before deploying to production:

- [ ] Run both migration files
- [ ] Verify all constraints are active (`\d+ table_name`)
- [ ] Enable RLS on all tables
- [ ] Test RLS policies with different roles
- [ ] Test invariant validators with edge cases
- [ ] Setup audit logging
- [ ] Configure error monitoring/alerts
- [ ] Document any custom policies
- [ ] Train team on error codes
- [ ] Setup monitoring dashboard

---

## Performance Considerations

| Component | Impact | Mitigation |
|-----------|--------|-----------|
| Database Constraints | <1ms per check | Built-in, minimal overhead |
| RLS Policies | 5-20ms per query | Index policy columns |
| Validation Queries | 10-50ms | Batch validate, cache results |
| Audit Logging | 5-10ms | Async logging, separate connection |

---

## References

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/triggers.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
