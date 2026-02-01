# Audit Findings → System Invariants Mapping
## Which Issues Violate Which Invariants

---

## CRITICAL VIOLATIONS (Blocks Deployment)

### 1. Missing Database Migrations
**Invariant Violated:** 
- Section 8 (Consistency): "Database migrations must be reversible"
- Section 11 (Compliance): "Payment records must be immutable"
- All data integrity invariants (Section 1)

**Current Impact:**
- Cannot initialize database → Cannot run app
- All invariants become unenforceable
- No audit trail capability

**Risk Level:** BLOCKING - App cannot start

**Fix Required:**
```bash
# Generate migrations from Prisma schema
npx prisma migrate dev --name init

# Create seed data
npm run seed-database
```

**Verification:**
- [ ] `prisma/migrations/` folder contains migration files
- [ ] `_prisma_migrations` table exists in database
- [ ] All constraints enforced:
  - Unique phone numbers (Section 1.1)
  - E.164 phone format validated at DB level
  - Positive weight/price checks
  - State machine constraints

---

### 2. Environment Variables Not Configured
**Invariant Violated:**
- Section 7 (External Integrations): "All payment requests must include unique transaction IDs"
- Section 7: "Webhook callbacks must be verified with signatures"
- Section 5 (Security): "API keys must never be logged or exposed"
- Section 6 (Operational): "Critical errors must trigger alerts within 1 minute"

**Current Impact:**
- Cannot connect to payment providers (Airtel, TNM) → Payments fail
- Cannot verify webhooks → Fraud vulnerability
- Cannot access Redis → Background jobs fail
- Cannot send notifications → Users never notified

**Risk Level:** BLOCKING - Core functionality unavailable

**Required Environment Variables:**
```
# Database
DATABASE_URL=postgresql://user:pass@localhost/matola

# Redis (Optional but required for production)
REDIS_URL=redis://...

# Payment Providers
AIRTEL_MONEY_API_KEY=
AIRTEL_MONEY_WEBHOOK_SECRET=
TNM_MPAMBA_API_KEY=
TNM_MPAMBA_WEBHOOK_SECRET=

# SMS/Notifications
AFRICAS_TALKING_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# Admin Panel
ADMIN_PHONE=+265999999999
ADMIN_PASSWORD_HASH=

# Security
JWT_SECRET=
ENCRYPTION_KEY=
CSRF_SECRET=

# Monitoring
SENTRY_DSN=
LOG_LEVEL=error
```

**Verification:**
- [ ] All required env vars in `.env.local`
- [ ] No hardcoded secrets in code
- [ ] Secrets rotate monthly
- [ ] Webhook signatures verified on first payment

---

### 3. Redis Integration Not Optional (Background Jobs Required)
**Invariant Violated:**
- Section 6 (Operational): "System uptime must be ≥ 99.5%"
- Section 2 (Financial): "Every financial transaction must be logged in audit_logs"
- Section 9 (Notifications): "Critical notifications must be delivered at least once"
- Section 1 (Data Integrity): "Match state transitions must follow state machine"

**Current Impact:**
- Background jobs fail silently → No audit logs, matches expire, payments not reconciled
- USSD sessions fail after 5 min → Users stuck mid-transaction
- Notifications queued but never sent → Users don't know shipment status

**Risk Level:** CRITICAL (99% of background functionality broken)

**Services That Depend on Redis:**
1. **Matching Job** (`lib/jobs/matching-job.ts`) - Runs every 5 min
2. **Cleanup Job** (`lib/jobs/cleanup-job.ts`) - Runs every hour
3. **Notification Job** (`lib/jobs/notification-job.ts`) - Runs continuously
4. **USSD Sessions** (`lib/ussd/redis-session.ts`) - Session storage
5. **Rate Limiting** (`lib/rate-limit/rate-limiter.ts`) - Prevent abuse
6. **Token Blacklist** (`lib/auth/jwt.ts`) - Logout enforcement

**Why It Must Work:**
- **Financial reconciliation** depends on matching job
- **User notifications** depend on notification job
- **Session management** depends on Redis
- **Security** depends on rate limiting + token blacklist

**Fix Required:**
1. Set up Upstash Redis (dev) or local Redis (dev)
2. Configure `REDIS_URL` environment variable
3. Verify BullMQ connection in `scripts/start-workers.ts`

**Verification:**
- [ ] `redis-cli ping` returns PONG
- [ ] `npm run start:workers` completes without errors
- [ ] Matching job runs every 5 minutes (check logs)
- [ ] USSD sessions persist across requests

---

### 4. Token Blacklist Not Persistent
**Invariant Violated:**
- Section 3 (Session): "Expired tokens must never be accepted"
- Section 3 (Session): "Session invalidation must be immediate"
- Section 5 (Security): "Users cannot access admin endpoints when logged out"

**Current Impact:**
- User logs out → Token still accepted until 24h expires
- Server restart → All logout tokens forgotten → Security hole
- Admin can't be locked out → Compliance violation

**Risk Level:** HIGH - Security vulnerability

**Where It's Broken:**
```typescript
// lib/auth/jwt.ts (line ~78)
// Token blacklist only stored in memory
const tokenBlacklist = new Set<string>();

// On server restart, this Set is lost
// User's logout tokens are re-accepted
```

**Fix Required:**
Move blacklist to Redis:
```typescript
// Before: In-memory Set (lost on restart)
const tokenBlacklist = new Set<string>();

// After: Redis with TTL
await redis.setex(`token:blacklist:${token}`, 86400, 'true');
const isBlacklisted = await redis.exists(`token:blacklist:${token}`);
```

**Verification:**
- [ ] Token blacklist stored in Redis
- [ ] Blacklist entries have 24h TTL
- [ ] Logout persists across server restart
- [ ] Old tokens auto-expire from blacklist

---

### 5. No Connection Pooling (Database)
**Invariant Violated:**
- Section 6 (Operational): "Database connection pool must never exceed 90% utilization"
- Section 6 (Operational): "System uptime must be ≥ 99.5%"

**Current Impact:**
- 50 concurrent users → Connection pool exhausted
- App crashes with "too many connections" error
- No graceful degradation → Complete outage

**Risk Level:** HIGH - Production failure inevitable at scale

**Where It's Broken:**
```typescript
// lib/db/prisma.ts
// Using default Prisma connection pool (10 connections)
// Not configured for production load
```

**Fix Required:**
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Add connection pool configuration
  connection_limit = 20  // Max connections
  connection_timeout = 10  // Timeout in seconds
}

// Or use PgBouncer for connection pooling at DB level
```

**Verification:**
- [ ] Connection pool size = 20 (production)
- [ ] Connection timeout = 10s
- [ ] Load test to 100 concurrent users passes
- [ ] No "too many connections" errors

---

## HIGH-PRIORITY VIOLATIONS (Blocks Security/Compliance)

### 6. Payment Webhooks Not Signature-Verified
**Invariant Violated:**
- Section 7 (External Integrations): "Webhook callbacks must be verified with signatures"
- Section 5 (Security): "API keys must never be logged or exposed"
- Section 2 (Financial): "Every financial transaction must be logged"
- Section 11 (Compliance): "All financial transactions must have audit trail"

**Current Impact:**
- Attacker can fabricate payment confirmations
- Fake "payment received" → Shipment released without payment
- Revenue loss + fraud liability

**Risk Level:** CRITICAL - Direct fraud vulnerability

**Where It's Broken:**
```typescript
// app/api/payments/webhook/airtel/route.ts (line ~45)
// No signature verification
const payload = req.body;  // Could be forged
const paymentStatus = payload.status;  // Trusting untrusted input

// Should verify:
// 1. HMAC signature matches webhook secret
// 2. Timestamp not older than 5 minutes
// 3. Request body hasn't been tampered
```

**Fix Required:**
```typescript
async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('X-Airtel-Signature');
  const timestamp = req.headers.get('X-Airtel-Timestamp');
  
  // Verify signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.AIRTEL_WEBHOOK_SECRET)
    .update(body + timestamp)
    .digest('hex');
    
  if (signature !== expectedSig) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Verify timestamp (reject if > 5 min old)
  const webhookTime = parseInt(timestamp);
  const now = Date.now();
  if (now - webhookTime > 5 * 60 * 1000) {
    return Response.json({ error: 'Request expired' }, { status: 400 });
  }
  
  // Now safe to process
  const payload = JSON.parse(body);
  // ...
}
```

**Verification:**
- [ ] All webhook endpoints verify signatures
- [ ] Timestamp validation prevents replay attacks
- [ ] Invalid signatures are logged (not silently ignored)
- [ ] Affected webhooks: Airtel, TNM, Africa's Talking

---

### 7. Resource Ownership Not Checked Consistently
**Invariant Violated:**
- Section 1 (Data Integrity): "Users cannot access data they don't own"
- Section 5 (Data Privacy): "Payment details must only be visible to involved parties"
- Section 5 (Data Privacy): "Phone numbers must never be exposed to unauthorized users"

**Current Impact:**
- User A can view User B's payment history
- Transporter can see all shipments (not just theirs)
- Admin data leak possible

**Risk Level:** HIGH - Data breach vulnerability

**Where It's Broken:**
```typescript
// app/api/payments/route.ts (line ~32)
export async function GET(req: Request) {
  const payments = await db.payment.findMany();  // NO FILTER!
  return Response.json(payments);  // Returns all payments for all users
}

// Should check:
const user = await getAuthenticatedUser(req);
const payments = await db.payment.findMany({
  where: {
    shipment: {
      OR: [
        { shipper_id: user.id },
        { transporter_id: user.id }
      ]
    }
  }
});
```

**Affected Endpoints:**
1. `GET /api/payments` - No user filter
2. `GET /api/shipments/[id]` - No ownership check
3. `GET /api/ratings` - No visibility control
4. `GET /api/matches` - May expose private data

**Fix Required:**
Add ownership checks to all GET endpoints:
```typescript
// Middleware: Verify ownership before returning data
function requireOwnership(userId: string, ownerId: string) {
  if (userId !== ownerId) {
    throw new UnauthorizedError('Access denied');
  }
}

// In routes:
const payment = await db.payment.findUnique({ where: { id } });
requireOwnership(user.id, payment.shipment.shipper_id);
```

**Verification:**
- [ ] User A cannot view User B's payments
- [ ] Transporter cannot view other transporters' matches
- [ ] Phone numbers hidden from non-involved users
- [ ] API audit shows no unauthorized data access

---

### 8. Payment Idempotency Not Implemented
**Invariant Violated:**
- Section 2 (Financial): "Payment state transitions must be atomic"
- Section 2 (Financial): "Negative balances are forbidden"
- Section 9 (Notifications): "Notifications must be idempotent"
- Section 2 (Financial): "Concurrent payment modifications must be prevented"

**Current Impact:**
- Network timeout → Client retries → Payment charged twice
- User charged 2x for same shipment
- Escrow funds double-released
- Platform loses money

**Risk Level:** HIGH - Financial loss inevitable

**Where It's Broken:**
```typescript
// app/api/payments/initiate/route.ts (line ~67)
// No idempotency key check
export async function POST(req: Request) {
  const { amount, shipmentId } = await req.json();
  
  // First request succeeds
  const payment = await createPayment({ amount, shipmentId });
  
  // Retry on network timeout
  // Creates DUPLICATE payment (no idempotency key)
  const payment2 = await createPayment({ amount, shipmentId });
}
```

**Fix Required:**
Use idempotency keys:
```typescript
export async function POST(req: Request) {
  const { amount, shipmentId, idempotencyKey } = await req.json();
  
  // Check if this request was already processed
  const existing = await db.payment.findUnique({
    where: { idempotencyKey }
  });
  if (existing) {
    return Response.json(existing);  // Return cached result
  }
  
  // Process new payment
  const payment = await db.payment.create({
    data: {
      amount,
      shipmentId,
      idempotencyKey,
      status: 'pending'
    }
  });
  
  return Response.json(payment);
}
```

**Verification:**
- [ ] All state-changing operations require idempotencyKey
- [ ] Duplicate requests return cached result
- [ ] Load test: 1000 concurrent identical requests → 1 payment
- [ ] Payment reconciliation shows no duplicates

---

### 9. Shipment State Machine Not Enforced
**Invariant Violated:**
- Section 1 (Data Integrity): "Shipment status transitions must follow the defined state machine"
- Section 1 (Data Integrity): "Once a shipment is marked completed, it can never transition"
- Section 2 (Financial): "Payment release during dispute must be blocked"

**Current Impact:**
- Shipment status: pending → completed → cancelled (invalid transition)
- Payment released while dispute open → Lost evidence
- Compensation claims denied due to invalid state

**Risk Level:** MEDIUM - Business logic errors, not security

**Fix Required:**
Enforce state machine in application:
```typescript
// lib/invariants/data-integrity.ts
const SHIPMENT_TRANSITIONS = {
  'pending': ['assigned', 'cancelled'],
  'assigned': ['in_transit', 'cancelled'],
  'in_transit': ['completed', 'failed'],
  'completed': [],  // Terminal state
  'failed': ['pending'],
  'cancelled': []   // Terminal state
};

function validateTransition(oldStatus, newStatus) {
  const allowed = SHIPMENT_TRANSITIONS[oldStatus];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Invalid transition: ${oldStatus} -> ${newStatus}`
    );
  }
}
```

**Verification:**
- [ ] Completed shipments cannot be un-completed
- [ ] Invalid transitions rejected with error
- [ ] State transitions logged in audit trail
- [ ] Database constraint enforced

---

## MEDIUM-PRIORITY VIOLATIONS (Quality/Performance)

### 10. Missing Rate Limiting
**Invariant Violated:**
- Section 7 (SMS): "SMS sending must respect rate limits (100/min max)"
- Section 5 (Security): "Brute force attacks must be prevented"

**Current Impact:**
- Attacker sends 10000 SMS/min → Carrier blocks account
- Users experience SMS delivery failures
- Competitors could DoS platform

**Risk Level:** MEDIUM - Service degradation

---

### 11. No Request Deduplication for USSD
**Invariant Violated:**
- Section 7 (USSD): "USSD sessions must be idempotent"

**Current Impact:**
- Network glitch → Request sent twice
- User charged twice for same action
- State corrupted

**Risk Level:** MEDIUM - User complaints

---

## Summary: Invariant Coverage

| Invariant Category | Violated By Audit Issue | Severity | Fix Time |
|---|---|---|---|
| Data Integrity (1) | Missing migrations, No state machine | CRITICAL | 4h |
| Financial (2) | No idempotency, No signature verification | CRITICAL | 6h |
| Session/State (3) | Token blacklist ephemeral | HIGH | 2h |
| Business Logic (4) | No state machine, No matching SLA | MEDIUM | 3h |
| Security (5) | Webhooks unverified, Ownership unchecked | CRITICAL | 4h |
| Operational (6) | No connection pool, No monitoring | HIGH | 3h |
| Integrations (7) | Webhooks unverified, No rate limiting | CRITICAL | 5h |
| Consistency (8) | No migrations, No state machine | CRITICAL | 4h |
| Notifications (9) | No idempotency, No persistence | HIGH | 3h |
| Concurrency (10) | No locking on payment release | HIGH | 2h |
| Compliance (11) | No audit trail enforcement | CRITICAL | 4h |
| Testing (12) | Not assessed yet | UNKNOWN | 10h |

**Total Time to Full Invariant Compliance: ~50 hours**

**Phase 1 (Critical Blockers): 4-6 hours**
- Migrations working
- Env vars configured
- Redis optional but working

**Phase 2 (Security): 12-15 hours**
- Webhook verification
- Ownership checks
- Idempotency keys
- Payment locking

**Phase 3 (Quality): 10-15 hours**
- Rate limiting
- Connection pooling
- Monitoring
- Tests

---

## Next Steps

1. **Start with Phase 1** (Critical Blockers) - Get app running locally
2. **Then Phase 2** (Security) - Fix fraud vulnerabilities  
3. **Then Phase 3** (Quality) - Hardening for production

Each phase must be complete before proceeding to next.
