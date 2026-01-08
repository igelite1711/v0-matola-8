# MATOLA PRD vs IMPLEMENTATION - ALIGNMENT AUDIT REPORT

**Date:** December 8, 2025  
**Status:** ⚠️ CRITICAL MISALIGNMENTS FOUND

---

## EXECUTIVE SUMMARY

Comparing the MATOLA PRD (v2.0 December 2024) against current backend and frontend implementation reveals **CRITICAL GAPS** that will prevent the system from functioning as specified:

### Key Issues:
1. ✅ **Authentication**: PIN-based (4-digit) implemented correctly
2. ❌ **USSD**: Not implemented - PRD specifies this as PRIMARY channel
3. ❌ **WhatsApp Integration**: Not implemented - PRD specifies SECONDARY channel  
4. ✅ **Phone Format**: Malawi format (+265) validation in place
5. ⚠️ **Multi-channel**: Only PWA implemented, USSD/WhatsApp missing

---

## 1. AUTHENTICATION SYSTEM

### ✅ IMPLEMENTED CORRECTLY

**Backend Requirements (PRD):**
- 4-digit PIN for login/registration
- PIN hashing with bcrypt
- JWT tokens with 24h expiry
- Rate limiting on auth endpoints
- Phone verification via OTP (optional)

**Current Implementation:**

| Feature | Status | Notes |
|---------|--------|-------|
| 4-digit PIN | ✅ | `loginSchema` validates `pin: z.string().length(4)` |
| PIN Hashing | ✅ | `lib/auth/password.ts` uses bcrypt with 10 salt rounds |
| JWT 24h | ✅ | `lib/auth/jwt.ts` generates tokens with 24h expiry |
| Rate Limiting | ✅ | Rate limiter on `/api/auth/login` and `/api/auth/register` |
| Malawi Phone Format | ✅ | Regex validates `\+?265\d{9}$` |

**Frontend Requirements (PRD):**
- Simple phone + PIN input
- 4-digit PIN input fields
- Bilingual (English/Chichewa)
- Works on slow networks

**Current Implementation:**

| Feature | Status | Notes |
|---------|--------|-------|
| Phone Input | ✅ | Accepts 10-digit format, converts to +265 format |
| PIN Input | ✅ | 4 separate digit inputs with auto-focus |
| Bilingual | ✅ | English/Chichewa translations present |
| Offline Support | ⚠️ | PWA supports some offline features |

**Issues Found:**
- No OTP verification step mentioned in PRD for registration
- Backend login endpoint expects `pin` not `otp` ✅ (CORRECT)

**API Schema Issue:**
File: `lib/api/schemas/auth.ts` (OUTDATED)
```typescript
// WRONG - expects OTP
export const loginSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6), // ❌ WRONG - should be PIN
})
```

File: `lib/validators/api-schemas.ts` (CORRECT)
```typescript
// CORRECT - expects PIN
export const loginSchema = z.object({
  phone: z.string().regex(/^\+?265\d{9}$/),
  pin: z.string().length(4), // ✅ CORRECT
  role: z.enum(["shipper", "transporter", "broker", "admin"]).optional(),
})
```

**⚠️ ACTION REQUIRED**: Delete/merge `lib/api/schemas/auth.ts` - it's conflicting with `lib/validators/api-schemas.ts`

---

## 2. USSD SYSTEM (PRIMARY CHANNEL)

### ❌ NOT IMPLEMENTED

**PRD Requirement:**
```
"Why USSD is King in Africa:
- No data bundle required
- Works on 100% of mobile phones
- Familiar to users
- Session-based (server holds state)
- Secure (session encrypted by carrier)"

Target: 60% of user base
Short Code: *384*628652#
```

**Current Implementation:**
- No USSD routes found
- No USSD session management
- No Africa's Talking integration
- No USSD state machine

**What's Missing:**

1. **USSD API Endpoints:**
```bash
POST /api/ussd/session
POST /api/ussd/callback
```

2. **USSD State Machine (Redis):**
```typescript
// Should store session state:
{
  phone: "+265991234567",
  state: "POST_SHIPMENT_DESTINATION",
  language: "ny",
  context: { origin: "Lilongwe", cargo_type: "maize" },
  step_count: 5,
  created_at: "2024-12-06T10:30:00Z"
}
```

3. **USSD Menu Flows:**
The PRD specifies complete menu flows:

```
Main Menu:
  1. Post a load
  2. Find transport
  3. My shipments
  4. Account
  5. Help
  0. Exit

Post Shipment Flow:
  Origin → Destination → Cargo Type → Weight → Price → Confirm
```

4. **Africa's Talking Integration:**
```typescript
// Expected in service layer
class USSDService {
  async handleUSSDCallback(phone, input, sessionId) {
    // Validate session in Redis
    // Process state transition
    // Generate response
    // Store new state
    // Return CON/END response
  }
}
```

**Estimated Implementation Effort:** 40-60 hours

---

## 3. WHATSAPP BUSINESS INTEGRATION (SECONDARY CHANNEL)

### ❌ NOT IMPLEMENTED

**PRD Requirement:**
```
"Why WhatsApp Works in Africa:
- 95% smartphone users have WhatsApp
- Familiar interface
- Rich media support
- End-to-end encryption"

Target: 25% of user base
Provider: Twilio WhatsApp Business API
Flows: Registration, Post Shipment, Match Notification, Support
```

**Current Implementation:**
- No WhatsApp routes
- No Twilio integration
- No message templates
- No webhook handlers

**What's Missing:**

1. **WhatsApp API Endpoints:**
```bash
POST /api/whatsapp/webhook
POST /api/whatsapp/send-message
GET /api/whatsapp/status
```

2. **Message Flows (from PRD):**

| Flow | Status | Implements |
|------|--------|------------|
| User Registration | ❌ | Bot collects name → role selection |
| Post Shipment | ❌ | POST command parsing, cargo details collection |
| Match Notification | ❌ | Template message with driver details |
| Delivery Confirmation | ❌ | Rating collection and payment release |
| Find Load | ❌ | List available shipments with details |
| Customer Support | ❌ | Hand-off to support team |

3. **Twilio Integration Expected:**
```typescript
class WhatsAppService {
  async handleIncomingMessage(phone, message, context) {
    // Parse message
    // Get conversation context
    // Process based on current state
    // Generate response
    // Store new context
    // Send message
  }
}
```

4. **Message Templates (from PRD):**
- Welcome message
- Shipment confirmation
- Match notification
- Delivery confirmation
- Support hand-off

**Estimated Implementation Effort:** 50-70 hours

---

## 4. PWA/DASHBOARD (IMPLEMENTED)

### ✅ BASIC STRUCTURE EXISTS

**What's Implemented:**
- Login/Register pages
- Dashboard shells
- Transporter dashboard
- Shipper dashboard
- Admin dashboard

**What's Missing:**
- Full cargo matching algorithm
- Real shipment tracking
- Payment integration
- Rating system (partially done)
- Verification system (partially done)

---

## 5. SMS CHANNEL (MENTIONED IN PRD)

### ⚠️ PARTIAL IMPLEMENTATION

**PRD Usage:**
```
Channel Feature Matrix shows SMS for:
- User Registration (partial)
- Track Shipment
```

**Current Implementation:**
- OTP sending exists (`app/api/auth/send-otp/route.ts`)
- No SMS tracking notifications
- No SMS-based support

---

## 6. CRITICAL CONFIGURATION ISSUES

### Issue #1: Duplicate Auth Schemas
**Files:**
- `lib/api/schemas/auth.ts` (LEGACY - expects OTP)
- `lib/validators/api-schemas.ts` (CURRENT - expects PIN)

**Status:** ❌ MUST RESOLVE

The old schema file expects:
```typescript
otp: z.string().length(6) // Wrong!
```

But the actual login endpoint uses:
```typescript
pin: z.string().length(4) // Correct!
```

**Fix:** Delete `lib/api/schemas/auth.ts` or update it to use PIN

### Issue #2: API Client Mismatch
**File:** `lib/api/client.ts`

Current structure:
```typescript
class APIClient {
  auth = {
    login: async (data: { phone, pin }) => { ... }
    register: async (data: { name, phone, pin, role }) => { ... }
  }
}
```

This requires calling `api.auth.login()` but the context calls `api.login()`.

**Status:** ✅ FIXED (convenience methods added)

### Issue #3: Registration Flow Missing OTP Verification

**PRD Requirement:** (needs clarification)
The PRD discusses OTP for phone verification in Section 6.2 (Trust & Verification Systems)

**Current Implementation:**
Registration skips OTP verification - goes straight to PIN creation

**Status:** ⚠️ NEEDS CLARIFICATION

---

## 7. FEATURE COMPLETENESS MATRIX

| Feature | PRD | Status | Notes |
|---------|-----|--------|-------|
| **Authentication** | | | |
| PIN-based login | ✓ | ✅ | 4-digit PIN |
| Phone verification | ✓ | ⚠️ | Optional in current impl |
| JWT tokens | ✓ | ✅ | 24h expiry |
| Rate limiting | ✓ | ✅ | Implemented |
| | | | |
| **USSD** | ✓ | ❌ | PRIMARY CHANNEL MISSING |
| Session state | ✓ | ❌ | |
| Menu flows | ✓ | ❌ | |
| Africa's Talking | ✓ | ❌ | |
| | | | |
| **WhatsApp** | ✓ | ❌ | SECONDARY CHANNEL MISSING |
| Message flows | ✓ | ❌ | |
| Twilio integration | ✓ | ❌ | |
| Bot logic | ✓ | ❌ | |
| | | | |
| **PWA/Dashboard** | ✓ | ⚠️ | Partial |
| Login/Register | ✓ | ✅ | |
| Post shipment | ✓ | ⚠️ | UI exists, backend incomplete |
| Find transport | ✓ | ⚠️ | UI exists, matching incomplete |
| Tracking | ✓ | ⚠️ | Basic structure |
| Payments | ✓ | ❌ | Not implemented |
| Ratings | ✓ | ⚠️ | Partial |
| Verification | ✓ | ⚠️ | Partial |
| | | | |
| **Backend Services** | | | |
| User management | ✓ | ✅ | |
| Shipment CRUD | ✓ | ✅ | |
| Matching engine | ✓ | ⚠️ | Exists but incomplete |
| Payment service | ✓ | ❌ | |
| Notification service | ✓ | ⚠️ | SMS only |
| Rate limiting | ✓ | ✅ | |
| Logging | ✓ | ✅ | |
| Audit trails | ✓ | ✅ | |

---

## 8. CRITICAL ALIGNMENT RECOMMENDATIONS

### IMMEDIATE (Week 1):

1. **Fix Duplicate Schema Files**
   - Delete or consolidate `lib/api/schemas/auth.ts`
   - Ensure single source of truth for validation

2. **Clarify Registration Flow**
   - Does registration require OTP verification?
   - Or just PIN creation?
   - Update PRD or implementation accordingly

3. **Test PIN Login Flow**
   - Verify phone format conversion works (0999... → +265...)
   - Test with mock user accounts
   - Ensure error messages are clear

### SHORT TERM (2-4 weeks):

4. **Implement USSD System** (HIGH PRIORITY - PRIMARY CHANNEL)
   - Set up Africa's Talking account
   - Create USSD session management (Redis)
   - Implement state machine
   - Build out all menu flows
   - Test with feature phones

5. **Implement WhatsApp Integration** (MEDIUM PRIORITY - SECONDARY CHANNEL)
   - Set up Twilio WhatsApp Business API
   - Create webhook handlers
   - Implement message parsing and response logic
   - Build out conversation flows
   - Test message templates

### MEDIUM TERM (4-8 weeks):

6. **Complete Payment Integration**
   - Airtel Money API integration
   - Cash payment workflow with photo verification
   - Escrow system

7. **Complete Matching Engine**
   - Improve matching algorithm
   - Add real-time notifications
   - Implement acceptance/rejection logic

8. **Implement Rating & Review System**
   - User rating endpoints
   - Review moderation
   - Rating impact on visibility

---

## 9. DEPLOYMENT CONSIDERATIONS

**Current State:**
- ✅ PWA deployable to Vercel
- ❌ USSD requires Africa's Talking account
- ❌ WhatsApp requires Twilio account
- ⚠️ SMS requires third-party provider

**Blockers for Full PRD Compliance:**
1. USSD not implemented
2. WhatsApp not implemented
3. Payment system not live
4. Matching algorithm incomplete

**MVP Deployment Options:**
- **Option A:** PWA only (25% of target users)
- **Option B:** PWA + SMS (35% of target users)
- **Option C:** PWA + SMS + WhatsApp (60% of target users) - RECOMMENDED
- **Option D:** Full stack with USSD (100% of target users) - 3-4 months away

---

## 10. PRIORITY ALIGNMENT

Based on PRD and user distribution targets:

| Channel | Target % | Status | Priority |
|---------|----------|--------|----------|
| USSD | 60% | ❌ | 🔴 CRITICAL |
| WhatsApp | 25% | ❌ | 🔴 CRITICAL |
| PWA | 15% | ⚠️ | 🟡 HIGH |
| SMS | Minor | ⚠️ | 🟡 MEDIUM |

---

## NEXT STEPS

1. **Review this report** with team
2. **Prioritize implementation order**
3. **Assign USSD development** (40-60 hours)
4. **Assign WhatsApp development** (50-70 hours)
5. **Create detailed specs** for each missing feature
6. **Update timelines** based on resource allocation

---

## DOCUMENTS COMPARED

- ✅ MATOLA PRD.md (v2.0 - December 2024)
- ✅ All backend route files in `/app/api/`
- ✅ All frontend components in `/components/`
- ✅ All auth files in `/lib/auth/`
- ✅ All validation schemas
- ✅ API client (`lib/api/client.ts`)
- ✅ Context provider (`contexts/app-context.tsx`)

---

**Report Generated:** December 8, 2025  
**Prepared by:** Code Analysis System  
**Status:** ⚠️ CRITICAL GAPS IDENTIFIED
