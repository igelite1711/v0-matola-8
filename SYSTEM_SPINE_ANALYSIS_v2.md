# Matola System Spine Analysis v2

## EXECUTIVE SUMMARY
**System Health: 45/100** - Functional frontend with critical backend gaps. Renders but lacks persistence, enforcement, and security.

---

## 1. CURRENT STATE: INPUTS/OUTPUTS & VALIDATION

### 1.1 Authentication Flow
**Input Validation:** ✅ PRESENT
- Phone: `+265[89]\d{8}` (Malawi numbers only)
- OTP: Exactly 6 digits
- Role: `shipper | transporter | broker | admin`

**Output:** JWT token (24h expiry) + Refresh token (7d expiry)

**Gap:** Token blacklist is in-memory only - lost on server restart. Users auto-logged in after crash.

### 1.2 Shipment Creation
**Input Validation:** ✅ WELL-DEFINED
- Origin/destination: Non-empty strings
- Coordinates: Valid lat/lng ranges
- Weight: Positive number only
- Price: Positive MWK only
- Departure date: ISO date string

**Output:** Shipment object with UUID, pending status, timestamps

**Gap:** No geographic constraints validation. Can create shipments to invalid Malawi locations.

### 1.3 Payment Processing
**Input Validation:** ✅ PRESENT
- Shipment ID: UUID format
- Method: `airtel_money | tnm_mpamba | cash`
- Webhook payloads: Schema validated

**Output:** Payment object, escrow record

**Gap:** Webhook signatures NOT VERIFIED. Anyone can fake payment completion.

### 1.4 Database Queries
**Validation:** ❌ MISSING
- No schema enforcement
- No type coercion at DB layer
- All data stored in-memory Maps

**Gap:** If process restarts → all data lost permanently.

---

## 2. IMPLICIT GUARANTEES (What Never Breaks)

These are assumptions the code currently makes:

1. ✅ **Phone uniqueness per user** - Enforced at creation time
2. ✅ **Token format** - JWT validation catches malformed tokens
3. ✅ **Pagination** - Bounds checking (1-100 limit)
4. ✅ **Date parsing** - ISO format validation
5. ❌ **Data persistence** - NOT guaranteed (in-memory store)
6. ❌ **Payment idempotency** - Same request = duplicate charge risk
7. ❌ **Shipment status transitions** - Can go pending→delivered without intermediate steps
8. ❌ **Resource ownership** - No checks preventing cross-user access

---

## 3. UNDOCUMENTED FORBIDDEN STATES (What Causes Crashes)

### 3.1 Database Layer Crashes
```typescript
// CRASH: Server restart loses all data
// No recovery mechanism exists
shipments.clear() // All data gone
```

### 3.2 Invalid Status Transitions
```typescript
// ALLOWED but semantically invalid:
// pending → delivered (skipped all intermediate steps)
// delivered → in_transit (impossible - already completed)
// No state machine enforcement
```

### 3.3 Cross-Tenant Access
```typescript
// User B can call PATCH /api/shipments/user-a-shipment-id
// No ownership validation in update logic
// await db.updateShipment(id, data) // No check: is user.id === shipment.shipper_id
```

### 3.4 Payment Replay Attacks
```typescript
// Attacker can send same webhook 100x
// No idempotency key tracking
// Money sent 100 times
```

### 3.5 Token Blacklist Lost on Crash
```typescript
// User logs out → token added to Set
// Server restarts → Set emptied
// Old token still valid
// User can't actually log out
```

---

## 4. LEGACY BEHAVIORS THAT MUST BE PRESERVED

1. **Phone format validation** - Must remain `+265[89]XXXXXXXX` (strict Malawi)
2. **Role-based access** - Three tiers (user → admin) must stay
3. **Shipment status enum** - 11 states including Malawi-specific (at_checkpoint, at_border)
4. **Mobile money methods** - Airtel Money + TNM Mpamba (regional requirement)
5. **Language support** - English + Chichewa (ny) must coexist
6. **Location types** - Must support landmarks + ADMARC depots (Malawi context)

---

## 5. TECHNICAL DEBT VIOLATING INVARIANTS

### 5.1 In-Memory Database (CRITICAL)
**Impact:** Complete data loss on crash
```typescript
const users = new Map<string, any>()      // ← Lost on restart
const shipments = new Map<string, any>()  // ← Lost on restart
const payments = new Map<string, any>()   // ← Lost on restart
```
**Fix Required:** Replace with Supabase persistence

### 5.2 In-Memory Token Blacklist (CRITICAL)
**Impact:** Logout ineffective
```typescript
const tokenBlacklist = new Set<string>()  // ← Lost on restart
```
**Fix Required:** Persist to Redis/Supabase with TTL

### 5.3 In-Memory Rate Limit Store (MEDIUM)
**Impact:** Rate limits reset on crash
```typescript
const rateLimitStore = new Map<string, ...>()  // ← Lost on restart
```
**Fix Required:** Persist to Redis

### 5.4 JWT Secret as Fallback (HIGH RISK)
**Impact:** Secrets exposed if env var missing
```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex")  // ← Generates on first run
)
```
**Fix Required:** Require env vars, never generate

### 5.5 Missing Webhook Verification (CRITICAL)
**Impact:** Anyone can fake payment callbacks
```typescript
// No HMAC signature verification
// Trusts webhook.signature without checking
export const airtelWebhookSchema = z.object({
  signature: z.string(),  // ← Never validated!
  // ...
})
```

---

## 6. BRITTLE ASSUMPTIONS THAT COULD FAIL

| Assumption | Reality | Failure Mode |
|-----------|---------|--------------|
| Phones are unique | Phone reuse (SIM swap) | Users get each other's shipments |
| Status transitions make sense | Operator error | Shipment stuck in invalid state |
| User owns their own shipments | No ownership check | User B reads/modifies User A's loads |
| Payment webhooks are authentic | Unsigned | Fake payments accepted |
| Token blacklist persists | In-memory only | Logout doesn't work after crash |
| Data survives restarts | In-memory only | Complete data loss |
| Locations are in Malawi | No geo validation | Shipment to random coordinates |
| Rate limits prevent abuse | In-memory only | Attacker hammers API after restart |
| Mobile money APIs work | Mocked | Real payments never go through |

---

## ENFORCEMENT GAPS

### 6.1 Where Invariants Exist But Aren't Enforced

| Invariant | Where Defined | Where Checked | Gap |
|-----------|--------------|--------------|-----|
| Shipment ownership | Schema | ❌ API doesn't check | Any user can modify any shipment |
| Payment uniqueness | Escrow logic | ❌ No idempotency key | Duplicate payments possible |
| Status transitions | Type enum | ❌ No validation | pending→delivered allowed |
| Geo boundaries | Location type | ❌ No validation | Locations outside Malawi accepted |
| Rate limits | Middleware config | ❌ In-memory store | Resets on crash |
| Webhook auth | Schema expects signature | ❌ Never verified | Unsigned webhooks trusted |
| Phone uniqueness | Creation logic | ⚠️ Soft check only | Race condition possible |

### 6.2 Where Enforcement is Inconsistent

1. **Authentication**
   - Middleware checks token in some routes
   - Not checked in USSD/WhatsApp handlers
   - Optional in some webhooks

2. **Authorization**
   - Role check exists in auth middleware
   - Resource ownership never checked
   - Mixed: some endpoints check shipper_id, others don't

3. **Data Validation**
   - Strict schemas for inputs
   - Zero schemas for internal state
   - Database updates bypass validation

### 6.3 Where Failures Are Silent

| Failure | Symptom | Impact |
|---------|---------|--------|
| Payment webhook fails | No error logged | Payment "succeeds" but money never moves |
| Token blacklist full | Set grows unbounded | Memory leak, eventual crash |
| Rate limit key collision | Unrelated users rate-limited together | Denial of service |
| Database Map key collision | Impossible (UUID) but risky pattern | Data corruption if UUID generator breaks |
| Date parsing fails | Silently uses invalid date | Shipments match on wrong dates |

### 6.4 Where Rollback is Impossible

1. **Payment Escrow**
   - Escrow created → payment initiated
   - Payment fails → no automatic refund
   - Status stuck at "pending"

2. **Shipment Status**
   - Status updated to "in_transit"
   - Transporter never shows up
   - No way to revert (no audit of status changes)

3. **User Verification**
   - Verification status set once
   - No history of who verified or why
   - Can't audit verification chain

4. **Token Blacklist**
   - Token added to blacklist
   - Crash → blacklist lost
   - Token valid again permanently
   - Can't track logout events

---

## 7. HEALTH SCORE BREAKDOWN (45/100)

**Frontend (✅ 90/100)**
- Beautiful UI, responsive, works offline
- All pages render correctly
- Animations and UX excellent

**API Structure (✅ 70/100)**
- Clean route organization
- Good middleware pattern
- Zod validation framework
- Missing: Request/response documentation

**Authentication (⚠️ 60/100)**
- Token generation solid
- Logout doesn't persist
- No device binding
- Rate limiting exists but not enforced

**Data Persistence (❌ 20/100)**
- In-memory only
- No backups
- Complete loss on crash
- Zero recovery

**Security (❌ 30/100)**
- No webhook verification
- No CSRF protection
- No rate limit enforcement
- SQL injection risk (if DB used): no parameterization shown

**Resource Ownership (❌ 10/100)**
- Zero checks
- Users can access others' data
- No multi-tenant isolation

---

## 8. CRITICAL ISSUES PRIORITY

### P0 (Blocks Production)
1. ⚠️ Replace in-memory database with Supabase
2. ⚠️ Persist token blacklist to Redis
3. ⚠️ Verify webhook signatures (HMAC-SHA256)
4. ⚠️ Add resource ownership checks
5. ⚠️ Implement shipment state machine

### P1 (Major Bugs)
6. Persist rate limit store to Redis
7. Add payment idempotency tracking
8. Implement status transition validation
9. Add geographic boundary validation
10. Fix JWT secret requirement

### P2 (Nice to Have)
11. Add request/response documentation
12. Implement audit log persistence
13. Add device fingerprinting
14. Implement read-only database replicas
15. Add distributed tracing

---

## 9. MIGRATION PATH (To 100/100)

1. **Week 1:** Implement Supabase persistence for core entities
2. **Week 2:** Add resource ownership validation + state machine
3. **Week 3:** Implement webhook verification + idempotency
4. **Week 4:** Persist blacklist/rate limits + security hardening
5. **Week 5:** Add audit logging + compliance features
