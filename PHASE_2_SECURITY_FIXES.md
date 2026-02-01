# PHASE 2: SECURITY FIXES (Preventing Fraud & Data Leaks)
## Estimated Time: 12-15 hours | Priority: DO THIS SECOND

After Phase 1 (app boots locally), immediately move to Phase 2. These are direct fraud vulnerabilities that could lose money or expose user data.

---

## Security Issue 2.1: Webhook Signature Verification (2 hours)

### Vulnerability
Attackers can forge payment confirmations without providing actual funds.

**Attack Scenario:**
```
1. Attacker sends fake HTTP POST to /api/payments/webhook/airtel
2. Forged payload: { "status": "success", "ref": "SHIP-001" }
3. App trusts it (no signature verification)
4. Shipment marked "paid" without payment
5. Attacker gets free shipping
```

**Business Impact:** Each shipment could be $100-500 in losses. 10 fraudulent shipments = $1000-5000 loss per day.

### Current Code Problem
```typescript
// app/api/payments/webhook/airtel/route.ts (INSECURE)
export async function POST(req: Request) {
  const body = await req.json();  // ❌ Trusts body as-is
  
  // Immediately processes payment
  await processPayment(body.ref, body.amount, body.status);
  
  return Response.json({ ok: true });
}
```

### Fix Required

**Step 2.1a: Add Signature Verification to Airtel Webhook**

Edit: `/app/api/payments/webhook/airtel/route.ts`

```typescript
import crypto from 'crypto';
import { logger } from '@/lib/monitoring/logger';

export async function POST(req: Request) {
  try {
    // 1. Get raw body and signature from headers
    const signature = req.headers.get('X-Webhook-Signature');
    const timestamp = req.headers.get('X-Webhook-Timestamp');
    const body = await req.text();
    
    // 2. Verify signature
    const secret = process.env.AIRTEL_WEBHOOK_SECRET;
    if (!secret) {
      logger.error('AIRTEL_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body + timestamp)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      logger.warn('Invalid Airtel webhook signature', {
        received: signature,
        expected: expectedSignature,
        ip: req.headers.get('x-forwarded-for')
      });
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // 3. Verify timestamp (reject if > 5 minutes old, prevents replay attacks)
    const webhookTime = parseInt(timestamp);
    const now = Date.now();
    const timeDiff = Math.abs(now - webhookTime);
    
    if (timeDiff > 5 * 60 * 1000) {
      logger.warn('Airtel webhook timestamp too old', { timeDiff });
      return Response.json({ error: 'Request expired' }, { status: 400 });
    }
    
    // 4. Parse body (now verified safe)
    const payload = JSON.parse(body);
    
    // 5. Check for duplicate payment (idempotency)
    const existing = await db.payment.findFirst({
      where: { external_ref: payload.ref }
    });
    if (existing) {
      return Response.json({ ok: true });  // Already processed
    }
    
    // 6. Process payment
    await processPaymentWebhook(payload);
    
    // 7. Log for audit trail
    logger.info('Airtel payment processed', {
      ref: payload.ref,
      amount: payload.amount,
      status: payload.status
    });
    
    return Response.json({ ok: true });
    
  } catch (error) {
    logger.error('Airtel webhook error', { error });
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
}
```

**Step 2.1b: Add Signature Verification to TNM Webhook**

Edit: `/app/api/payments/webhook/tnm/route.ts`

Same pattern as Airtel (TNM uses same HMAC-SHA256 signature scheme).

**Step 2.1c: Add Signature Verification to Generic Webhook**

Edit: `/app/api/payments/webhook/route.ts`

Add verification middleware before processing any webhook.

### Verification

**Manual Test:**
```bash
# Test with invalid signature (should fail)
curl -X POST http://localhost:3000/api/payments/webhook/airtel \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: invalid_sig" \
  -H "X-Webhook-Timestamp: $(date +%s)000" \
  -d '{"ref":"PAY-001","status":"success"}'

# Expected response: 401 Unauthorized
```

**Automated Test:**
```typescript
// tests/api/payment-webhook.test.ts
describe('Payment Webhook Security', () => {
  it('should reject webhook with invalid signature', async () => {
    const response = await fetch('/api/payments/webhook/airtel', {
      method: 'POST',
      headers: {
        'X-Webhook-Signature': 'invalid',
        'X-Webhook-Timestamp': Date.now().toString()
      },
      body: JSON.stringify({ ref: 'PAY-001', status: 'success' })
    });
    
    expect(response.status).toBe(401);
  });
});
```

### Files to Update
- [ ] `/app/api/payments/webhook/airtel/route.ts` - Add signature verification
- [ ] `/app/api/payments/webhook/tnm/route.ts` - Add signature verification  
- [ ] `/app/api/payments/webhook/route.ts` - Generic webhook handler
- [ ] `.env.example` - Document webhook secret env vars
- [ ] `tests/api/payment-webhook.test.ts` - Add security tests

### Verification Checklist
- [ ] Invalid signatures rejected with 401
- [ ] Timestamp validation works
- [ ] Replay attacks prevented (same signature + timestamp rejected)
- [ ] Duplicate payments not processed
- [ ] All 3 payment webhooks have verification
- [ ] Audit log shows verified webhooks

---

## Security Issue 2.2: Resource Ownership Checks (3 hours)

### Vulnerability
Users can view data they don't own (payments, shipments, ratings).

**Attack Scenario:**
```
1. User A is logged in, has JWT token
2. Guesses User B's shipment ID
3. Calls GET /api/shipments/SHIP-002 (not User A's shipment)
4. Server returns User B's full shipment details
5. User A sees User B's phone, pricing, payment info
```

**Business Impact:** Data breach, privacy violation, regulatory (GDPR) fine.

### Current Code Problem
```typescript
// app/api/shipments/[id]/route.ts (INSECURE)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const shipment = await db.shipment.findUnique({
    where: { id: params.id }
  });
  
  // ❌ No check if user owns this shipment
  return Response.json(shipment);
}
```

### Fix Required

**Step 2.2a: Add Ownership Check Middleware**

Create: `/lib/api/middleware/ownership.ts`

```typescript
import { getAuthenticatedUser } from '@/lib/auth/middleware';
import { db } from '@/lib/api/services/db';

export async function requireOwnership(
  req: Request,
  resourceType: 'shipment' | 'payment' | 'rating',
  resourceId: string
) {
  const user = await getAuthenticatedUser(req);
  
  let owner: string | null = null;
  
  if (resourceType === 'shipment') {
    const shipment = await db.shipment.findUnique({
      where: { id: resourceId }
    });
    
    if (!shipment) {
      throw new NotFoundError('Shipment not found');
    }
    
    // User is owner if shipper or assigned transporter
    owner = user.id === shipment.shipper_id || 
            user.id === shipment.transporter_id ? user.id : null;
  } 
  else if (resourceType === 'payment') {
    const payment = await db.payment.findUnique({
      where: { id: resourceId },
      include: { shipment: true }
    });
    
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }
    
    owner = user.id === payment.shipment.shipper_id ||
            user.id === payment.shipment.transporter_id ? user.id : null;
  }
  else if (resourceType === 'rating') {
    const rating = await db.rating.findUnique({
      where: { id: resourceId }
    });
    
    if (!rating) {
      throw new NotFoundError('Rating not found');
    }
    
    // User is owner if they gave or received the rating
    owner = user.id === rating.rater_id ||
            user.id === rating.rated_user_id ? user.id : null;
  }
  
  if (!owner) {
    logger.warn('Unauthorized access attempt', {
      userId: user.id,
      resourceType,
      resourceId
    });
    throw new UnauthorizedError('Access denied');
  }
}
```

**Step 2.2b: Update Shipment Endpoint**

Edit: `/app/api/shipments/[id]/route.ts`

```typescript
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // ✅ Check ownership before returning
    await requireOwnership(req, 'shipment', params.id);
    
    const shipment = await db.shipment.findUnique({
      where: { id: params.id }
    });
    
    return Response.json(shipment);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }
    throw error;
  }
}
```

**Step 2.2c: Update Payment Endpoint**

Edit: `/app/api/payments/[id]/status/route.ts`

```typescript
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireOwnership(req, 'payment', params.id);
    
    const payment = await db.payment.findUnique({
      where: { id: params.id }
    });
    
    return Response.json(payment);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }
    throw error;
  }
}
```

**Step 2.2d: Update GET /api/shipments (List Endpoint)**

Edit: `/app/api/shipments/route.ts`

```typescript
export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  
  // ✅ Filter to only user's shipments
  const shipments = await db.shipment.findMany({
    where: {
      OR: [
        { shipper_id: user.id },
        { transporter_id: user.id }
      ]
    }
  });
  
  return Response.json(shipments);
}
```

### Affected Endpoints to Fix

| Endpoint | Resource | Who Can Access |
|---|---|---|
| `GET /api/shipments/:id` | Individual shipment | Shipper + Transporter only |
| `GET /api/shipments` | All shipments | Only user's shipments |
| `GET /api/payments/:id/status` | Individual payment | Involved parties only |
| `GET /api/ratings/:id` | Individual rating | Rater + Rated user only |
| `GET /api/matches/:id` | Individual match | Involved parties only |
| `DELETE /api/disputes/:id` | Dispute | Creator + Admin only |

### Verification

**Manual Test:**
```bash
# 1. Login as User A (shipper)
TOKEN_A=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+265999999001","password":"..."}' \
  | jq -r '.token')

# 2. Get User A's shipment (should work)
curl -s http://localhost:3000/api/shipments/SHIP-001 \
  -H "Authorization: Bearer $TOKEN_A" | jq

# Expected: Returns shipment data

# 3. Try to get User B's shipment (should fail)
TOKEN_B=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+265999999002","password":"..."}' \
  | jq -r '.token')

curl -s http://localhost:3000/api/shipments/SHIP-SOMEONE-ELSE \
  -H "Authorization: Bearer $TOKEN_B" | jq

# Expected response: { "error": "Access denied" }, status 403
```

### Files to Update
- [ ] `/lib/api/middleware/ownership.ts` - New ownership check utility
- [ ] `/app/api/shipments/route.ts` - List filter
- [ ] `/app/api/shipments/[id]/route.ts` - Get filter
- [ ] `/app/api/payments/route.ts` - List filter
- [ ] `/app/api/payments/[id]/status/route.ts` - Get filter
- [ ] `/app/api/ratings/route.ts` - List filter
- [ ] `/app/api/matches/route.ts` - List filter
- [ ] `tests/api/authorization.test.ts` - Add authorization tests

### Verification Checklist
- [ ] User A cannot see User B's shipments
- [ ] User A cannot see User B's payments
- [ ] User A cannot see User B's ratings
- [ ] GET /api/shipments only returns user's own
- [ ] 403 Forbidden returned for unauthorized access
- [ ] All endpoints have ownership check
- [ ] Audit log shows access attempts

---

## Security Issue 2.3: Payment Idempotency Keys (2 hours)

### Vulnerability
Network timeouts cause duplicate payments.

**Attack Scenario:**
```
1. User submits payment: POST /api/payments/initiate
2. Network times out (actually succeeded on backend)
3. User retries (no idempotency key support)
4. Payment processed TWICE
5. User charged 2x, money lost
```

**Business Impact:** Lost revenue, customer disputes, chargebacks.

### Current Code Problem
```typescript
// app/api/payments/initiate/route.ts (INSECURE)
export async function POST(req: Request) {
  const { amount, shipmentId } = await req.json();
  
  // ❌ No idempotency key check
  // If this request is retried, payment created again
  const payment = await db.payment.create({
    data: { amount, shipmentId, status: 'pending' }
  });
  
  return Response.json(payment);
}
```

### Fix Required

**Step 2.3a: Add Idempotency Key Support**

Edit: `/app/api/payments/initiate/route.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/api/services/db';

export async function POST(req: Request) {
  const { amount, shipmentId, idempotencyKey } = await req.json();
  
  // 1. Validate inputs
  if (!amount || !shipmentId) {
    return Response.json({ error: 'Missing fields' }, { status: 400 });
  }
  
  // 2. Use provided idempotencyKey or generate one
  const key = idempotencyKey || uuidv4();
  
  // 3. Check if this idempotency key was already processed
  const existing = await db.payment.findFirst({
    where: { idempotency_key: key }
  });
  
  if (existing) {
    // ✅ Return cached result (prevents duplicate)
    logger.info('Idempotent payment request', { key });
    return Response.json(existing);
  }
  
  // 4. Create new payment with idempotency key
  const payment = await db.payment.create({
    data: {
      amount,
      shipment_id: shipmentId,
      status: 'pending',
      idempotency_key: key  // ✅ Store key for future requests
    }
  });
  
  // 5. Include key in response so client can retry safely
  return Response.json({
    ...payment,
    idempotency_key: key
  });
}
```

**Step 2.3b: Update Prisma Schema**

Edit: `/prisma/schema.prisma`

```prisma
model Payment {
  // ... existing fields ...
  
  // Add idempotency key field
  idempotency_key String @unique  // ✅ Unique ensures no duplicates
  
  // Add index for faster lookups
  @@index([idempotency_key])
}
```

**Step 2.3c: Apply Migration**

```bash
# Generate migration
npx prisma migrate dev --name add_idempotency_key

# Apply to database
npx prisma migrate deploy
```

**Step 2.3d: Update Client Library**

Create: `/lib/api/idempotent-request.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';

/**
 * Makes an idempotent HTTP request.
 * Automatically retries on failure with same idempotency key.
 */
export async function idempotentFetch(
  url: string,
  options: RequestInit = {}
) {
  const idempotencyKey = options.headers?.['Idempotency-Key'] || uuidv4();
  
  let lastError;
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Idempotency-Key': idempotencyKey
        }
      });
      
      if (response.ok || response.status >= 400) {
        return response;  // Success or client error (don't retry)
      }
      
      // Server error (5xx), retry
      lastError = new Error(`HTTP ${response.status}`);
      retries++;
      
      // Exponential backoff
      const delay = Math.pow(2, retries) * 100;
      await new Promise(r => setTimeout(r, delay));
      
    } catch (error) {
      // Network error, retry
      lastError = error;
      retries++;
      
      const delay = Math.pow(2, retries) * 100;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw lastError;
}
```

### Verification

**Automated Test:**
```typescript
// tests/api/idempotency.test.ts
describe('Payment Idempotency', () => {
  it('should return same payment on duplicate request', async () => {
    const key = 'test-key-123';
    
    // First request
    const res1 = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Idempotency-Key': key },
      body: JSON.stringify({ amount: 5000, shipmentId: 'SHIP-1' })
    });
    const payment1 = await res1.json();
    
    // Second request (identical)
    const res2 = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Idempotency-Key': key },
      body: JSON.stringify({ amount: 5000, shipmentId: 'SHIP-1' })
    });
    const payment2 = await res2.json();
    
    // Should be identical
    expect(payment1.id).toBe(payment2.id);
    expect(payment1.idempotency_key).toBe(payment2.idempotency_key);
  });
  
  it('should create different payment with different key', async () => {
    const res1 = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'key-1' },
      body: JSON.stringify({ amount: 5000, shipmentId: 'SHIP-1' })
    });
    const payment1 = await res1.json();
    
    const res2 = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'key-2' },  // Different key
      body: JSON.stringify({ amount: 5000, shipmentId: 'SHIP-1' })
    });
    const payment2 = await res2.json();
    
    // Should be different payments
    expect(payment1.id).not.toBe(payment2.id);
  });
});
```

### Files to Update
- [ ] `/app/api/payments/initiate/route.ts` - Add idempotency check
- [ ] `/app/api/payments/cash/confirm/route.ts` - Add idempotency check
- [ ] `/prisma/schema.prisma` - Add `idempotency_key` field
- [ ] `/lib/api/idempotent-request.ts` - New utility
- [ ] `tests/api/idempotency.test.ts` - Add tests

### Verification Checklist
- [ ] Idempotency key stored with every payment
- [ ] Duplicate requests return same payment
- [ ] Different keys create different payments
- [ ] No duplicate charges in database
- [ ] Load test: 100 concurrent identical requests → 1 payment

---

## Security Issue 2.4: Payment Row-Level Locking (1.5 hours)

### Vulnerability
Race condition: Two concurrent processes release same escrow.

**Attack Scenario:**
```
Process A                          Process B
1. Check: escrow_status = 'held'  1. Check: escrow_status = 'held'
2. Release escrow                 2. Release escrow
3. Update: escrow_status='released'
                                  3. Update: escrow_status='released'

Result: Escrow released TWICE, money doubled
```

**Business Impact:** Financial loss, audit failure.

### Current Code Problem
```typescript
// lib/payments/escrow-state-machine.ts (RACE CONDITION)
export async function releaseEscrow(paymentId: string) {
  // ❌ Not atomic - race condition window exists
  const payment = await db.payment.findUnique({
    where: { id: paymentId }
  });
  
  if (payment.escrow_status !== 'held') {
    throw new Error('Payment not in escrow');
  }
  
  // ❌ Between here, another process could release same payment
  
  await db.payment.update({
    where: { id: paymentId },
    data: { escrow_status: 'released' }
  });
}
```

### Fix Required

**Step 2.4a: Add Row-Level Locking**

Edit: `/lib/payments/escrow-state-machine.ts`

```typescript
import { db } from '@/lib/api/services/db';

export async function releaseEscrow(paymentId: string) {
  return await db.$transaction(async (tx) => {
    // ✅ Use SELECT FOR UPDATE to lock the row
    const payment = await tx.$queryRaw`
      SELECT * FROM payments 
      WHERE id = ${paymentId} 
      FOR UPDATE  -- ✅ Lock this row
    `;
    
    if (!payment || payment.escrow_status !== 'held') {
      throw new Error('Payment not in escrow');
    }
    
    // ✅ Update under lock (no race condition possible)
    const updated = await tx.payment.update({
      where: { id: paymentId },
      data: {
        escrow_status: 'released',
        released_at: new Date(),
        released_by_user_id: getCurrentUser().id
      }
    });
    
    // Log for audit trail
    await tx.auditLog.create({
      data: {
        action: 'ESCROW_RELEASED',
        resource_type: 'payment',
        resource_id: paymentId,
        user_id: getCurrentUser().id,
        details: { amount: payment.amount_mwk }
      }
    });
    
    return updated;
  }, {
    timeout: 5000  // Max 5 seconds in transaction
  });
}
```

**Step 2.4b: Add Lock to Match Acceptance**

Edit: `/app/api/matching/[matchId]/accept/route.ts`

```typescript
export async function POST(req: Request, { params }: { params: { matchId: string } }) {
  return await db.$transaction(async (tx) => {
    // ✅ Lock the match row
    const match = await tx.$queryRaw`
      SELECT * FROM matches 
      WHERE id = ${params.matchId} 
      FOR UPDATE
    `;
    
    if (match.status !== 'pending') {
      throw new Error('Match already accepted/rejected');
    }
    
    // ✅ Lock the shipment row
    const shipment = await tx.$queryRaw`
      SELECT * FROM shipments 
      WHERE id = ${match.shipment_id} 
      FOR UPDATE
    `;
    
    if (shipment.status !== 'pending') {
      throw new Error('Shipment already matched');
    }
    
    // ✅ Now safe to update both atomically
    await tx.match.update({
      where: { id: params.matchId },
      data: { status: 'accepted', accepted_at: new Date() }
    });
    
    await tx.shipment.update({
      where: { id: match.shipment_id },
      data: {
        status: 'assigned',
        transporter_id: match.transporter_id
      }
    });
    
    return { ok: true };
  });
}
```

### Files to Update
- [ ] `/lib/payments/escrow-state-machine.ts` - Add row-level locking
- [ ] `/app/api/matching/[matchId]/accept/route.ts` - Add locking
- [ ] `/app/api/payments/cash/confirm/route.ts` - Add locking
- [ ] `tests/concurrency/payment-locking.test.ts` - Add stress tests

### Verification Checklist
- [ ] Concurrent release attempts handled correctly
- [ ] Only one process can release escrow
- [ ] Load test: 100 concurrent accept requests → only 1 succeeds
- [ ] Transaction timeout prevents deadlocks

---

## End of Phase 2 Verification

```bash
# Test all security fixes
npm test -- --testPathPattern="security|authorization|idempotency|webhook"

# Manual security audit
npm run audit:security

# Check all webhooks have verification
grep -r "X-Webhook-Signature" app/api/payments/webhook/

# Verify ownership checks
grep -r "requireOwnership" app/api/

# Check idempotency keys in database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM payments WHERE idempotency_key IS NOT NULL;"

# Load test (simulate 100 concurrent users)
npm run test:load
```

**If all pass:** ✅ **Phase 2 Complete** → Proceed to Phase 3

---

## Phase 2 Timeline

| Task | Time |
|---|---|
| 2.1 Webhook verification | 2h |
| 2.2 Ownership checks | 3h |
| 2.3 Idempotency keys | 2h |
| 2.4 Row-level locking | 1.5h |
| Testing & verification | 3-4h |
| **PHASE 2 TOTAL** | **~12-15h** |

**After Phase 2:** App is fraud-proof and secure enough for beta testing with real users.

Do NOT deploy to production without Phase 2 complete.
