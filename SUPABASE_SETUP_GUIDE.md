# MATOLA Supabase - Complete Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Verify Environment Variables

```bash
# Check your .env.local or Vercel project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Apply Database Migrations

```bash
# Option A: Using Supabase CLI (recommended)
supabase migration new add_invariant_constraints
supabase migration new add_rls_policies
supabase db push

# Option B: Using psql directly
psql postgresql://user:password@host/database < scripts/migrations/005_invariant_constraints.sql
psql postgresql://user:password@host/database < scripts/migrations/006_rls_policies.sql
```

### Step 3: Test Connection

```typescript
// Test file: test-supabase.ts
import { supabase } from "@/lib/supabase/client"

async function testConnection() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .limit(1)

  if (error) console.error("Connection failed:", error)
  else console.log("✅ Connected to Supabase")
}
```

---

## 📁 Project Structure

```
lib/
├── supabase/
│   └── client.ts                    # Supabase client setup
├── invariants/
│   └── supabase-validators.ts       # 60+ validation functions
├── api/
│   └── invariant-middleware.ts      # API integration layer
└── __tests__/
    └── invariant-validators.test.ts # Test suite

scripts/
└── migrations/
    ├── 005_invariant_constraints.sql # Database constraints
    └── 006_rls_policies.sql         # RLS policies

docs/
├── SUPABASE_INVARIANTS.md           # Complete guide
└── MATOLA_SYSTEM_INVARIANTS.md      # Business rules
```

---

## 📚 Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **SUPABASE_INVARIANTS_COMPLETE.md** | Overview & delivery summary | 5 min |
| **docs/SUPABASE_INVARIANTS.md** | Full implementation guide | 20 min |
| **docs/MATOLA_SYSTEM_INVARIANTS.md** | Business rules & constraints | 30 min |
| **SUPABASE_SETUP_GUIDE.md** (this file) | Setup & quick reference | 5 min |

---

## 🔧 Implementation Steps

### For API Route: Create Shipment

```typescript
// app/api/shipments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"
import { validateShipmentCreation, invariantErrorHandler } from "@/lib/api/invariant-middleware"

export const POST = invariantErrorHandler(async (req: NextRequest) => {
  const userId = req.headers.get("x-user-id")!
  const body = await req.json()

  // 1. Validate all invariants
  const validated = await validateShipmentCreation(body, userId)

  // 2. Insert (RLS + constraints enforce rules)
  const { data: shipment, error } = await supabase
    .from("shipments")
    .insert({
      user_id: userId,
      ...validated,
    })
    .select()
    .single()

  if (error) throw error

  return NextResponse.json(shipment, { status: 201 })
})
```

### For API Route: Create Payment

```typescript
// app/api/payments/route.ts
import { validatePaymentCreation, invariantErrorHandler } from "@/lib/api/invariant-middleware"

export const POST = invariantErrorHandler(async (req: NextRequest) => {
  const body = await req.json()
  const userId = req.headers.get("x-user-id")!

  // Check for idempotent payment (prevents duplicate charges)
  if (body.idempotency_key) {
    const existing = await invariantValidators.getIdempotentPayment(body.idempotency_key)
    if (existing) return NextResponse.json(existing) // Return existing
  }

  // Validate invariants
  const validated = await validatePaymentCreation(body, userId)

  // Create payment
  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      ...validated,
    })
    .select()
    .single()

  if (error) throw error

  return NextResponse.json(payment, { status: 201 })
})
```

---

## 🧪 Testing Your Invariants

### Test 1: Weight Validation

```typescript
import { invariantValidators, InvariantError } from "@/lib/invariants/supabase-validators"

// Should throw
expect(() => {
  invariantValidators.validateShipmentWeight(0)
}).toThrow(InvariantError)

// Should pass
expect(() => {
  invariantValidators.validateShipmentWeight(500)
}).not.toThrow()
```

### Test 2: Status State Machine

```typescript
// Valid transitions
invariantValidators.validateShipmentStatusTransition("draft", "pending") // ✅
invariantValidators.validateShipmentStatusTransition("pending", "posted") // ✅
invariantValidators.validateShipmentStatusTransition("delivered", "completed") // ✅

// Invalid transitions
invariantValidators.validateShipmentStatusTransition("draft", "delivered") // ❌
invariantValidators.validateShipmentStatusTransition("completed", "cancelled") // ❌
```

### Test 3: Idempotency

```typescript
// First request
const response1 = await fetch("/api/payments", {
  method: "POST",
  body: JSON.stringify({
    amount_mwk: 50000,
    idempotency_key: "req-12345-abc"
  })
})

// Same request (should return same payment)
const response2 = await fetch("/api/payments", {
  method: "POST",
  body: JSON.stringify({
    amount_mwk: 50000,
    idempotency_key: "req-12345-abc"
  })
})

// Both should have same payment ID
expect(response1.id).toEqual(response2.id)
```

---

## 🔐 Security Best Practices

### 1. Always Use RLS
```typescript
// ✅ CORRECT - RLS automatically restricts
const { data } = await supabase
  .from("shipments")
  .select("*")
  // RLS policy ensures only user's shipments returned

// ❌ WRONG - Bypasses RLS
const { data } = await supabaseAdmin
  .from("shipments")
  .select("*")
  // This uses service role, bypasses RLS!
```

### 2. Validate Before Insert
```typescript
// ✅ CORRECT
await validateShipmentCreation(body, userId)
const { data } = await supabase.from("shipments").insert(body)

// ❌ WRONG - Trusting database to catch errors
const { data } = await supabase.from("shipments").insert(body)
```

### 3. Handle Errors Gracefully
```typescript
// ✅ CORRECT
try {
  await validateShipmentCreation(body, userId)
} catch (error) {
  if (error instanceof InvariantError) {
    return NextResponse.json(
      { error: error.code, message: error.message },
      { status: error.statusCode }
    )
  }
  throw error
}

// ❌ WRONG - Generic error response
try {
  // ...
} catch (error) {
  return NextResponse.json({ error: "Something went wrong" })
}
```

### 4. Log Violations
```typescript
import { logInvariantViolation } from "@/lib/api/invariant-middleware"

try {
  await validatePaymentCreation(body, userId)
} catch (error) {
  await logInvariantViolation(
    "payments",
    "INSERT",
    body.id,
    userId,
    error.message
  )
  throw error
}
```

---

## 📊 Monitoring & Debugging

### Check Audit Logs

```sql
-- Recent violations
SELECT * FROM audit_logs 
WHERE invariant_violation = true
ORDER BY created_at DESC
LIMIT 20;

-- Violations by type
SELECT violation_message, COUNT(*) as count
FROM audit_logs 
WHERE invariant_violation = true
GROUP BY violation_message
ORDER BY count DESC;

-- Violations by user
SELECT user_id, COUNT(*) as violations
FROM audit_logs 
WHERE invariant_violation = true
GROUP BY user_id
ORDER BY violations DESC;
```

### Verify RLS is Enabled

```sql
-- Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'shipments', 'payments', 'matches', 'ratings');

-- Check policies on a table
SELECT policyname, permissive, cmd 
FROM pg_policies 
WHERE tablename = 'shipments';
```

### Test Validator Directly

```typescript
// app/api/test/validate/route.ts
export const POST = async (req: NextRequest) => {
  const body = await req.json()

  try {
    await validateShipmentCreation(body, "test-user")
    return NextResponse.json({ valid: true })
  } catch (error) {
    return NextResponse.json({
      valid: false,
      error: error instanceof InvariantError 
        ? { code: error.code, message: error.message }
        : { message: (error as Error).message }
    })
  }
}
```

---

## 🚨 Common Issues & Solutions

### Issue: "Permission denied for schema public"

**Solution**: Ensure service role key is being used for admin operations
```typescript
// Use admin client
const { data } = await supabaseAdmin
  .from("audit_logs")
  .select("*")
```

### Issue: "Row Level Security policy violation"

**Solution**: Ensure user is authenticated with valid JWT
```typescript
// In API middleware, get auth token
const token = req.headers.get("authorization")?.split(" ")[1]
const { data: { user } } = await supabase.auth.getUser(token)
```

### Issue: "Invariant violation" on valid data

**Solution**: Check database constraints
```sql
-- View all constraints on table
\d+ shipments

-- Remove constraint if wrong
ALTER TABLE shipments DROP CONSTRAINT name;

-- Re-apply migration
psql < scripts/migrations/005_invariant_constraints.sql
```

### Issue: Idempotency key conflicts

**Solution**: Use unique key format
```typescript
// Generate unique key
const idempotencyKey = `${userId}-${Date.now()}-${Math.random()}`

// Or use UUID
const idempotencyKey = crypto.randomUUID()
```

---

## ✅ Production Deployment Checklist

- [ ] **Database**
  - [ ] Applied both migrations
  - [ ] Verified constraints are active
  - [ ] RLS enabled on all tables
  - [ ] Tested with different user roles

- [ ] **Application**
  - [ ] Environment variables configured
  - [ ] All validators imported correctly
  - [ ] Error handling in all API routes
  - [ ] Idempotency keys for payment operations

- [ ] **Monitoring**
  - [ ] Audit logging working
  - [ ] Error tracking configured (Sentry, etc.)
  - [ ] Monitoring dashboard setup
  - [ ] Alerts on invariant violations

- [ ] **Testing**
  - [ ] Unit tests passing
  - [ ] Edge cases tested
  - [ ] Load testing completed
  - [ ] Backup/restore tested

- [ ] **Documentation**
  - [ ] Team trained on error codes
  - [ ] Custom policies documented
  - [ ] Runbooks created
  - [ ] Disaster recovery plan

---

## 🔗 Quick Links

| Link | Purpose |
|------|---------|
| **Supabase Dashboard** | Monitor database |
| **Migration Files** | `scripts/migrations/00X_*.sql` |
| **Validators** | `lib/invariants/supabase-validators.ts` |
| **API Middleware** | `lib/api/invariant-middleware.ts` |
| **Documentation** | `docs/SUPABASE_INVARIANTS.md` |
| **Error Codes** | See SUPABASE_INVARIANTS_COMPLETE.md |

---

## 📞 Getting Help

1. **Implementation Issues**
   - Check `docs/SUPABASE_INVARIANTS.md` section "API Integration"
   - Review usage examples in this document

2. **Database Issues**
   - Check `docs/SUPABASE_INVARIANTS.md` section "Troubleshooting"
   - Verify migrations were applied: `\d+ shipments`

3. **Validation Errors**
   - Check error code in SUPABASE_INVARIANTS_COMPLETE.md
   - Review validator function in supabase-validators.ts

4. **Performance Issues**
   - Check "Performance Metrics" in SUPABASE_INVARIANTS_COMPLETE.md
   - Add indexes if needed: `CREATE INDEX idx_name ON table(column)`

---

## 🎯 Summary

You now have:

✅ **60+ Invariants** enforced across 3 layers
✅ **RLS Policies** for authorization
✅ **Database Constraints** for data integrity
✅ **TypeScript Validators** for business logic
✅ **API Middleware** for easy integration
✅ **Audit Logging** for compliance
✅ **Comprehensive Docs** for reference

**Status**: Ready for production deployment

---

**Last Updated**: February 1, 2026
