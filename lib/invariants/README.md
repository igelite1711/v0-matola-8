# MATOLA SYSTEM INVARIANTS - ENFORCEMENT GUIDE

This directory contains comprehensive enforcement utilities for all MATOLA system invariants as defined in `MATOLA_SYSTEM_INVARIANTS.md`.

## Overview

Invariants are hard constraints that must **always hold true** in the system. They are enforced at multiple layers:

1. **Database Layer** - CHECK constraints, UNIQUE indexes, FOREIGN KEYs (PostgreSQL)
2. **Application Layer** - TypeScript validators and business logic (this directory)
3. **API Layer** - Request/response validation middleware
4. **Testing Layer** - Comprehensive test suites

## Directory Structure

```
lib/invariants/
├── data-integrity.ts      # User, Shipment, Match, Payment, Rating invariants
├── financial.ts           # Money accounting, Escrow, Transaction processing
├── session.ts             # USSD sessions, JWT tokens, State machines
├── security.ts            # Auth, Authorization, Data privacy, Input validation
└── README.md              # This file
```

## Module Reference

### 1. Data Integrity Invariants (`data-integrity.ts`)

**User Invariants:**
- Phone number uniqueness and E.164 format validation
- Single role enforcement (no multiple roles)
- Verification level progression (unidirectional increase)
- Soft-delete enforcement (users never permanently removed)

**Shipment Invariants:**
- Unique reference generation and validation
- Positive weight and price validation
- Pickup date cannot be in past
- Delivery date >= pickup date
- Origin != destination validation
- Status machine enforcement (draft → pending → accepted → in_transit → completed)
- Completed shipments are immutable

**Match Invariants:**
- Score range validation (0-100)
- Price inflation prevention (<= 150% of shipment price)
- No duplicate active matches for same (shipment, transporter) pair
- Status transitions (pending → accepted → completed)
- Schedule conflict prevention

**Payment Invariants:**
- Unique reference generation
- Positive amount validation
- Platform fee validation (<= 10% of amount)
- Net amount calculation validation
- Escrow double-release prevention
- No refund of completed payments
- Idempotency key enforcement

**Rating Invariants:**
- Rating value range (1-5)
- No self-rating
- No duplicate ratings per shipment
- Ratings immutable after submission
- Only rate completed shipments

### 2. Financial Invariants (`financial.ts`)

**Money Accounting:**
- Total money balance validation
- Escrow fund accounting
- Payment reconciliation (discrepancies <= 100 MWK)
- Consistent fee calculation
- Non-negative balance enforcement

**Transaction Processing:**
- Atomic state transitions (status + escrow_status together)
- Concurrent modification prevention (row-level locking)
- Payment retry limits (max 5 with exponential backoff)
- Audit log requirement for all transactions

**Escrow Management:**
- Double-release prevention
- Total released <= total received
- Idempotent release operations

### 3. Session & State Invariants (`session.ts`)

**USSD Sessions:**
- 5-minute inactivity timeout (300 seconds)
- Valid state validation
- JSON context validation
- Response format (CON/END prefix)
- 160 character response limit
- Idempotent request handling
- Error handling with graceful fallbacks

**JWT Tokens:**
- 24-hour expiration enforcement
- Expired token rejection
- Immediate blacklist on logout

**State Machines:**
- Valid state transitions logged
- Transaction state consistency
- Atomic state updates (no partial updates)

### 4. Security Invariants (`security.ts`)

**Authentication & Authorization:**
- Bcrypt password hashing (cost factor >= 10)
- Admin action auditing
- Admin-only endpoint protection

**Data Privacy:**
- Phone number access control (owner/matched parties only)
- Payment visibility (creator/recipient only)
- API key masking in logs/errors

**Input Validation:**
- String sanitization (length, XSS prevention)
- E.164 phone validation
- Amount validation (positive, within limits)
- File upload validation (type, size, name)

**Data Encryption:**
- Sensitive data in cache must be encrypted
- AES-256-GCM encryption utilities

**Webhook Security:**
- HMAC-SHA256 signature verification
- Timing-safe comparison

**Resource Ownership:**
- User can only access own resources
- Shared resource permissions

## Usage Examples

### 1. Data Integrity Validation

```typescript
import * as integrity from "@/lib/invariants/data-integrity"

// Validate shipment creation
const shipmentData = {
  weight: 100,
  quotedPrice: 50000,
  pickupDate: new Date("2025-02-15"),
  deliveryDate: new Date("2025-02-20"),
  pickupLocation: "Lilongwe",
  deliveryLocation: "Blantyre",
}

const result = integrity.validateShipmentCreation(shipmentData)
if (!result.valid) {
  console.error("Validation errors:", result.errors)
}

// Generate unique references
const shipmentRef = integrity.generateShipmentReference()
const paymentRef = integrity.generatePaymentReference()

// Validate status transitions
try {
  integrity.validateShipmentStatusTransitionEnhanced("draft", "pending")
  // Success - transition allowed
} catch (error) {
  console.error("Transition not allowed:", error.message)
}
```

### 2. Financial Transaction Validation

```typescript
import * as financial from "@/lib/invariants/financial"

// Validate complete transaction
const transaction = {
  amount: 50000,
  platformFee: 2500,
  netAmount: 47500,
}

const validation = financial.validateCompleteTransaction(transaction)
if (!validation.valid) {
  console.error("Financial validation failed:", validation.errors)
}

// Calculate fees
const fee = financial.calculatePlatformFee(50000, 0.05) // 2500
const netAmount = financial.calculateNetAmount(50000, 0.05) // 47500

// Validate escrow accounting
financial.validateEscrowAccounting(100000, 100000) // Pass
```

### 3. Session Management

```typescript
import * as session from "@/lib/invariants/session"

// Validate USSD session expiry
const expiryCheck = session.validateUSSDSessionExpiry(
  createdAt,
  lastActivity,
  5 * 60 * 1000, // 5 minutes
)

if (!expiryCheck.valid) {
  console.log("Session expired:", expiryCheck.error)
}

// Validate USSD response
const responseCheck = session.validateUSSDResponseFormat("CON Welcome to MATOLA")
if (!responseCheck.valid) {
  throw new Error(responseCheck.error)
}

// Create state machine for shipment
const shipmentMachine = {
  states: ["draft", "pending", "accepted", "in_transit", "completed"],
  initialState: "draft",
  terminalStates: ["completed"],
  transitions: {
    draft: ["pending"],
    pending: ["accepted"],
    accepted: ["in_transit"],
    in_transit: ["completed"],
    completed: [],
  },
}

const transition = session.executeStateTransition(
  "draft",
  "pending",
  shipmentMachine,
)
```

### 4. Security Validation

```typescript
import * as security from "@/lib/invariants/security"

// Validate password hash
const hashCheck = await security.validatePasswordHash(plaintext, hashedPassword)
if (!hashCheck.valid) {
  throw new Error(hashCheck.error)
}

// Sanitize input
const { sanitized } = security.sanitizeInput(userInput, 1000)

// Validate phone number
const phoneCheck = security.validateE164PhoneNumber("+265991234567")
if (!phoneCheck.valid) {
  throw new Error(phoneCheck.error)
}

// Validate file upload
const fileCheck = security.validateFileUpload({
  size: 5000,
  type: "image/jpeg",
  name: "verification.jpg",
})

// Verify webhook signature
const webhookCheck = security.validateWebhookSignature(
  payload,
  signature,
  webhookSecret,
)

// Check resource ownership
const ownershipCheck = security.validateResourceOwnership(
  resourceOwnerId,
  requestingUserId,
  "shipment",
  shipmentId,
)
```

## Integration Points

### In API Route Handlers

```typescript
// app/api/shipments/route.ts
import * as integrity from "@/lib/invariants/data-integrity"

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate using invariants
  const validation = integrity.validateShipmentCreation({
    weight: body.weight,
    quotedPrice: body.quotedPrice,
    pickupDate: new Date(body.pickupDate),
    deliveryDate: new Date(body.deliveryDate),
    pickupLocation: body.pickupLocation,
    deliveryLocation: body.deliveryLocation,
  })

  if (!validation.valid) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 400 },
    )
  }

  // Process valid shipment
  const shipment = await db.shipment.create({ data: body })
  return NextResponse.json(shipment)
}
```

### In Database Operations

```typescript
// Before updating payment status
import * as financial from "@/lib/invariants/financial"

async function updatePaymentStatus(
  paymentId: string,
  newStatus: string,
  newEscrowStatus: string,
) {
  const payment = await db.walletTransaction.findUnique({
    where: { id: paymentId },
  })

  // Validate transition
  financial.validatePaymentStatusTransition(
    payment.status,
    payment.escrowStatus,
    newStatus,
    newEscrowStatus,
  )

  // Update with guarantee of consistency
  return await db.walletTransaction.update({
    where: { id: paymentId },
    data: {
      status: newStatus,
      escrowStatus: newEscrowStatus,
      updatedAt: new Date(),
    },
  })
}
```

### In Middleware

```typescript
// lib/api/middleware/invariant-enforcement.ts
import { NextRequest, NextResponse } from "next/server"
import * as security from "@/lib/invariants/security"

export async function invariantEnforcementMiddleware(request: NextRequest) {
  // Validate admin-only endpoints
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    const auth = await authenticateRequest(request)

    const adminCheck = security.validateAdminAccess(auth.role)
    if (!adminCheck.valid) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: 403 },
      )
    }
  }

  return NextResponse.next()
}
```

## Testing Invariants

### Unit Tests

```typescript
// lib/__tests__/invariants/data-integrity.test.ts
import * as integrity from "@/lib/invariants/data-integrity"

describe("Data Integrity Invariants", () => {
  describe("Shipment weight validation", () => {
    it("should reject zero weight", () => {
      expect(() => {
        integrity.validateShipmentWeight(0)
      }).toThrow("Weight must be")
    })

    it("should reject negative weight", () => {
      expect(() => {
        integrity.validateShipmentWeight(-10)
      }).toThrow("Weight must be")
    })

    it("should accept positive weight", () => {
      expect(() => {
        integrity.validateShipmentWeight(100)
      }).not.toThrow()
    })
  })
})
```

### Integration Tests

```typescript
// Test complete shipment lifecycle
describe("Shipment Lifecycle Invariants", () => {
  it("should enforce complete shipment immutability", async () => {
    // Create and complete shipment
    const shipment = await createShipment({ status: "draft" })
    await updateShipmentStatus(shipment.id, "completed")

    // Try to modify completed shipment
    expect(() => {
      updateShipmentStatus(shipment.id, "rejected")
    }).toThrow("Cannot modify")
  })
})
```

## Maintenance & Updates

### Adding New Invariants

1. Identify the invariant category (data integrity, financial, session, security)
2. Add validation function to appropriate module
3. Add to this README documentation
4. Add test cases
5. Update database schema constraints if needed

### Monitoring Invariant Violations

Log all invariant violations for investigation:

```typescript
// lib/monitoring/invariant-violations.ts
export async function logInvariantViolation(
  invariantName: string,
  severity: "critical" | "high" | "medium",
  context: Record<string, unknown>,
) {
  console.error(
    `[INVARIANT VIOLATION] ${invariantName}`,
    { severity, context }
  )

  // Send to monitoring service
  await monitoringService.captureException({
    tags: {
      category: "invariant_violation",
      invariant: invariantName,
      severity,
    },
    extra: context,
  })
}
```

## References

- Main invariants document: `MATOLA_SYSTEM_INVARIANTS.md`
- Database schema: `prisma/schema.prisma`
- Error codes: `lib/api/utils/error-handler.ts`
