# MATOLA SYSTEM SPINE ANALYSIS
## Reverse-Engineered Core Invariants & Enforcement Gaps

---

## CURRENT STATE: SYSTEM SPINE

### 1. CORE INVARIANTS (The Guarantees That MUST Hold)

#### Authentication & Authorization Spine
**Invariant**: Every request to protected endpoints must have valid JWT with matching role claims
```typescript
- JWT payload: { userId, phone, role, exp }
- Roles: shipper | transporter | broker | admin
- Token expiry: 24h (access), 7d (refresh)
- Token blacklist: in-memory Set (CRITICAL: Lost on restart)
```

**Issues Found**:
- ⚠️ `tokenBlacklist` is in-memory → logout doesn't persist across server restarts
- ⚠️ No `deviceHash` verification → same JWT valid on any device
- ⚠️ Refresh token invalidation not tracked → old tokens still valid until expiry
- ⚠️ No rate limiting on token generation → brute force OTP verification possible
- ⚠️ `JWT_SECRET` falls back to crypto.randomBytes if env var missing → changes on every restart

---

#### User Identity Spine
**Invariant**: `phone` is globally unique identifier; each user has ONE canonical phone number
```typescript
- Index: users.get(`phone:${phone}`) + users.get(id)
- Dual indexing required for both lookups
```

**Issues Found**:
- ⚠️ No phone normalization ("+265790123456" vs "0790123456" are treated as different)
- ⚠️ No uniqueness constraint at creation → could create duplicates if race condition
- ⚠️ Whitespace/special chars not validated → "+265 790 123 456" ≠ "+265790123456"
- ⚠️ No reconciliation if both indices get out of sync

---

#### Shipment Status Spine
**Invariant**: Shipment flows through state machine: draft → posted → matched → picked_up → in_transit → [checkpoints] → delivered → completed
```typescript
Status enum: draft | posted | matched | confirmed | picked_up | in_transit | at_checkpoint | at_border | delivered | completed | cancelled | disputed
```

**Issues Found**:
- ⚠️ NO STATE MACHINE ENFORCEMENT → can set status to ANY value without validation
- ⚠️ No forbidden transitions tracked → e.g., can go from "delivered" → "in_transit" (impossible)
- ⚠️ Checkpoint updates don't validate sequence → checkpoints could arrive out of order
- ⚠️ No timestamp requirement → status changes with same timestamp are allowed
- ⚠️ `at_checkpoint` and `at_border` states exist but NO validation that shipment actually HAS checkpoints/border crossings defined

---

#### Payment & Escrow Spine
**Invariant**: Money locked in escrow until shipment confirmed; only specific state transitions allowed
```typescript
Escrow states: pending → in_transit → completed → released | disputed → resolved
Valid transitions: hardcoded in VALID_TRANSITIONS array
```

**Issues Found**:
- ⚠️ Escrow stored in-memory → lost on restart, no persistence to database
- ⚠️ `performTransitionSideEffects()` has console.log but NO ACTUAL FUND TRANSFERS
- ⚠️ Mobile money API calls missing → code says "In production: Call mobile money disbursement API"
- ⚠️ Duplicate payment detection uses `shipment_id` uniqueness → same shipper sending duplicate request creates 2 escrows
- ⚠️ No atomicity → escrow state changes without confirming payment provider actually moved money
- ⚠️ Platform fee calculation: fixed 10% → no configurable tiers
- ⚠️ Refund/release lacks idempotency → duplicate requests could double-refund

---

#### Database Layer Spine
**Invariant**: All data persisted in Maps; single source of truth for each entity
```typescript
Maps: users, shipments, matches, payments, ussdSessions, auditLogs
```

**CRITICAL ISSUES**:
- 🚨 **IN-MEMORY ONLY**: All data lost on server restart (development only - not production ready)
- 🚨 **NO PERSISTENCE LAYER**: No actual Neon/Supabase integration despite environment variables existing
- 🚨 **SQL FUNCTION IS A STUB**: `sql()` tagged template function just logs and returns empty array
- ⚠️ No concurrent request handling → race conditions possible in multi-process environment
- ⚠️ No transaction support → multi-step operations can partially fail
- ⚠️ Audit logs are array in memory → logs lost on restart

---

### 2. INPUT VALIDATION STATE

#### Phone Number Validation
```typescript
// Current: z.string().regex(/^\+265[0-9]{9}$/)
// Issues:
- ⚠️ Doesn't accept local format "0790123456"
- ⚠️ No spaces/dashes tolerated
- ⚠️ No normalization function → "+265790123456" stored raw
```

#### OTP Validation
```typescript
// Current: z.string().length(6).regex(/^\d+$/)
// Issues:
- ⚠️ 6-digit numeric only → predictable brute force (1M combinations)
- ⚠️ No rate limiting on verification attempts
- ⚠️ No timestamp expiry check → 1-day old OTPs still valid
- ⚠️ OTP generation not implemented → missing endpoint for /api/auth/send-otp
```

#### Shipment Weight Validation
```typescript
// Current: z.number().positive("Weight must be greater than 0")
// Issues:
- ⚠️ No upper bound → can create shipments with 999999kg weight
- ⚠️ No vehicle capacity validation → 5kg cargo on 20-ton truck is allowed
- ⚠️ No cargo type → weight ratio validation
```

#### Coordinates Validation
```typescript
// Current: lat/lng in [-90/180, +90/180]
// Issues:
- ⚠️ Malawi boundary not enforced: (S9.2°-S17.8°, E28.2°-E35.9°)
- ⚠️ Can create shipments with coordinates in Tanzania/Mozambique but marked as Malawi
```

---

### 3. IMPLICIT GUARANTEES (What Currently Never Breaks)

✅ **Likely Solid**:
- User phone indexing works (dual Map index maintained correctly)
- Role-based access control checked on middleware
- OTP validation regex works (if OTPs are created)
- Escrow state transitions validated against allowed list
- Shipment price/weight positive constraints

❌ **Fragile**:
- Database consistency after restart (data lost)
- Multi-step workflows (no transactions)
- Payment idempotency (no deduplication)
- Concurrent access (in-memory, no locks)

---

### 4. FORBIDDEN STATES (What Causes Crashes)

#### Silent Failures
```typescript
// 1. Missing user lookup returns null
const user = await db.getUserByPhone(phone)
// No null check → crashes on user.id

// 2. Escrow payment has no transporter
// Can transition to "in_transit" before transporterId set
// → funds released to undefined

// 3. Shipment without required fields
// checkpoint without coordinates
// borderCrossing without borderPost

// 4. OTP verification with missing endpoint
// GET /api/auth/send-otp returns 404
// → users can't log in
```

#### Rollback Impossibilities
```typescript
// 1. Payment released to transporter
// → console.log says "In production: API call"
// → actually NO API call happens
// → funds not actually transferred
// → user sees "completed" but no money received

// 2. Duplicate shipment created
// → both get matched
// → both try to pay transporter
// → escrow sees duplicate shipmentId
// → second one returns error
// → but first one already created chaos

// 3. Refund fails halfway
// → shipper refund initiated
// → API call fails
// → Escrow state = "refunded" but money still in escrow
// → shipper sees "refunded" but has no money
// → no retry mechanism
```

---

## ENFORCEMENT GAPS

### Gap 1: State Machine Enforcement
**Problem**: Shipment status has no guards
```typescript
// TODAY (broken):
shipment.status = "delivered" // ✅ allowed anytime
shipment.status = "in_transit" // ✅ allowed anytime (backwards!)

// SHOULD BE (with state machine):
const canTransition = isValidTransition(currentStatus, newStatus, userRole)
if (!canTransition) throw new Error("Invalid transition")
```

**Missing**: Forbidden state checks
- Can transition from "completed" → "cancelled"
- Can transition from "delivered" → "pending"
- Can skip "picked_up" entirely

---

### Gap 2: Consistency Across Distributed State
**Problem**: Escrow, Payment, Shipment status can diverge
```typescript
// SCENARIO: Race condition
// T1: Shipper confirms delivery → escrow → "completed"
// T2: Transporter cancels → shipment → "cancelled"
// RESULT: Inconsistent state
//  - Escrow thinks delivered
//  - Shipment thinks cancelled
// RESOLUTION: ??? No mechanism defined
```

**Missing**: 
- Cross-entity validation
- Audit trail of who changed what
- Conflict resolution rules

---

### Gap 3: Payment Atomicity
**Problem**: Fund transfer can fail silently
```typescript
// MISSING STEPS in transitionEscrow("released"):
1. ✅ Update escrow state = "released"
2. ❌ Validate transporter has valid payment number
3. ❌ Call mobile money API (Airtel/TNM)
4. ❌ Wait for webhook confirmation
5. ❌ If webhook fails, rollback state
6. ❌ Alert admin if timeout > 1hour

// TODAY: Only step 1 happens
```

**Missing**:
- Idempotency keys
- Timeout handling
- Webhook verification
- Automatic retry logic

---

### Gap 4: Silent Failures in Inputs
**Problem**: Invalid data accepted, breaks downstream
```typescript
// EXAMPLE: Missing required field
POST /api/shipments
{
  "origin": "Lilongwe",
  "destination": "Blantyre"
  // ❌ Missing: cargo_type, weight_kg, price_mwk, departure_date
}

// Zod validation SHOULD fail
// But shipment created with defaults
// → matching engine gets garbage data
```

**Missing**:
- Strict schema enforcement (not just presence)
- Semantic validation (weight > capacity?)
- Enum validation (origin is valid Malawi location?)

---

### Gap 5: Role-Based Access Control Inconsistency
**Problem**: Some endpoints check roles, some don't
```typescript
// Shipper-only endpoint
GET /api/shipper/shipments → ✅ requires role:"shipper"

// But shipper can:
GET /api/users/{id} → ❌ No role check (anyone can view profile)
PATCH /api/shipments/{id} → ❌ Only checks auth, not that user owns shipment
```

**Missing**:
- Resource ownership validation
- Consistent role-based gates on all endpoints
- Tenant isolation (shamir can't see transporter's earnings)

---

### Gap 6: Rate Limiting
**Problem**: Brute force attack possible
```typescript
// OTP verification:
POST /api/auth/login
{ phone: "+265790123456", otp: "000000" }
// ❌ No rate limit
// ❌ Try 1M times/second → breaks in 1 second

// Quick post creation:
POST /api/shipments
// ❌ Can spam 10000 shipments/hour
// ❌ Matching engine crashes
```

**Missing**:
- Per-IP rate limits
- Per-user rate limits  
- Exponential backoff for failed auth

---

### Gap 7: Audit Trail Completeness
**Problem**: Audit logs exist but incomplete
```typescript
// MISSING from auditLogs:
- Who accessed what data (all GET requests)
- Payment webhook callbacks
- OTP generation/verification
- Failed auth attempts
- Data exports

// STORED but NOT USED:
- auditLogs array exists
- But no admin endpoint to view logs
- No compliance reporting
```

**Missing**:
- Persistent audit log storage (currently in-memory)
- Log query interface
- Compliance reports (who approved disputes?)

---

## TECHNICAL DEBT VIOLATING GOOD INVARIANTS

### 1. Database Abstraction Layer Broken
```typescript
// lib/api/services/db.ts
// ISSUE: Pretends to be database but uses in-memory Maps

// Function signature suggests it works:
const user = await db.createUser(data)

// But actually:
- ❌ No actual database call
- ❌ Data lost on restart
- ❌ No persistence
- ❌ Can't scale to multiple processes

// INVARIANT VIOLATED: "Persistent data"
// CONSEQUENCE: App suitable only for demo, not production
```

### 2. SQL Tag Template Is a Stub
```typescript
export function sql(strings: TemplateStringsArray, ...values: SQLValue[])
// Just logs and returns []

// Usage in components suggests it works:
const result = await sql`SELECT * FROM shipments WHERE id = ${id}`

// But actually:
// - ❌ Query not executed
// - ❌ Always returns empty
// - ❌ Only useful for development logging
```

### 3. Token Blacklist Not Persisted
```typescript
const tokenBlacklist = new Set<string>()

// INVARIANT: "User is logged out"
// EXPECTED: POST /api/auth/logout → token invalid forever

// ACTUAL:
// 1. POST /api/auth/logout → add token to Set
// 2. Server restarts
// 3. Set is cleared
// 4. Old token is valid again (user magically logged back in!)
```

### 4. Mock Data Hardcoded Instead of Generated
```typescript
// Most API endpoints return hardcoded responses
// No realistic data generation
// No edge cases tested
// INVARIANT VIOLATED: "Data authenticity for testing"
```

---

## BRITTLE ASSUMPTIONS

### 1. Assumption: Shipment Can Exist in Any Status
**Risk**: Broken workflows
```typescript
// If someone patches:
shipment.status = "in_transit"
// Without: cargo_type, weight, destination, price set
// → Matching engine crashes
// → Payment engine crashes
```

### 2. Assumption: User Always Has Valid Phone Number
**Risk**: Lost users after registration
```typescript
// Phone "+265790123456" and "0790123456" are different
// User registers with "+265790123456"
// Later tries to login with "0790123456"
// → Lookup fails → can't login
// → Looks like user deleted
```

### 3. Assumption: Single Transporter Per Shipment
**Risk**: Double-booking
```typescript
// Shipment matched to Transporter A
// No exclusive lock
// Transporter B also accepts same shipment
// → Both think they're getting paid for same cargo
```

### 4. Assumption: Webhook Will Arrive for Payments
**Risk**: Silent payment failures
```typescript
// POST /api/payments/initiate → returns { success, paymentId }
// Frontend shows "Waiting for payment..."
// Webhook from Airtel Money never arrives (API down)
// → Shipment stuck in "pending"
// → No admin alert
// → User thinks payment failed
```

### 5. Assumption: Client Always Sends Complete Data
**Risk**: Partially created shipments
```typescript
// POST /api/shipments { origin, destination }
// Missing: weight_kg, price_mwk, cargo_type
// → Shipment created anyway
// → Transporter can't calculate actual cost
// → Matching engine has incomplete data
```

---

## ENFORCEMENT MECHANISM CHECKLIST

| System | Enforced? | How? | Gaps |
|--------|-----------|------|------|
| **Auth** | Partial | JWT middleware | No logout persistence |
| **User Uniqueness** | Partial | Map indices | No phone normalization |
| **Shipment Status** | ❌ No | None | Can set to any value |
| **Escrow Transitions** | ✅ Yes | VALID_TRANSITIONS | But side effects are stubs |
| **Payment Atomicity** | ❌ No | None | Funds "released" with console.log |
| **Role-Based Access** | Partial | Middleware on some endpoints | Ownership not checked |
| **Input Validation** | Partial | Zod schemas | Some fields optional when required |
| **Rate Limiting** | ❌ No | None | Brute force OTP possible |
| **Idempotency** | ❌ No | None | Duplicate requests create dups |
| **Audit Trail** | Partial | Array created | Not persisted, not queryable |

---

## RECOMMENDATIONS

### Immediate Fixes (Block Production)
1. ✅ Implement real database persistence (Neon/Supabase, not in-memory)
2. ✅ Add shipment state machine with transition guards
3. ✅ Implement OTP generation endpoint + timestamp expiry
4. ✅ Add resource ownership validation (shipper can only edit own shipments)
5. ✅ Implement idempotency keys for payments

### High Priority
6. ⚡ Persist token blacklist (Redis or database)
7. ⚡ Add phone number normalization
8. ⚡ Implement actual mobile money API calls
9. ⚡ Add rate limiting on auth endpoints
10. ⚡ Add webhook signature verification

### Medium Priority
11. 📋 Persist audit logs to database
12. 📋 Add admin audit log viewer
13. 📋 Implement payment retry logic
14. 📋 Add transaction support to multi-step workflows
15. 📋 Add comprehensive error handling

---

## SYSTEM HEALTH SCORE: 35/100

| Component | Status | Score |
|-----------|--------|-------|
| Authentication | ⚠️ Partial | 60% |
| Authorization | ⚠️ Partial | 55% |
| Data Persistence | 🚨 Critical | 10% |
| State Machines | 🚨 Missing | 5% |
| Payment Processing | 🚨 Stub | 15% |
| Input Validation | ⚠️ Partial | 65% |
| Error Handling | 🚨 Missing | 10% |
| Audit Trail | ⚠️ Partial | 50% |
| **Overall** | **🚨** | **35%** |

**Verdict**: Suitable for frontend development & demos. **NOT PRODUCTION READY** without database integration and state machine enforcement.
