# MATOLA LOGISTICS PLATFORM
## Production Requirements Document - African Reality Edition

**Version:** 2.0  
**Date:** December 2024  
**Project:** Matola - Pan-African Logistics Platform (Malawi Pilot)  
**Status:** Production Implementation  
**Target Markets:** Malawi (Phase 1), Zambia, Tanzania, Mozambique (Phase 2-3)

---

## DOCUMENT PHILOSOPHY

**"Build for Africa, not for Silicon Valley"**

This PRD is grounded in African realities:
- Power outages are the norm, not the exception
- 2G/3G networks dominate; 4G is luxury
- Feature phones outnumber smartphones 10:1
- Cash is king; digital payments are emerging
- Trust is earned through personal relationships, not apps
- Infrastructure is unreliable; systems must be resilient
- Data costs matter; every MB counts
- Literacy varies; interfaces must be intuitive
- Languages matter; English is often second or third

---

## 1. EXECUTIVE SUMMARY

### 1.1 Problem Statement

**African Transport Reality:**
- 60-80% of trucks return empty after deliveries (vs. 25-30% in developed markets)
- Small-scale farmers and traders lack access to affordable transport
- Informal transport networks operate on trust and WhatsApp groups
- No centralized platform connects cargo owners with transporters
- Information asymmetry leads to price exploitation
- Vehicle owners lose 40-50% potential revenue due to empty returns

**Matola's Solution:**
A multi-channel logistics matching platform that works within Africa's constraints:
- **USSD-first** (not mobile-first) for universal access
- **Offline-capable** for intermittent connectivity
- **Cash-integrated** with mobile money as optional
- **Trust-building** through verification and community reputation
- **Language-flexible** supporting local languages
- **Low-bandwidth** optimized for 2G networks

### 1.2 Success Metrics (6-Month Targets)

**Economic Impact:**
- Reduce empty truck returns from 70% to 45%
- Increase transporter monthly earnings by 35% (from MWK 150,000 to MWK 200,000)
- Reduce shipper transport costs by 25%
- Generate MWK 50 million in gross transaction value

**Adoption Metrics:**
- 2,000 registered transporters (trucks, pickups, motorcycles)
- 5,000 active shippers (farmers, traders, SMEs)
- 500 daily shipment postings
- 60% match success rate
- 40% month-over-month user retention

**Operational Excellence:**
- 99.5% USSD uptime (critical for accessibility)
- <2s average response time on 2G networks
- <5 minutes to post shipment via any channel
- <24 hours issue resolution time
- 4.0/5.0 user satisfaction rating

### 1.3 Core Design Principles

1. **Resilience Over Performance** - System must work during power cuts, network failures, and infrastructure challenges
2. **Inclusion Over Innovation** - Serve feature phone users before smartphone users
3. **Simplicity Over Features** - Do five things perfectly rather than fifty things poorly
4. **Trust Over Technology** - Build human relationships alongside digital tools
5. **Cash Over Digital** - Support traditional payment methods first
6. **Local Over Global** - Adapt to each country's unique context

---

## 2. AFRICAN INFRASTRUCTURE REALITIES

### 2.1 Power Supply Constraints

**Malawi Power Context:**
- ESCOM (national utility): 6-12 hour daily blackouts common
- Urban areas: 4-8 hours outages
- Rural areas: 12-20 hours outages or no grid connection
- Voltage fluctuations damage electronics
- Diesel generators expensive (MWK 5,000/hour for 10kVA)

**System Requirements:**

```yaml
Server Infrastructure:
  Primary Power: Grid electricity with UPS
  Backup Power: 
    - Solar panels (5kW array) + battery bank (20kWh)
    - Diesel generator (15kVA) for extended outages
    - Runtime target: 72 hours without grid
  
  Power Management:
    - Auto-shutdown non-critical services during low battery
    - Priority services: USSD, SMS, database
    - Graceful degradation protocol
    - Alert admins at 30% battery

Office/Field Operations:
  Equipment:
    - Laptops with 8+ hour battery life
    - Power banks (20,000mAh) × 10
    - Solar chargers (foldable, 28W) × 5
    - Car charging adapters
    - LED lighting (solar-powered)
  
  Work Protocols:
    - Daily power schedule awareness
    - Critical work during grid hours (6am-10am)
    - Offline-capable tools for all tasks
    - Battery conservation mode on all devices
```

### 2.2 Network Connectivity Reality

**Malawi Mobile Network Landscape:**
- **Airtel Malawi:** 45% market share, best 3G coverage in cities
- **TNM:** 35% market share, strong in rural areas
- **Access Communications:** 20%, limited coverage

**Network Characteristics:**
```yaml
Coverage by Region:
  Lilongwe (Capital):
    - 4G LTE: 60% coverage (5-15 Mbps typical)
    - 3G: 95% coverage (0.5-2 Mbps typical)
    - 2G: 99% coverage (10-50 kbps)
    - Dead zones: Markets, residential areas
  
  Blantyre (Commercial Hub):
    - 4G: 50% coverage
    - 3G: 90% coverage
    - 2G: 99% coverage
  
  Mzuzu (Northern Region):
    - 4G: 20% coverage
    - 3G: 70% coverage
    - 2G: 95% coverage
  
  Rural Areas:
    - 4G: <5% coverage
    - 3G: 30% coverage
    - 2G: 60% coverage
    - No coverage: 40%

Connectivity Challenges:
  - Network congestion: 5pm-10pm (commute + evening usage)
  - Tower power issues: Frequent outages during load shedding
  - Cross-network handoffs: Calls drop, data sessions reset
  - Rain attenuation: Heavy rains degrade signal
  - Load balancing: Towers near markets overloaded on market days

Data Costs (Prepaid):
  Airtel:
    - 1GB: MWK 3,000 (~$2.80)
    - 100MB: MWK 500 (~$0.47)
    - Daily 50MB: MWK 200 (~$0.19)
  
  TNM:
    - 1GB: MWK 2,500 (~$2.30)
    - 100MB: MWK 450 (~$0.42)
    - Daily 30MB: MWK 150 (~$0.14)
  
  Context: Daily minimum wage ~MWK 2,500
  Impact: Users extremely data-conscious
```

**System Design for African Networks:**

```yaml
Application Architecture:
  Bandwidth Budget (per user session):
    - USSD: 0KB (carrier-provided channel)
    - SMS: 0KB (carrier SMS channel)
    - WhatsApp: <50KB per conversation
    - PWA initial load: <200KB (gzipped)
    - PWA subsequent loads: <20KB (cached)
    - API responses: <5KB average
  
  Network Resilience:
    - Request timeout: 30s (vs. 5s in developed markets)
    - Retry attempts: 5 (with exponential backoff)
    - Connection pooling: Long-lived connections
    - HTTP/2 multiplexing: Reduce round-trips
    - Compression: Brotli/Gzip on all responses
    - Caching: Aggressive client-side caching
  
  Offline Capability:
    - Service Worker: Cache app shell (lasts 30 days)
    - IndexedDB: Store last 7 days of user data
    - Background Sync: Queue actions when offline
    - Sync priority: Payments > Shipments > Messages
    - Conflict resolution: Last-write-wins with timestamp

CDN Strategy:
  Primary: AWS CloudFront
  Edge Locations:
    - South Africa (Cape Town): 180-250ms to Malawi
    - Kenya (Nairobi): 300-400ms to Malawi
    - Egypt (Cairo): 350-450ms to Malawi
  
  Caching Rules:
    - Static assets: 365 days
    - API responses: 5 minutes (stale-while-revalidate)
    - USSD menus: 24 hours
    - User profiles: 1 hour
```

### 2.3 Device & Technology Penetration

**Malawi Mobile Device Landscape (2024):**

```yaml
Device Distribution:
  Feature Phones: 68%
    - Nokia: 35% (105, 106, 110 popular)
    - Itel: 20% (budget models)
    - Tecno: 13%
    - Other brands: 32%
  
  Smartphones: 32%
    - Android (2-4GB RAM): 25%
    - Android (<2GB RAM): 5%
    - iOS: <2%
  
  Average Device Age: 4.5 years
  Screen Sizes: 1.8"-6.5"
  
Smartphone Breakdown:
  Low-end (<$50): 60%
    - Tecno, Itel, Infinix brands
    - 1-2GB RAM, 8-16GB storage
    - Android 9-11 (Go edition common)
    - Poor battery life (1-2 days)
  
  Mid-range ($50-$150): 35%
    - Samsung A-series, Oppo, Xiaomi
    - 2-4GB RAM, 32-64GB storage
    - Android 11-13
    - Better battery (2-3 days)
  
  High-end (>$150): 5%
    - Samsung S-series, iPhone
    - Used in NGOs, government, business

Internet Usage Patterns:
  Primary Access Method:
    - Mobile data: 85%
    - WiFi (home): 5%
    - WiFi (work/public): 10%
  
  Usage Time:
    - Morning (6-9am): 15% (buying data bundles)
    - Midday (12-2pm): 20% (lunch break)
    - Evening (5-10pm): 55% (peak usage)
    - Night (10pm-6am): 10%
  
  App Usage (by frequency):
    1. WhatsApp: 95% daily usage
    2. Facebook: 70%
    3. USSD (banking, airtime): 80%
    4. Mobile money apps: 40%
    5. Other apps: <20%
```

**System Compatibility Requirements:**

```yaml
Feature Phone Support:
  Primary Channel: USSD (*384*628652#)
  Requirements:
    - Java ME/BREW not required
    - No app installation needed
    - Works on all carriers
    - No data bundle required
    - Session-based interaction
  
  Secondary Channel: SMS
  Use Cases:
    - Notifications (shipment matched)
    - OTP delivery
    - Payment confirmations
    - Emergency alerts
  
Smartphone Support:
  Progressive Web App (PWA):
    - Install size: <500KB
    - Works on Android 5.0+ (2014)
    - Degrades gracefully on older browsers
    - No Google Play submission needed
    - Updates automatically
  
  Browser Support:
    - Chrome 49+: Full support
    - UC Browser: Full support (popular in Africa)
    - Opera Mini: Basic support (extreme compression)
    - Firefox: Full support
    - Safari (iOS): Full support
  
  Minimum Specs:
    - RAM: 1GB (512MB with degraded experience)
    - Storage: 16GB (8GB with SD card)
    - Screen: 320x480px minimum
    - Android: 5.0+ (API level 21)
```

### 2.4 Payment Ecosystem Reality

**Malawi Payment Landscape:**

```yaml
Payment Method Usage:
  Cash: 85% of transactions
    - MWK banknotes: K20, K50, K100, K200, K500, K1000, K2000, K5000
    - Coins: K1, K5, K10, K20, K50 (rarely used)
    - Issues: Counterfeit notes, change shortage
  
  Mobile Money: 35% have accounts, 15% active users
    - Airtel Money: 60% market share
    - TNM Mpamba: 35% market share
    - NBS Bank Mo626: 5%
  
  Bank Accounts: 25% banked population
    - Limited to urban areas
    - High minimum balance (MWK 50,000)
    - Poor branch accessibility
  
  Bank Cards: <10% have debit cards
    - VISA acceptance limited
    - POS terminals scarce
    - Online payments rare

Mobile Money Reality:
  Airtel Money:
    - Activation: Free via USSD (*787#)
    - Agent network: ~15,000 agents nationwide
    - Transaction limits: 
      * Daily: MWK 2,000,000
      * Single: MWK 500,000
    - Fees:
      * Send MWK 1,000: MWK 60 (6%)
      * Send MWK 10,000: MWK 190 (1.9%)
      * Send MWK 100,000: MWK 900 (0.9%)
      * Withdraw: Same as send
      * P2P: Free (Airtel to Airtel)
  
  TNM Mpamba:
    - Activation: Via *444# or agent
    - Agent network: ~10,000 agents
    - Transaction limits:
      * Daily: MWK 1,000,000
      * Single: MWK 300,000
    - Fees: Similar to Airtel
  
  Pain Points:
    - Agent liquidity issues (can't cash out)
    - Network failures = stuck transactions
    - Reversals take 48-72 hours
    - Limited interoperability (Airtel ↔ TNM expensive)
    - Rural agents scarce
    - Trust issues (fraud, scams)

Banking Infrastructure:
  Banks in Malawi: 9 commercial banks
  ATM Network: ~450 ATMs nationwide
  Branch Coverage: Mainly urban centers
  
  Bank Transfer Reality:
    - RTGS: Real-time (but fees MWK 5,000+)
    - MIPS: Batch processing (free, but 24-48h delay)
    - Internet banking: <5% adoption
    - USSD banking: Growing (NBS *326#, Standard *361#)
```

**Matola Payment Strategy:**

```yaml
Phase 1 (Launch): Cash-First with Mobile Money Option
  Cash Handling:
    - In-person payment at pickup/delivery
    - WhatsApp photo verification by support team
    - Daily reconciliation with field agents
    - Receipt generation (SMS + PDF)
    - Dispute resolution process (48h SLA)
  
  Mobile Money (Optional):
    - Airtel Money integration (primary)
    - TNM Mpamba (secondary)
    - Escrow system:
      * Shipper pays → held by Matola
      * Pickup confirmed → released to transporter
      * Dispute → held for 72h review
    
  Implementation:
    payments:
      methods:
        - id: cash
          name: "Cash Payment"
          enabled: true
          verification: manual_photo
          flow: |
            1. Shipper agrees price with transporter
            2. Payment at pickup (or delivery per agreement)
            3. Shipper takes photo of receipt/payment
            4. Uploads via WhatsApp to support
            5. Support verifies and marks paid
            6. Shipment status updates
        
        - id: airtel_money
          name: "Airtel Money"
          enabled: true
          fees: platform_absorbs
          flow: |
            1. System generates payment reference
            2. Shipper dials *787# → Send Money
            3. Enters Matola business number
            4. Enters amount + reference
            5. Confirms with PIN
            6. System receives webhook
            7. Updates payment status
            8. Notifies both parties
        
        - id: mpamba
          name: "TNM Mpamba"
          enabled: false # Phase 2
          flow: similar_to_airtel

Phase 2 (Month 4-6): Enhanced Mobile Money
  - Direct API integration (vs USSD)
  - Automated reconciliation
  - Instant refunds
  - Split payments (advance + balance)
  - Interoperable transfers (Airtel ↔ TNM)

Phase 3 (Month 7-12): Digital Wallet
  - Matola wallet (stored value)
  - Bulk discounts for frequent users
  - Loyalty points/rewards
  - Credit facility (buy now, pay later)
  - Integration with banks
```

### 2.5 Literacy & Language Considerations

**Malawi Literacy Context:**

```yaml
National Statistics:
  Literacy Rate: 62% (age 15+)
    - Male: 69%
    - Female: 55%
    - Urban: 81%
    - Rural: 56%
  
  Functional Literacy: ~45%
    - Can read simple text
    - Struggles with complex forms
    - Limited English proficiency
  
  Digital Literacy: ~30%
    - Comfortable with smartphones
    - Can navigate apps
    - Understands UI conventions

Language Reality:
  Chichewa (National): 57% first language, 90% speak
  English (Official): 10% fluent, 40% conversational
  Other Languages:
    - Chiyao: 10%
    - Chitumbuka: 9%
    - Chilomwe: 3%
    - Others: 21%
  
  Language Preferences:
    - Urban educated: English preferred
    - Urban general: Chichewa preferred
    - Rural: Chichewa or local language only
    - Traders/business: Mix of Chichewa and English

Cultural Communication Norms:
  - Indirectness preferred over confrontation
  - Politeness formulas important ("Please", "Sorry")
  - Respect for authority figures
  - Group consensus valued
  - Oral tradition strong (stories, proverbs)
```

**System Language Strategy:**

```yaml
Multilingual Implementation:
  Launch Languages:
    - English (UK spelling)
    - Chichewa (Chinyanja variant)
  
  Phase 2 Languages:
    - Chitumbuka (Northern region)
    - Chiyao (Southern region)
  
  Language Detection:
    - User selects on first use
    - Stored in profile
    - Can switch anytime via settings
    - USSD: Language selection in main menu
  
  Translation Approach:
    - Professional translators (native speakers)
    - Community review (5 beta testers per language)
    - Cultural adaptation (not literal translation)
    - Audio option for low-literacy users (Phase 2)

UI/UX Considerations:
  Text Simplification:
    - Short sentences (< 10 words)
    - Common vocabulary (avoid jargon)
    - Active voice preferred
    - Clear call-to-action
    - Examples provided
  
  Visual Communication:
    - Icons with text labels (not icons alone)
    - Universal symbols (truck, phone, money)
    - Color coding (green=good, red=warning, blue=info)
    - Images for cargo types
    - Status indicators (dots, checkmarks)
  
  Number Formatting:
    - Currency: "MK 5,000" or "K5,000" (Malawians say "Ka five")
    - Dates: DD/MM/YYYY (not MM/DD)
    - Time: 24-hour (14:00) or 12-hour with AM/PM
    - Phone: +265 99 123 4567 (with country code)
    - Distance: Kilometers (km)
    - Weight: Kilograms (kg) or Tons (t)

USSD Menu Language:
  English:
    "Welcome to Matola
    1. Post a load
    2. Find transport
    3. My shipments
    4. Help
    0. Exit"
  
  Chichewa:
    "Moni ku Matola
    1. Lemba katundu
    2. Peza galimoto
    3. Katundu wanga
    4. Thandizo
    0. Tuluka"

Error Messages (User-Friendly):
  ❌ Technical: "HTTP 500: Internal Server Error"
  ✅ User-Friendly: "Sorry, something went wrong. Please try again." (EN)
                    "Pepani, china chake chalakwika. Yesaninso." (NY)
  
  ❌ Technical: "Invalid phone number format"
  ✅ User-Friendly: "Please enter phone like: 0991234567" (EN)
                    "Lemberani nambala ya foni monga: 0991234567" (NY)
```

---

## 3. CORE SYSTEM ARCHITECTURE

### 3.1 Multi-Channel Access Strategy

**Channel Priority (Matola's Unique Approach):**

```yaml
Channel Hierarchy:
  1. USSD (*384*628652#) - PRIMARY
     Why: Universal access, no data required, works on all phones
     Target Users: 70% of user base
     Use Cases: All core functions (post, find, track, pay)
  
  2. WhatsApp Business - SECONDARY
     Why: Already installed, familiar interface, rich media
     Target Users: 25% of user base
     Use Cases: Detailed communication, photo sharing, support
  
  3. SMS - TERTIARY
     Why: Notifications, OTP, reminders
     Target Users: 100% (notifications only)
     Use Cases: Alerts, confirmations, marketing
  
  4. Progressive Web App - OPTIONAL
     Why: Enhanced experience for smartphone users
     Target Users: 20% of user base
     Use Cases: Dashboard, analytics, detailed tracking

Channel Feature Matrix:
  Function              | USSD | WhatsApp | SMS | PWA |
  ---------------------|------|----------|-----|-----|
  User Registration    |  ✓   |    ✓     |  ✓  |  ✓  |
  Post Shipment        |  ✓   |    ✓     |  ✗  |  ✓  |
  Find Transport       |  ✓   |    ✓     |  ✗  |  ✓  |
  Accept Match         |  ✓   |    ✓     |  ✗  |  ✓  |
  Track Shipment       |  ✓   |    ✓     |  ✓  |  ✓  |
  Make Payment         |  ✓   |    ✗     |  ✗  |  ✓  |
  Customer Support     |  ✗   |    ✓     |  ✗  |  ✓  |
  View History         |  ✓   |    ✗     |  ✗  |  ✓  |
  Analytics            |  ✗   |    ✗     |  ✗  |  ✓  |
```

### 3.2 USSD System Architecture (PRIMARY CHANNEL)

**Why USSD is King in Africa:**
- No data bundle required (carrier-provided service)
- Works on 100% of mobile phones (feature + smart)
- Familiar to users (banks, mobile money use USSD)
- Session-based (server holds state, not client)
- Real-time interaction (unlike SMS)
- Secure (session encrypted by carrier)

**USSD Technical Specifications:**

```yaml
Africa's Talking USSD Integration:
  Short Code: *384*628652#
  Type: Dedicated short code (expensive but professional)
  Cost: ~$500/month for short code + $0.002 per session
  
  Alternative (Budget Option):
    Shared Short Code: *384*68*265# (cheaper)
    Cost: ~$50/month + $0.003 per session
  
  Session Management:
    - Timeout: 300 seconds (5 minutes)
    - Max Steps: 20 screens per session
    - Input Length: 1-160 characters
    - Response Format: "CON [text]" or "END [text]"
    - Character Limit: 160 characters per screen
  
  Response Types:
    CON: Continue session (user enters more input)
    END: End session (final message)
    
  Input Collection:
    - Single digit: Menu selection (1-9, 0)
    - Multiple digits: Phone number, amount
    - Text: Name, location
    - Back: 0 (convention)
    - Main menu: * or 00

USSD State Machine Design:
  State Storage: Redis
  Key Format: ussd:session:{sessionId}
  Value Structure:
    {
      "phone": "+265991234567",
      "state": "POST_SHIPMENT_DESTINATION",
      "language": "ny",
      "context": {
        "origin": "Lilongwe",
        "origin_lat": -13.9626,
        "origin_lng": 33.7741,
        "cargo_type": "maize",
        "weight_kg": 500
      },
      "step_count": 5,
      "created_at": "2024-12-06T10:30:00Z",
      "updated_at": "2024-12-06T10:32:15Z"
    }
  
  TTL: 300 seconds (auto-cleanup)
  
  State Transitions:
    MAIN_MENU → 
      → 1 → POST_SHIPMENT_ORIGIN
      → 2 → FIND_TRANSPORT_ROUTE
      → 3 → MY_SHIPMENTS_LIST
      → 4 → HELP_MENU
    
    POST_SHIPMENT_ORIGIN →
      → [text input] → POST_SHIPMENT_DESTINATION
    
    POST_SHIPMENT_DESTINATION →
      → [text input] → POST_SHIPMENT_CARGO_TYPE
    
    POST_SHIPMENT_CARGO_TYPE →
      → 1 (Food) → POST_SHIPMENT_WEIGHT
      → 2 (Building) → POST_SHIPMENT_WEIGHT
      → 3 (Furniture) → POST_SHIPMENT_WEIGHT
      → 4 (Other) → POST_SHIPMENT_CARGO_CUSTOM
    
    POST_SHIPMENT_WEIGHT →
      → [number] → POST_SHIPMENT_PRICE
    
    POST_SHIPMENT_PRICE →
      → [number] → POST_SHIPMENT_CONFIRM
    
    POST_SHIPMENT_CONFIRM →
      → 1 (Yes) → CREATE_SHIPMENT → END (success)
      → 2 (Edit) → POST_SHIPMENT_EDIT_MENU
      → 0 (Cancel) → MAIN_MENU

Menu Screen Examples:
  
  # Main Menu (English)
  "Welcome to Matola
  1. Post a load
  2. Find transport
  3. My shipments (2 active)
  4. Account
  5. Help
  0. Exit"
  
  # Main Menu (Chichewa)
  "Moni ku Matola
  1. Lemba katundu
  2. Peza galimoto
  3. Katundu wanga (2 yapita)
  4. Akaunti
  5. Thandizo
  0. Tuluka"
  
  # Post Shipment - Origin
  "CON Enter pickup location:
  (e.g. Lilongwe, Area 25)
  0. Back"
  
  # Post Shipment - Cargo Type
  "CON Select cargo type:
  1. Food (maize, rice)
  2. Building materials
  3. Furniture
  4. Livestock
  5. Other
  0. Back"
  
  # Post Shipment - Confirmation
  "CON Confirm shipment:
  From: Lilongwe
  To: Blantyre
  Cargo: 500kg maize
  Price: MK 50,000
  
  1. Confirm & Post
  2. Edit details
  0. Cancel"
  
  # Success Message
  "END Shipment posted!
  Ref: #ML12345
  We'll notify you when a transporter accepts.
  
  Dial *384*628652# to check status."
  
  # Find Transport - Available Loads
  "CON Available loads (Page 1/3):
  
  1. Lilongwe→Blantyre
     300kg maize, MK 35,000
  
  2. Mzuzu→Lilongwe
     1ton fertilizer, MK 80,000
  
  3. More options
  0. Back"
  
  # Shipment Detail
  "CON Load #ML12345
  Route: Lilongwe → Blantyre
  Cargo: 500kg maize
  Price: MK 50,000
  Pickup: Tomorrow, 8am
  Shipper: John (+265991234567)
  
  1. Accept load
  2. Call shipper
  0. Back"
  
  # My Shipments List
  "CON Your shipments:
  
  1. #ML12345 - In transit
     Lilongwe → Blantyre
  
  2. #ML12330 - Completed
     Mzuzu → Lilongwe
  
  3. View more
  0. Main menu"

Performance Optimization:
  
  Response Time Budget:
    - Redis lookup: 10ms
    - Business logic: 50ms
    - Database query: 100ms (if needed)
    - API response: 50ms
    - Total: <500ms (target: 200ms)
  
  Caching Strategy:
    - Menu templates: Cache in Redis (24h TTL)
    - User profile: Cache (1h TTL)
    - Available shipments: Cache (5min TTL)
    - Static data (cargo types, cities): Cache (never expire)
  
  Pagination:
    - Max items per screen: 7 (USSD best practice)
    - Navigation: "3. Next" / "8. Previous"
    - Show "Page X of Y"
  
  Error Handling:
    - Network timeout: Retry 3x, then "Service busy, try later"
    - Invalid input: Show hint, allow 3 attempts max
    - Session expired: "Session expired, dial *384*628652# again"
    - System error: "Sorry, please try again. Ref: ERR_12345"

Localization Best Practices:
  - Keep menu text under 140 chars (leave room for formatting)
  - Use local examples ("Lilongwe" not "London")
  - Price format: "MK 50,000" not "MWK 50,000.00"
  - Phone format: "0991234567" not "+265 99 123 4567"
  - Be culturally sensitive (polite language)
```

**USSD Backend Implementation:**

```javascript
// src/services/ussdService.js

class USSDService {
  constructor() {
    this.redis = new Redis();
    this.sessionTTL = 300; // 5 minutes
  }

  async handleRequest({ sessionId, phone Number, text }) {
    // 1. Get or create session
    let session = await this.getSession(sessionId);
    if (!session) {
      session = await this.createSession(sessionId, phoneNumber);
    }

    // 2. Parse user input
    const userInput = this.parseInput(text);

    // 3. Determine current state
    const currentState = session.state || 'MAIN_MENU';

    // 4. Process state transition
    const result = await this.processState(currentState, userInput, session);

    // 5. Update session
    await this.updateSession(sessionId, result.newState, result.context);

    // 6. Return USSD response
    return result.response;
  }

  parseInput(text) {
    // "1*2*3" → ["1", "2", "3"]
    // Last item is current input
    const inputs = text.split('*');
    return inputs[inputs.length - 1] || '';
  }

  async processState(state, input, session) {
    const { context, language } = session;

    switch (state) {case 'MAIN_MENU':
        return this.handleMainMenu(input, language);

      case 'POST_SHIPMENT_ORIGIN':
        return this.handleOriginInput(input, context, language);

      case 'POST_SHIPMENT_DESTINATION':
        return this.handleDestinationInput(input, context, language);

      case 'POST_SHIPMENT_CARGO_TYPE':
        return this.handleCargoTypeInput(input, context, language);

      case 'POST_SHIPMENT_WEIGHT':
        return this.handleWeightInput(input, context, language);

      case 'POST_SHIPMENT_PRICE':
        return this.handlePriceInput(input, context, language);

      case 'POST_SHIPMENT_CONFIRM':
        return this.handleConfirmation(input, context, language, session.phone);

      case 'FIND_TRANSPORT_ROUTE':
        return this.handleFindTransport(input, session.phone, language);

      case 'MY_SHIPMENTS_LIST':
        return this.handleMyShipments(input, session.phone, language);

      default:
        return this.handleMainMenu('', language);
    }
  }

  handleMainMenu(input, language) {
    const menus = {
      en: `Welcome to Matola
1. Post a load
2. Find transport
3. My shipments
4. Account
5. Help
0. Exit`,
      ny: `Moni ku Matola
1. Lemba katundu
2. Peza galimoto
3. Katundu wanga
4. Akaunti
5. Thandizo
0. Tuluka`
    };

    if (input === '0') {
      return {
        response: `END ${language === 'ny' ? 'Zikomo' : 'Goodbye'}`,
        newState: 'ENDED',
        context: {}
      };
    }

    if (input === '') {
      return {
        response: `CON ${menus[language]}`,
        newState: 'MAIN_MENU',
        context: {}
      };
    }

    const stateMap = {
      '1': { state: 'POST_SHIPMENT_ORIGIN', prompt: language === 'ny' ? 'Lemberani malo otengerera:' : 'Enter pickup location:' },
      '2': { state: 'FIND_TRANSPORT_ROUTE', prompt: null },
      '3': { state: 'MY_SHIPMENTS_LIST', prompt: null },
      '4': { state: 'ACCOUNT_MENU', prompt: null },
      '5': { state: 'HELP_MENU', prompt: null }
    };

    const selected = stateMap[input];
    if (!selected) {
      return {
        response: `CON ${language === 'ny' ? 'Sankhani 1-5' : 'Select 1-5'}\n\n${menus[language]}`,
        newState: 'MAIN_MENU',
        context: {}
      };
    }

    if (selected.state === 'POST_SHIPMENT_ORIGIN') {
      return {
        response: `CON ${selected.prompt}\n(e.g. Lilongwe, Area 25)\n0. ${language === 'ny' ? 'Bwerera' : 'Back'}`,
        newState: 'POST_SHIPMENT_ORIGIN',
        context: {}
      };
    }

    // Handle other menu options...
    return { response: 'END Coming soon', newState: 'ENDED', context: {} };
  }

  async handleOriginInput(input, context, language) {
    if (input === '0') {
      return this.handleMainMenu('', language);
    }

    if (!input || input.trim().length < 3) {
      return {
        response: `CON ${language === 'ny' ? 'Lemberani dzina la malo' : 'Please enter location'}\n0. ${language === 'ny' ? 'Bwerera' : 'Back'}`,
        newState: 'POST_SHIPMENT_ORIGIN',
        context
      };
    }

    // Geocode or validate location (simplified here)
    const location = await this.validateLocation(input);

    return {
      response: `CON ${language === 'ny' ? 'Lemberani malo ofika:' : 'Enter destination:'}\n(e.g. Blantyre, Limbe)\n0. ${language === 'ny' ? 'Bwerera' : 'Back'}`,
      newState: 'POST_SHIPMENT_DESTINATION',
      context: {
        ...context,
        origin: location.name,
        origin_lat: location.lat,
        origin_lng: location.lng
      }
    };
  }

  async handleConfirmation(input, context, language, phone) {
    if (input === '2') {
      return this.handleMainMenu('1', language); // Edit: go back to start
    }

    if (input === '0') {
      return this.handleMainMenu('', language);
    }

    if (input === '1') {
      // Create shipment in database
      const shipment = await this.createShipment({
        shipper_phone: phone,
        origin: context.origin,
        origin_lat: context.origin_lat,
        origin_lng: context.origin_lng,
        destination: context.destination,
        destination_lat: context.destination_lat,
        destination_lng: context.destination_lng,
        cargo_type: context.cargo_type,
        weight_kg: context.weight_kg,
        price_mwk: context.price_mwk
      });

      // Trigger background matching
      await this.triggerMatching(shipment.id);

      const successMsg = language === 'ny'
        ? `Katundu walembed wa!\nRef: #${shipment.reference}\n\nTidzakuuzirani transporter akavomereza.`
        : `Shipment posted!\nRef: #${shipment.reference}\n\nWe'll notify you when a transporter accepts.`;

      return {
        response: `END ${successMsg}`,
        newState: 'ENDED',
        context: {}
      };
    }

    return {
      response: `CON ${language === 'ny' ? 'Sankhani 1 kapena 2' : 'Select 1 or 2'}\n\n1. ${language === 'ny' ? 'Vomereza' : 'Confirm'}\n2. ${language === 'ny' ? 'Sinthani' : 'Edit'}\n0. ${language === 'ny' ? 'Tuluka' : 'Cancel'}`,
      newState: 'POST_SHIPMENT_CONFIRM',
      context
    };
  }

  async validateLocation(input) {
    // In production: Use Mapbox Geocoding API or local database
    // For Malawi-specific: Maintain database of common locations
    
    const malawCities = {
      'lilongwe': { name: 'Lilongwe', lat: -13.9626, lng: 33.7741 },
      'blantyre': { name: 'Blantyre', lat: -15.7861, lng: 35.0058 },
      'mzuzu': { name: 'Mzuzu', lat: -11.4597, lng: 34.0201 },
      'zomba': { name: 'Zomba', lat: -15.3860, lng: 35.3187 }
    };

    const normalized = input.toLowerCase().trim();
    const matched = Object.keys(malawCities).find(city => 
      normalized.includes(city) || city.includes(normalized)
    );

    if (matched) {
      return malawCities[matched];
    }

    // Fallback: Return input as-is with default coordinates
    return { name: input, lat: 0, lng: 0 };
  }

  async createShipment(data) {
    // Save to PostgreSQL
    const shipment = await db.shipments.create({
      ...data,
      reference: `ML${Date.now().toString().slice(-6)}`,
      status: 'pending',
      created_at: new Date()
    });

    return shipment;
  }

  async triggerMatching(shipmentId) {
    // Add to background job queue
    await queue.add('match-shipment', { shipmentId });
  }
}
```

### 3.3 WhatsApp Business Integration (SECONDARY CHANNEL)

**Why WhatsApp Works in Africa:**
- 95% smartphone users have WhatsApp installed
- Data-efficient (compressed images, lazy loading)
- Familiar interface (no learning curve)
- Rich media support (photos, location, documents)
- End-to-end encryption (trust)
- Group chats (community building)
- Status feature (marketing channel)

**WhatsApp Business API Setup:**

```yaml
Provider Options:

Option 1: Twilio (Recommended for Startups)
  - Cost: $0.005 per message (MWK 5.30)
  - Setup fee: None
  - Phone number: $15/month
  - Verification: 1-2 weeks
  - Support: 24/7 in English
  - Integration: REST API, webhooks
  - Limits: 1,000 user-initiated conversations/day (grows with usage)

Option 2: 360Dialog (Cost-Effective for Scale)
  - Cost: €0.004 per message (MWK 4.50)
  - Setup fee: €50 one-time
  - Monthly fee: €49/month
  - Better rates at volume
  - Limits: Higher from start

Option 3: Direct Meta (Enterprise Only)
  - Requires Facebook Business Manager
  - Higher approval bar
  - Best rates but complex setup

WhatsApp Business Account Requirements:
  - Facebook Business Manager account
  - Verified business documents
  - Display name: "Matola Logistics"
  - Profile photo: Logo (192x192px)
  - Business description (256 chars)
  - Category: "Transportation/Logistics"
  - Website: https://matola.mw
  - WhatsApp number: +265 XXX XXXXXX (dedicated, not personal)

Message Types & Pricing:
  
  User-Initiated (Free for 24h):
    - User messages first
    - Business can reply for free within 24h window
    - After 24h, must use template messages
  
  Business-Initiated (Paid):
    - Template messages only
    - Pre-approved by Meta
    - $0.005 per message
    - Use for: notifications, updates, reminders
  
  Service Messages (Free):
    - Within 24h of user message
    - Transactional updates
    - Unlimited volume

Message Template Examples:

1. Shipment Confirmation Template:
   Name: shipment_confirmed
   Language: English
   Category: Transactional
   
   "Hi {{1}}, your shipment has been posted successfully!
   
   📦 Reference: {{2}}
   📍 Route: {{3}} → {{4}}
   📊 Status: Waiting for transporter
   
   We'll notify you when someone accepts.
   
   Track: https://matola.mw/track/{{2}}"
   
   Variables:
   {{1}} = Customer name
   {{2}} = Shipment reference
   {{3}} = Origin
   {{4}} = Destination

2. Match Found Template:
   Name: match_found
   Language: English & Chichewa
   Category: Transactional
   
   "Good news {{1}}! A transporter has accepted your load.
   
   🚛 Driver: {{2}}
   📞 Phone: {{3}}
   🚗 Vehicle: {{4}}
   📅 Pickup: {{5}}
   
   Please confirm pickup time with the driver."

3. Delivery Confirmation Template:
   Name: delivery_confirm
   
   "Hi {{1}}, has your shipment {{2}} been delivered?
   
   Please reply:
   1️⃣ YES - Delivered successfully
   2️⃣ NO - Not delivered yet
   3️⃣ ISSUE - There's a problem
   
   This helps us release payment to the driver."
```

**WhatsApp Conversation Flows:**

```yaml
Flow 1: User Registration via WhatsApp

User: "Hi" or "Hello" (first message)

Bot: "Welcome to Matola! 👋
I'm here to help you find transport or cargo.

Let's get you set up:
Reply with your NAME"

User: "John Banda"

Bot: "Nice to meet you, John! 

Are you a:
1️⃣ SHIPPER (I have cargo to send)
2️⃣ TRANSPORTER (I have a vehicle)

Reply with 1 or 2"

User: "1"

Bot: "Great! You're registered as a shipper.

📱 Your phone: +265 99 123 4567
👤 Name: John Banda
📦 Role: Shipper

To post your first shipment, reply:
POST [origin] TO [destination]

Example:
POST Lilongwe TO Blantyre"

---

Flow 2: Post Shipment via WhatsApp

User: "POST Lilongwe TO Blantyre"

Bot: "Got it! Shipment from Lilongwe to Blantyre.

What type of cargo?
1️⃣ Food (maize, rice, etc)
2️⃣ Building materials
3️⃣ Furniture
4️⃣ Livestock
5️⃣ Other

Reply with number or type"

User: "1"

Bot: "Food cargo selected 🌽

How much does it weigh?
Reply with weight in KG

Examples: 500 or 1000"

User: "800"

Bot: "800 kg of food cargo

How much are you willing to pay?
Reply with amount in MWK

Example: 50000"

User: "60000"

Bot: "Perfect! Here's your shipment summary:

📍 From: Lilongwe
📍 To: Blantyre
📦 Cargo: 800kg food
💰 Price: MWK 60,000

Is this correct?
Reply YES to post or NO to cancel"

User: "YES"

Bot: "✅ Shipment posted successfully!

Reference: #ML12345
Status: Finding transporters...

I'll notify you when someone accepts.

You can track anytime:
https://matola.mw/track/ML12345"

---

Flow 3: Match Notification

Bot (Template Message):
"🎉 Great news John!

A transporter has accepted your shipment #ML12345

🚛 Driver: Patrick Phiri
📞 Phone: +265 88 765 4321
🚗 Vehicle: Isuzu Truck (RU 4567)
⭐ Rating: 4.8/5 (23 trips)
📅 Pickup: Tomorrow 8:00 AM

Please contact Patrick to confirm details.

Need help? Reply HELP"

User: "Thanks!"

Bot: "You're welcome! 

Have a safe shipment. I'll check in when it's time for delivery.

Questions anytime: Just send a message! 📱"

---

Flow 4: Delivery Confirmation

Bot (2 days later, template message):
"Hi John,

It's been 2 days since your shipment #ML12345 was picked up.

Has it been delivered?
1️⃣ YES - Delivered
2️⃣ NO - Still in transit
3️⃣ ISSUE - Problem

This helps us release payment to Patrick."

User: "1"

Bot: "Excellent! 🎉

How was your experience with Patrick?
Rate from 1-5 ⭐

1 = Very bad
5 = Excellent

Just send the number"

User: "5"

Bot: "Thank you for the 5-star rating!

💰 Payment of MWK 60,000 has been released to Patrick.

Receipt: https://matola.mw/receipt/ML12345

Use Matola again soon! 🚛"

---

Flow 5: Customer Support

User: "HELP"

Bot: "I'm here to help! 🙋‍♂️

What do you need help with?
1️⃣ My shipments
2️⃣ Payment issues
3️⃣ Contact support
4️⃣ How it works

Reply with number"

User: "3"

Bot: "Connecting you to support...

Our team will reply within 15 minutes.

📞 Emergency: +265 99 XXX XXXX
📧 Email: support@matola.mw
🕐 Hours: Mon-Sat 8AM-6PM

Please describe your issue:"

[Support agent takes over the conversation]

---

Flow 6: Transporter Finds Load

User: "FIND LOAD"

Bot: "Searching for available loads...

Found 3 loads on your route:

1️⃣ Lilongwe → Blantyre
   📦 500kg maize
   💰 MWK 45,000
   📅 Tomorrow

2️⃣ Lilongwe → Mzuzu
   📦 1 ton fertilizer
   💰 MWK 80,000
   📅 Today 2PM

3️⃣ Blantyre → Zomba
   📦 Furniture
   💰 MWK 30,000
   📅 This weekend

Reply with number to see details"

User: "1"

Bot: "Load #ML12890
📍 Route: Lilongwe → Blantyre (320 km)
📦 Cargo: 500kg maize (8 bags)
💰 Price: MWK 45,000
📅 Pickup: Tomorrow 8:00 AM
📍 Location: NASFAM warehouse, Area 18

👤 Shipper: Grace Mwale
📞 Phone: +265 99 XXX XXXX
⭐ Rating: 4.9/5

Want to accept this load?
Reply YES or NO"

User: "YES"

Bot: "✅ Load accepted!

Grace has been notified. Please contact her to confirm:
📞 +265 99 XXX XXXX

📋 Next steps:
1. Confirm pickup time
2. Inspect cargo
3. Load and go!
4. Mark delivered when done

Good luck! 🚛"
```

**WhatsApp Backend Implementation:**

```javascript
// src/services/whatsappService.js

const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; // 'whatsapp:+265XXXXXXXXX'
    this.redis = new Redis();
  }

  async handleIncomingMessage(req, res) {
    const { From, Body, MediaUrl0, Latitude, Longitude } = req.body;
    
    // Verify Twilio signature
    const twilioSignature = req.headers['x-twilio-signature'];
    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      twilioSignature,
      req.url,
      req.body
    );

    if (!isValid) {
      return res.status(403).send('Forbidden');
    }

    const userPhone = From.replace('whatsapp:', '');
    const message = Body.trim();

    // Get conversation context
    const context = await this.getConversationContext(userPhone);

    // Process message based on context
    const response = await this.processMessage(userPhone, message, context, {
      media: MediaUrl0,
      location: { lat: Latitude, lng: Longitude }
    });

    // Send response
    await this.sendMessage(userPhone, response.text, response.media);

    // Update context
    await this.updateConversationContext(userPhone, response.newContext);

    res.status(200).send('OK');
  }

  async processMessage(phone, message, context, extras) {
    const user = await this.getOrCreateUser(phone);
    const currentState = context?.state || 'INITIAL';
    const normalizedMsg = message.toLowerCase().trim();

    // Command parsing
    if (normalizedMsg.startsWith('post ')) {
      return this.handlePostCommand(normalizedMsg, user);
    }

    if (normalizedMsg === 'find load') {
      return this.handleFindLoad(user);
    }

    if (normalizedMsg === 'help') {
      return this.handleHelp(user);
    }

    if (normalizedMsg === 'my shipments') {
      return this.handleMyShipments(user);
    }

    // State-based conversation
    switch (currentState) {
      case 'INITIAL':
        return this.handleInitial(user);
      
      case 'REGISTRATION_NAME':
        return this.handleNameInput(phone, message);
      
      case 'REGISTRATION_ROLE':
        return this.handleRoleInput(phone, message);
      
      case 'POST_CARGO_TYPE':
        return this.handleCargoType(message, context, user);
      
      case 'POST_WEIGHT':
        return this.handleWeight(message, context, user);
      
      case 'POST_PRICE':
        return this.handlePrice(message, context, user);
      
      case 'POST_CONFIRM':
        return this.handlePostConfirm(message, context, user);
      
      case 'LOAD_DETAIL':
        return this.handleLoadAction(message, context, user);
      
      case 'DELIVERY_CONFIRM':
        return this.handleDeliveryConfirm(message, context, user);
      
      case 'RATING':
        return this.handleRating(message, context, user);
      
      case 'SUPPORT':
        // Forward to human agent
        await this.notifySupportTeam(phone, message, context);
        return {
          text: "Support agent will respond shortly. Our team is available Mon-Sat 8AM-6PM.",
          newContext: { state: 'SUPPORT', ...context }
        };
      
      default:
        return this.handleHelp(user);
    }
  }

  async handlePostCommand(message, user) {
    // Parse: "POST Lilongwe TO Blantyre"
    const match = message.match(/post\s+(.+?)\s+to\s+(.+)/i);
    
    if (!match) {
      return {
        text: "I didn't understand that. Try:\nPOST [origin] TO [destination]\n\nExample:\nPOST Lilongwe TO Blantyre",
        newContext: { state: 'INITIAL' }
      };
    }

    const [, origin, destination] = match;

    return {
      text: `Got it! Shipment from ${origin} to ${destination}.\n\nWhat type of cargo?\n1️⃣ Food (maize, rice, etc)\n2️⃣ Building materials\n3️⃣ Furniture\n4️⃣ Livestock\n5️⃣ Other\n\nReply with number or type`,
      newContext: {
        state: 'POST_CARGO_TYPE',
        origin,
        destination
      }
    };
  }

  async handleCargoType(message, context, user) {
    const cargoTypes = {
      '1': 'food',
      '2': 'building_materials',
      '3': 'furniture',
      '4': 'livestock',
      '5': 'other',
      'food': 'food',
      'building': 'building_materials',
      'furniture': 'furniture',
      'livestock': 'livestock',
      'other': 'other'
    };

    const cargoType = cargoTypes[message.toLowerCase()];

    if (!cargoType) {
      return {
        text: "Please select 1-5 or type the cargo type",
        newContext: context
      };
    }

    const cargoEmojis = {
      food: '🌽',
      building_materials: '🧱',
      furniture: '🛋️',
      livestock: '🐄',
      other: '📦'
    };

    return {
      text: `${cargoEmojis[cargoType]} ${cargoType.replace('_', ' ')} selected\n\nHow much does it weigh?\nReply with weight in KG\n\nExamples: 500 or 1000`,
      newContext: {
        ...context,
        state: 'POST_WEIGHT',
        cargo_type: cargoType
      }
    };
  }

  async handleWeight(message, context, user) {
    const weight = parseFloat(message.replace(/[^\d.]/g, ''));

    if (isNaN(weight) || weight <= 0) {
      return {
        text: "Please enter a valid weight in KG (numbers only)",
        newContext: context
      };
    }

    return {
      text: `${weight}kg of ${context.cargo_type.replace('_', ' ')}\n\nHow much are you willing to pay?\nReply with amount in MWK\n\nExample: 50000`,
      newContext: {
        ...context,
        state: 'POST_PRICE',
        weight_kg: weight
      }
    };
  }

  async handlePrice(message, context, user) {
    const price = parseFloat(message.replace(/[^\d.]/g, ''));

    if (isNaN(price) || price <= 0) {
      return {
        text: "Please enter a valid amount in MWK (numbers only)",
        newContext: context
      };
    }

    return {
      text: `Perfect! Here's your shipment summary:\n\n📍 From: ${context.origin}\n📍 To: ${context.destination}\n📦 Cargo: ${context.weight_kg}kg ${context.cargo_type.replace('_', ' ')}\n💰 Price: MWK ${price.toLocaleString()}\n\nIs this correct?\nReply YES to post or NO to cancel`,
      newContext: {
        ...context,
        state: 'POST_CONFIRM',
        price_mwk: price
      }
    };
  }

  async handlePostConfirm(message, context, user) {
    if (message.toLowerCase() !== 'yes') {
      return {
        text: "Shipment cancelled. Send 'POST [origin] TO [destination]' to start again.",
        newContext: { state: 'INITIAL' }
      };
    }

    // Create shipment
    const shipment = await db.shipments.create({
      shipper_id: user.id,
      origin: context.origin,
      destination: context.destination,
      cargo_type: context.cargo_type,
      weight_kg: context.weight_kg,
      price_mwk: context.price_mwk,
      status: 'pending',
      reference: `ML${Date.now().toString().slice(-6)}`
    });

    // Trigger matching
    await queue.add('match-shipment', { shipmentId: shipment.id });

    return {
      text: `✅ Shipment posted successfully!\n\nReference: #${shipment.reference}\nStatus: Finding transporters...\n\nI'll notify you when someone accepts.\n\nYou can track anytime:\nhttps://matola.mw/track/${shipment.reference}`,
      newContext: { state: 'INITIAL' }
    };
  }

  async sendMessage(to, text, mediaUrl = null) {
    try {
      const message = await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:${to}`,
        body: text,
        ...(mediaUrl && { mediaUrl: [mediaUrl] })
      });

      // Log for debugging
      await db.message_logs.create({
        phone: to,
        direction: 'outbound',
        content: text,
        status: message.status
      });

      return message;
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  }

  async sendTemplateMessage(to, templateName, variables) {
    // Template messages for business-initiated conversations
    const templates = {
      match_found: `Good news {{1}}! A transporter has accepted your load.\n\n🚛 Driver: {{2}}\n📞 Phone: {{3}}\n🚗 Vehicle: {{4}}\n📅 Pickup: {{5}}\n\nPlease confirm pickup time with the driver.`,
      
      delivery_confirm: `Hi {{1}}, has your shipment {{2}} been delivered?\n\nPlease reply:\n1️⃣ YES - Delivered successfully\n2️⃣ NO - Not delivered yet\n3️⃣ ISSUE - There's a problem\n\nThis helps us release payment to the driver.`,
      
      payment_received: `Payment confirmed! 💰\n\nAmount: MWK {{1}}\nMethod: {{2}}\nReference: {{3}}\n\nReceipt: https://matola.mw/receipt/{{3}}`
    };

    let text = templates[templateName];
    variables.forEach((value, index) => {
      text = text.replace(new RegExp(`{{${index + 1}}}`, 'g'), value);
    });

    return this.sendMessage(to, text);
  }

  async getConversationContext(phone) {
    const key = `wa:conv:${phone}`;
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async updateConversationContext(phone, context) {
    const key = `wa:conv:${phone}`;
    await this.redis.setex(key, 86400, JSON.stringify(context)); // 24h TTL
  }

  async getOrCreateUser(phone) {
    let user = await db.users.findOne({ where: { phone } });
    
    if (!user) {
      user = await db.users.create({
        phone,
        name: phone, // Temporary
        role: 'unknown',
        verified: false
      });
    }

    return user;
  }
}

module.exports = new WhatsAppService();
```

### 3.4 SMS Notifications (TERTIARY CHANNEL)

**SMS Strategy:**

```yaml
SMS Use Cases (Push Notifications Only):
  1. OTP for registration/login
  2. Shipment match notifications
  3. Pickup reminders
  4. Delivery confirmations
  5. Payment receipts
  6. Emergency alerts

SMS Provider: Africa's Talking
  Bulk SMS Rates:
    - 1-500 SMS: MWK 15 per SMS (~$0.014)
    - 501-5,000: MWK 12 per SMS
    - 5,001+: MWK 10 per SMS
  
  Character Limits:
    - Single SMS: 160 characters
    - Concatenated: 153 chars per part (max 3 parts = 459 chars)
    - Unicode (Chichewa): 70 chars per part
  
  Delivery:
    - Success rate: 95-98%
    - Delivery time: 5-30 seconds
    - Network-dependent reliability

SMS Templates (160 char limit):

1. OTP (English):
   "Your Matola verification code is: {code}. Valid for 5 minutes. Do not share this code."
   [99 characters]

2. OTP (Chichewa):
   "Nambala yanu ya Matola ndi: {code}. Yagwira ntchito kwa mphindi 5. Musagawane nambala iyi."
   [95 characters]

3. Match Notification:
   "Matola: Transporter found for #{ref}! {name} ({phone}) will pickup {date}. Track: matola.mw/{ref}"
   [103 characters]

4. Delivery Reminder:
   "Matola: Shipment #{ref} should arrive today. Confirm delivery via *384*628652# or WhatsApp."
   [96 characters]

5. Payment Confirmation:
   "Matola: Payment of MK{amount} received for #{ref}. Receipt: matola.mw/r/{ref}"
   [80 characters]

SMS Optimization:
  - Use URL shortener (matola.mw/t/xxx instead of full URL)
  - Remove unnecessary words
  - Use abbreviations carefully (MK not MWK)
  - Avoid special characters (they may not render on all phones)
  - Test on feature phones before deploying

SMS Sending Strategy:
  - Queue-based with retry logic
  - Priority: OTP > Payment > Match > Reminder
  - Batch sending during off-peak (2AM-6AM) for marketing
  - DLR (Delivery Report) tracking
  - Fallback to alternative network if primary fails

Cost Management:
  - Estimated volume: 10,000 SMS/month (Phase 1)
  - Budget: MWK 150,000/month (~$140)
  - User opt-in required for non-transactional SMS
  - Opt-out option in every marketing SMS
```

**SMS Backend Implementation:**

```javascript
// src/services/smsService.js

const AfricasTalking = require('africastalking');

class SMSService {
  constructor() {
    this.africastalking = AfricasTalking({
      apiKey: process.env.AFRICASTALKING_API_KEY,
      username: process.env.AFRICASTALKING_USERNAME
    });
    this.sms = this.africastalking.SMS;
    this.queue = new Bull('sms-queue');
  }

  async sendOTP(phone, code, language = 'en') {
    const messages = {
      en: `Your Matola verification code is: ${code}. Valid for 5 minutes. Do not share this code.`,
      ny: `Nambala yanu ya Matola ndi: ${code}. Yagwira ntchito kwa mphindi 5. Musagawane nambala iyi.`
    };

    return this.send(phone, messages[language], 'otp', true);
  }

  async sendMatchNotification(phone, shipment, transporter) {
    const message = `Matola: Transporter found for #${shipment.reference}! ${transporter.name} (${transporter.phone}) will pickup ${shipment.pickup_date}. Track: matola.mw/${shipment.reference}`;
    
    return this.send(phone, message, 'match', false);
  }

  async sendPaymentConfirmation(phone, payment) {
    const message = `Matola: Payment of MK${payment.amount_mwk.toLocaleString()} received for #${payment.shipment.reference}. Receipt: matola.mw/r/${payment.reference}`;
    
    return this.send(phone, message, 'payment', true);
  }

  async send(to, message, type = 'general', priority = false) {
    // Normalize phone number
    const phone = this.normalizePhone(to);

    // Validate message length
    if (message.length > 459) {
      console.warn(`SMS too long (${message.length} chars), truncating`);
      message = message.substring(0, 456) + '...';
    }

    // Add to queue or send immediately
    if (priority) {
      return this.sendImmediate(phone, message, type);
    } else {
      return this.queue.add({ phone, message, type }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      });
    }
  }

  async sendImmediate(phone, message, type) {
    try {
      const result = await this.sms.send({
        to: [phone],
        message: message,
        from: 'Matola' // Sender ID (must be registered with AT)
      });

      // Log to database
      await db.sms_logs.create({
        phone,
        message,
        type,
        status: result.SMSMessageData.Recipients[0].status,
        message_id: result.SMSMessageData.Recipients[0].messageId,
        cost: result.SMSMessageData.Recipients[0].cost
      });

      return result;
    } catch (error) {
      console.error('SMS send error:', error);
      
      // Log failure
      await db.sms_logs.create({
        phone,
        message,
        type,
        status: 'failed',
        error: error.message
      });

      throw error;
    }
  }

  normalizePhone(phone) {
    // Convert various formats to +265XXXXXXXXX
    let normalized = phone.replace(/\s+/g, '');
    
    if (normalized.startsWith('0')) {
      normalized = '+265' + normalized.substring(1);
    } else if (normalized.startsWith('265')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+')) {
      normalized = '+265' + normalized;
    }

    return normalized;
  }

  async getDeliveryReport(messageId) {
    // Check delivery status
    const log = await db.sms_logs.findOne({ where: { message_id: messageId } });
    return log;
  }
}

module.exports = new SMSService();
```

---

## 4. DATA & INFRASTRUCTURE ARCHITECTURE

### 4.1 Database Design for African Scale

```yaml
Database Choice: PostgreSQL 14+
Rationale:
  - ACID compliance (critical for payments)
  - JSON/JSONB support (flexible for evolving data)
  - Full-text search (Chichewa language support)
  - PostGIS extension (geospatial queries)
  - Proven reliability in African deployments
  - Open source (no licensing costs)

Hosting Strategy:

Phase 1 (MVP - 1,000 users):
  Provider: DigitalOcean Managed Database
  Spec: 2 vCPU, 4GB RAM, 50GB SSD
  Location: London (closest to Malawi with good connectivity)
  Cost: $60/month
  Backup: Automated daily, 7-day retention
  
Phase 2 (Growth - 10,000 users):
  Provider: AWS RDS
  Spec: db.t3.medium (2 vCPU, 4GB RAM, 100GB GP3 SSD)
  Location: Africa (Cape Town) region
  Cost: $120/month
  Features:
    - Multi-AZ deployment (failover)
    - Read replicas for analytics
    - Automated backups (point-in-time recovery)
    - Performance Insights

Phase 3 (Scale - 50,000+ users):
  Primary: AWS RDS db.r5.large (2 vCPU, 16GB RAM)
  Read Replicas: 2x db.t3.medium
  Cost: $400/month
  Features:
    - Connection pooling (PgBouncer)
    - Query optimization
    - Partitioning strategy

Database Schema (Detailed):

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('shipper', 'transporter', 'admin', 'support')),
  language VARCHAR(5) DEFAULT 'en' CHECK (language IN ('en', 'ny', 'tu', 'yo')),
  verified BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(20), -- 'union', 'nasfam', 'manual', 'none'
  verification_date TIMESTAMP,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_verified ON users(verified);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration VARCHAR(20) UNIQUE NOT NULL, -- MWI format: RU 1234
  make VARCHAR(50), -- Toyota, Isuzu, Fuso, etc.
  model VARCHAR(50),
  year INTEGER,
  type VARCHAR(20) NOT NULL CHECK (type IN ('truck', 'pickup', 'van', 'motorcycle', 'bicycle')),
  capacity_kg INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'suspended')),
  insurance_expiry DATE,
  license_expiry DATE,
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(type);

-- Shipments table
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(20) UNIQUE NOT NULL, -- ML123456
  shipper_id UUID NOT NULL REFERENCES users(id),
  
  -- Origin
  origin VARCHAR(255) NOT NULL,
  origin_lat DECIMAL(10,8),
  origin_lng DECIMAL(11,8),
  origin_details TEXT, -- Landmark, instructions
  
  -- Destination
  destination VARCHAR(255) NOT NULL,
  destination_lat DECIMAL(10,8),
  destination_lng DECIMAL(11,8),
  destination_details TEXT,
  
  -- Cargo
  cargo_type VARCHAR(50) NOT NULL,
  cargo_description TEXT,
  weight_kg DECIMAL(10,2) NOT NULL CHECK (weight_kg > 0),
  volume_m3 DECIMAL(10,2),
  quantity INTEGER DEFAULT 1,
  value_mwk DECIMAL(12,2), -- For insurance
  
  -- Pricing
  price_mwk DECIMAL(12,2) NOT NULL CHECK (price_mwk > 0),
  negotiable BOOLEAN DEFAULT TRUE,
  
  -- Timing
  departure_date DATE NOT NULL,
  departure_time TIME,
  delivery_deadline DATE,
  flexible_timing BOOLEAN DEFAULT TRUE,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'matched', 'accepted', 'in_transit', 'delivered', 'cancelled', 'disputed'
  )),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  matched_at TIMESTAMP,
  accepted_at TIMESTAMP,
  pickup_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Additional
  special_requirements TEXT,
  photos JSONB DEFAULT '[]'::jsonb, -- Array of photo URLs
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT valid_dates CHECK (departure_date >= CURRENT_DATE)
);

CREATE INDEX idx_shipments_shipper_id ON shipments(shipper_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_departure_date ON shipments(departure_date);
CREATE INDEX idx_shipments_origin_destination ON shipments(origin, destination);
CREATE INDEX idx_shipments_created_at ON shipments(created_at DESC);

-- Geospatial index for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE shipments ADD COLUMN origin_geom GEOGRAPHY(POINT, 4326);
ALTER TABLE shipments ADD COLUMN destination_geom GEOGRAPHY(POINT, 4326);
CREATE INDEX idx_shipments_origin_geom ON shipments USING GIST(origin_geom);
CREATE INDEX idx_shipments_destination_geom ON shipments USING GIST(destination_geom);

-- Trigger to update geom columns
CREATE OR REPLACE FUNCTION update_shipment_geom()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.origin_lat IS NOT NULL AND NEW.origin_lng IS NOT NULL THEN
    NEW.origin_geom = ST_SetSRID(ST_MakePoint(NEW.origin_lng, NEW.origin_lat), 4326)::geography;
  END IF;
  IF NEW.destination_lat IS NOT NULL AND NEW.destination_lng IS NOT NULL THEN
    NEW.destination_geom = ST_SetSRID(ST_MakePoint(NEW.destination_lng, NEW.destination_lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shipment_geom
BEFORE INSERT OR UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION update_shipment_geom();

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  transporter_id UUID NOT NULL REFERENCES users(id),
  vehicle_id UUID REFERENCES vehicles(id),
  
  match_score DECIMAL(5,2), -- 0-100
  match_algorithm_version VARCHAR(10), -- For A/B testing
  
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'expired', 'completed', 'cancelled'
  )),
  
  -- Price negotiation
  proposed_price_mwk DECIMAL(12,2),
  counter_price_mwk DECIMAL(12,2),
  final_price_mwk DECIMAL(12,2),
  
  -- Timestamps
  matched_at TIMESTAMP DEFAULT NOW(),
  notified_at TIMESTAMP,
  viewed_at TIMESTAMP,
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  expired_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  rejection_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  CONSTRAINT unique_active_match UNIQUE (shipment_id, transporter_id, status)
);

CREATE INDEX idx_matches_shipment_id ON matches(shipment_id);
CREATE INDEX idx_matches_transporter_id ON matches(transporter_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_matched_at ON matches(matched_at DESC);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference VARCHAR(50) UNIQUE NOT NULL, -- PAY_ML123456_20241206
  
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  match_id UUID REFERENCES matches(id),
  payer_id UUID NOT NULL REFERENCES users(id),
  payee_id UUID NOT NULL REFERENCES users(id),
  
  amount_mwk DECIMAL(12,2) NOT NULL CHECK (amount_mwk > 0),
  currency VARCHAR(3) DEFAULT 'MWK',
  
  method VARCHAR(20) NOT NULL CHECK (method IN ('airtel_money', 'tnm_mpamba', 'cash', 'bank_transfer')),
  
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'refunded', 'disputed'
  )),
  
  -- Provider details
  provider_reference VARCHAR(100), -- Airtel/TNM transaction ID
  provider_response JSONB,
  
  -- Escrow
  escrow_status VARCHAR(20) CHECK (escrow_status IN ('held', 'released', 'refunded')),
  held_at TIMESTAMP,
  released_at TIMESTAMP,
  
  -- Verification (for cash payments)
  verification_method VARCHAR(20), -- 'photo', 'manual', 'auto'
  verified_by UUID REFERENCES users(id),
  verification_photo_url VARCHAR(500),
  
  -- Timestamps
  initiated_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  failed_at TIMESTAMP,
  refunded_at TIMESTAMP,
  
  failure_reason TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_payments_shipment_id ON payments(shipment_id);
CREATE INDEX idx_payments_payer_id ON payments(payer_id);
CREATE INDEX idx_payments_payee_id ON payments(payee_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_reference ON payments(reference);

-- USSD Sessions table
CREATE TABLE ussd_sessions (
  session_id VARCHAR(100) PRIMARY KEY,
  phone VARCHAR(15) NOT NULL,
  service_code VARCHAR(20), -- *384*628652#
  
  state VARCHAR(50) NOT NULL,
  language VARCHAR(5) DEFAULT 'en',
  step_count INTEGER DEFAULT 0,
  
  context JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '5 minutes')
);

CREATE INDEX idx_ussd_sessions_phone ON ussd_sessions(phone);
CREATE INDEX idx_ussd_sessions_expires_at ON ussd_sessions(expires_at);

-- Auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_ussd_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM ussd_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup every hour
SELECT cron.schedule('cleanup-ussd-sessions', '0 * * * *', 'SELECT cleanup_expired_ussd_sessions()');

-- Audit Logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'payment', etc.
  entity VARCHAR(50) NOT NULL, -- 'shipment', 'payment', 'user', etc.
  entity_id UUID,
  
  changes JSONB, -- {"before": {...}, "after": {...}}
  
  ip_address INET,
  user_agent TEXT,
  
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Partitioning by month for performance
CREATE TABLE audit_logs_2024_12 PARTITION OF audit_logs
FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  type VARCHAR(20) NOT NULL CHECK (type IN ('match', 'payment', 'delivery', 'rating', 'system')),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('ussd', 'sms', 'whatsapp', 'push', 'email')),
  
  title VARCHAR(255),
  message TEXT NOT NULL,
  data JSONB, -- Additional context
  
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  failed_at TIMESTAMP,
  
  failure_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id),
  match_id UUID REFERENCES matches(id),
  
  rater_id UUID NOT NULL REFERENCES users(id),
  rated_user_id UUID NOT NULL REFERENCES users(id),
  
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  
  categories JSONB, -- {"punctuality": 5, "communication": 4, "condition": 5}
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_rating UNIQUE (shipment_id, rater_id, rated_user_id)
);

CREATE INDEX idx_ratings_rated_user_id ON ratings(rated_user_id);
CREATE INDEX idx_ratings_shipment_id ON ratings(shipment_id);

-- Trigger to update user rating average
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET 
    rating_average = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM ratings
      WHERE rated_user_id = NEW.rated_user_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM ratings
      WHERE rated_user_id = NEW.rated_user_id
    )
  WHERE id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rating
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();
```

### 4.2 Caching Strategy with Redis

```yaml
Redis Use Cases:
  1. USSD session state (critical, TTL: 5 min)
  2. WhatsApp conversation context (TTL: 24h)
  3. User authentication tokens (TTL: 24h)
  4. Rate limiting counters (TTL: 1h)
  5. Application caching (menu templates, locations, etc.)
  6. Queue management (Bull/BullMQ)
  7. Real-time leaderboards/statistics

Redis Hosting:

Phase 1:
  Provider: Redis Cloud (formerly RedisLabs)
  Plan: 100MB free tier
  Location: AWS eu-west-1 (Ireland, closest free option)
  Cost: $0/month
  
Phase 2:
  Provider: AWS ElastiCache
  Type: cache.t3.micro (0.5GB RAM)
  Location: Africa (Cape Town)
  Cost: $15/month
  Features: Automatic failover, daily backups

Phase 3:
  Type: cache.t3.small (1.5GB RAM)
  Read Replicas: 1-2 for scaling
  Cost: $45/month

Redis Data Structures:

# 1. USSD Sessions
KEY: ussd:session:{sessionId}
TYPE: Hash
TTL: 300 seconds
VALUE: {
  "phone": "+265991234567",
  "state": "POST_SHIPMENT_WEIGHT",
  "language": "ny",
  "step_count": 4,
  "context": "{\"origin\":\"Lilongwe\",\"destination\":\"Blantyre\"}",
  "created_at": "2024-12-06T10:30:00Z",
  "updated_at": "2024-12-06T10:32:00Z"
}

# 2. WhatsApp Conversations
KEY: wa:conv:{phone}
TYPE: Hash
TTL: 86400 seconds (24h)
VALUE: {
  "state": "POST_CARGO_TYPE",
  "context": "{\"origin\":\"Lilongwe\"}",
  "last_message_at": "2024-12-06T10:30:00Z"
}

# 3. Rate Limiting
KEY: ratelimit:{endpoint}:{ip}
TYPE: String (counter)
TTL: 60 seconds
VALUE: "42" (request count)

# 4. User Sessions
KEY: session:{userId}
TYPE: Hash
TTL: 86400 seconds
VALUE: {
  "user_id": "uuid",
  "phone": "+265991234567",
  "role": "shipper",
  "language": "en",
  "token": "jwt_token_here"
}

# 5. Cache: Available Shipments
KEY: cache:shipments:available:{route}
TYPE: List
TTL: 300 seconds (5 min)
VALUE: ["uuid1", "uuid2", "uuid3"]

# 6. Cache: Menu Templates
KEY: cache:ussd:menu:{menu_name}:{language}
TYPE: String
TTL: 86400 seconds (24h)
VALUE: "Welcome to Matola\n1. Post load\n..."

# 7. Leaderboard: Top Transporters
KEY: leaderboard:transporters:monthly
TYPE: Sorted Set
SCORE: Total deliveries
VALUE: user_id

ZADD leaderboard:transporters:monthly 45 "user_uuid_1"
ZADD leaderboard:transporters:monthly 38 "user_uuid_2"
ZREVRANGE leaderboard:transporters:monthly 0 9 WITHSCORES

# 8. Real-time Statistics
KEY: stats:daily:{date}
TYPE: Hash
TTL: 604800 seconds (7 days)
VALUE: {
  "shipments_created": "127",
  "matches_made": "89",
  "payments_completed": "67",
  "active_users": "342"
}

# 9. Queue Jobs (Bull)
KEY: bull:match-shipment:*
Managed by Bull library automatically

Caching Strategies:

Cache-Aside (Lazy Loading):
  - Check cache first
  - If miss, query database
  - Store in cache for next time
  - Use for: User profiles, shipment details
  
  Example:
  async function getShipment(id) {
    const cached = await redis.get(`shipment:${id}`);
    if (cached) return JSON.parse(cached);
    
    const shipment = await db.shipments.findById(id);
    await redis.setex(`shipment:${id}`, 3600, JSON.stringify(shipment));
    return shipment;
  }

Write-Through:
  - Write to cache and database simultaneously
  - Ensures cache is always fresh
  - Use for: Critical data (payments)
  
  Example:
  async function createPayment(data) {
    const payment = await db.payments.create(data);
    await redis.setex(`payment:${payment.id}`, 3600, JSON.stringify(payment));
    return payment;
  }

Time-Based Invalidation:
  - Set appropriate TTL based on data volatility
  - Use for: Statistics, leaderboards
  
  TTL Guidelines:
    - USSD sessions: 300s (5 min)
    - User sessions: 86400s (24h)
    - Available shipments: 300s (5 min)
    - Menu templates: 86400s (24h - rarely change)
    - Statistics: 3600s (1h)
    - User profiles: 1800s (30 min)

Event-Based Invalidation:
  - Invalidate cache when data changes
  - Use for: Shipment updates, user profile changes
  
  Example:
  async function updateShipmentStatus(id, status) {
    await db.shipments.update(id, { status });
    await redis.del(`shipment:${id}`);
    await redis.del(`cache:shipments:available:*`); // Invalidate list cache
  }
```

### 4.3 File Storage Strategy

```yaml
Storage Requirements:
  - User verification documents (ID cards, licenses)
  - Vehicle photos and registration documents
  - Cargo photos (before/after)
  - Payment verification photos (cash receipts)
  - Profile pictures
  - System logs (for compliance)

Storage Provider: AWS S3

Bucket Structure:
  matola-production:
    /users/
      /{user_id}/
        /profile.jpg
        /id_card.jpg
        /license.jpg
    
    /vehicles/
      /{vehicle_id}/
        /photo_front.jpg
        /photo_side.jpg
        /registration.pdf
    
    /shipments/
      /{shipment_id}/
        /cargo_001.jpg
        /cargo_002.jpg
    
    /payments/
      /{payment_id}/
        /receipt.jpg
    
    /logs/
      /{date}/
        /application.log
        /audit.log

Storage Policies:

Lifecycle Rules:
  - User documents: Keep forever (compliance)
  - Vehicle photos: Keep for 1 year after vehicle inactive
  - Shipment photos: Move to Glacier after 90 days
  - Payment receipts: Keep for 7 years (tax compliance)
  - Logs: Keep 30 days hot, 1 year cold, then delete

Image Optimization:
  - Resize on upload (max 1920x1080)
  - Compress to WebP format (70% quality)
  - Generate thumbnails (200x200, 400x400)
  - Strip EXIF metadata (except GPS if needed)

Upload Process:
  1. Client requests presigned URL from API
  2. API generates S3 presigned PUT URL (expires 15 min)
  3. Client uploads directly to S3 (saves server bandwidth)
  4. Client notifies API of successful upload
  5. API validates and processes image
  6. API updates database with file URL

Security:
  - All buckets private (no public read)
  - Access via presigned URLs only (expires 1 hour)
  - Encryption at rest (AES-256)
  - Versioning enabled (recover deleted files)
  - Cross-region replication for disaster recovery

Cost Optimization:
  - S3 Standard for hot data (<30 days)
  - S3 Intelligent-Tiering for mixed access
  - S3 Glacier for archive (7 year retention)
  - CloudFront CDN for frequently accessed images
  
  Estimated Costs (Phase 1):
    - Storage: 100GB × $0.023/GB = $2.30/month
    - Requests: 100,000 PUT × $0.005/1000 = $0.50/month
    - Bandwidth: 500GB × $0.09/GB = $45/month
    - Total: ~$50/month

File Upload API:

POST /api/uploads/request
Authorization: Bearer {token}
Body: {
  "file_type": "user_id_card",
  "file_name": "id_card.jpg",
  "content_type": "image/jpeg",
  "file_size": 2048576
}

Response: {
  "upload_url": "https://s3.amazonaws.com/matola-production/...",
  "file_id": "uuid",
  "expires_at": "2024-12-06T11:00:00Z"
}

POST /api/uploads/confirm
Authorization: Bearer {token}
Body: {
  "file_id": "uuid"
}

Response: {
  "file_url": "https://cdn.matola.mw/files/uuid.jpg",
  "thumbnails": {
    "small": "https://cdn.matola.mw/thumbs/uuid_200.jpg",
    "medium": "https://cdn.matola.mw/thumbs/uuid_400.jpg"
  }
}
```
# 5. MATCHING ALGORITHM & BUSINESS LOGIC

This is the **heart** of Matola - the intelligent system that connects cargo with transport efficiently. In Africa, where trust, relationships, and practical logistics matter more than algorithmic perfection, we need a matching system that balances automation with human judgment.

---

## 5.1 Matching Philosophy

**African Transport Reality:**
- Transporters often know their routes by heart (Lilongwe-Blantyre weekly)
- Return trips are the primary opportunity (going back empty is lost money)
- Timing flexibility is cultural (departure times are estimates, not guarantees)
- Personal connections matter ("I know this driver from my village")
- Price negotiation is expected (first price is never final)
- Vehicle condition varies widely (some trucks are 30+ years old)

**Matola's Matching Approach:**
```yaml
Matching Strategy:
  Phase 1 (Launch): Semi-Automated + Manual Review
    - Algorithm suggests top 5-10 matches
    - Support team manually reviews questionable matches
    - Transporters can browse ALL available loads
    - Shippers receive automatic notifications for good matches
    - Human override available for edge cases
  
  Phase 2 (Month 4-6): Intelligent Automation
    - Algorithm handles 80% of matches automatically
    - Machine learning improves scoring over time
    - Manual review only for high-value shipments (>MWK 500,000)
    - A/B testing different matching parameters
  
  Phase 3 (Month 7-12): Predictive Matching
    - Predict transporter routes based on history
    - Proactive load suggestions before they search
    - Dynamic pricing recommendations
    - Route optimization for multi-stop trips

Core Principles:
  1. **Proximity over perfection**: Match 80% fit today beats 100% fit next week
  2. **Return trips first**: Prioritize filling empty return journeys
  3. **Reputation matters**: Verified, highly-rated users get priority
  4. **Flexibility wins**: Allow manual browsing alongside automatic matching
  5. **Local knowledge**: Routes like Lilongwe-Blantyre are well-known, optimize for these
```

---

## 5.2 Matching Algorithm Implementation

### 5.2.1 Core Matching Logic

```javascript
// src/services/matchingService.js

class MatchingService {
  constructor() {
    this.db = require('../db');
    this.redis = require('../redis');
    this.notification = require('./notificationService');
  }

  /**
   * Main matching function - called when:
   * 1. New shipment is posted (find transporters)
   * 2. Transporter searches for loads (find shipments)
   * 3. Background job runs every 15 minutes (batch matching)
   */
  async findMatches(shipmentId, options = {}) {
    const shipment = await this.db.shipments.findById(shipmentId);
    if (!shipment || shipment.status !== 'pending') {
      return [];
    }

    // 1. Find candidate transporters
    const candidates = await this.findCandidateTransporters(shipment);

    // 2. Score each candidate
    const scoredMatches = await Promise.all(
      candidates.map(async (transporter) => {
        const score = await this.calculateMatchScore(shipment, transporter);
        return { transporter, score };
      })
    );

    // 3. Filter by minimum score threshold
    const MIN_SCORE = 30; // 0-100 scale
    const validMatches = scoredMatches.filter(m => m.score >= MIN_SCORE);

    // 4. Sort by score (descending)
    validMatches.sort((a, b) => b.score - a.score);

    // 5. Take top N matches
    const MAX_MATCHES = options.maxMatches || 10;
    const topMatches = validMatches.slice(0, MAX_MATCHES);

    // 6. Create match records in database
    const matches = await Promise.all(
      topMatches.map(async ({ transporter, score }) => {
        return this.createMatch(shipment, transporter, score);
      })
    );

    // 7. Notify transporters (async)
    this.notifyTransporters(matches).catch(err => {
      console.error('Error notifying transporters:', err);
    });

    return matches;
  }

  /**
   * Find candidate transporters based on:
   * - Vehicle capacity
   * - Recent activity (active in last 30 days)
   * - Not banned/suspended
   * - Has verified vehicle
   */
  async findCandidateTransporters(shipment) {
    // Get transporters with suitable vehicles
    const query = `
      SELECT DISTINCT
        u.id as user_id,
        u.phone,
        u.name,
        u.rating_average,
        u.rating_count,
        u.verified,
        u.last_active_at,
        v.id as vehicle_id,
        v.registration,
        v.type,
        v.capacity_kg,
        v.make,
        v.model,
        
        -- Check if transporter has history on this route
        (
          SELECT COUNT(*)
          FROM shipments s2
          JOIN matches m2 ON s2.id = m2.shipment_id
          WHERE m2.transporter_id = u.id
            AND m2.status = 'completed'
            AND s2.origin = $1
            AND s2.destination = $2
        ) as route_experience
        
      FROM users u
      JOIN vehicles v ON u.id = v.user_id
      WHERE u.role = 'transporter'
        AND v.status = 'active'
        AND v.capacity_kg >= $3  -- Can carry the weight
        AND u.last_active_at > NOW() - INTERVAL '30 days'  -- Active recently
        AND NOT EXISTS (
          SELECT 1 FROM matches m
          WHERE m.shipment_id = $4
            AND m.transporter_id = u.id
            AND m.status NOT IN ('rejected', 'expired')
        )  -- Not already matched
      ORDER BY u.rating_average DESC, route_experience DESC
      LIMIT 100
    `;

    const candidates = await this.db.query(query, [
      shipment.origin,
      shipment.destination,
      shipment.weight_kg,
      shipment.id
    ]);

    return candidates.rows;
  }

  /**
   * Calculate match score (0-100)
   * 
   * Scoring Breakdown:
   * - Route Match: 40 points
   * - Capacity Match: 20 points
   * - Timing Match: 15 points
   * - Reputation: 15 points
   * - Experience: 10 points
   */
  async calculateMatchScore(shipment, transporter) {
    let score = 0;

    // 1. ROUTE MATCH (40 points max)
    const routeScore = await this.calculateRouteScore(shipment, transporter);
    score += routeScore * 0.4;

    // 2. CAPACITY MATCH (20 points max)
    const capacityScore = this.calculateCapacityScore(
      shipment.weight_kg,
      transporter.capacity_kg
    );
    score += capacityScore * 0.2;

    // 3. TIMING MATCH (15 points max)
    const timingScore = await this.calculateTimingScore(shipment, transporter);
    score += timingScore * 0.15;

    // 4. REPUTATION SCORE (15 points max)
    const reputationScore = this.calculateReputationScore(transporter);
    score += reputationScore * 0.15;

    // 5. EXPERIENCE SCORE (10 points max)
    const experienceScore = this.calculateExperienceScore(transporter);
    score += experienceScore * 0.1;

    return Math.round(score);
  }

  /**
   * Route matching logic - The most critical factor
   * 
   * African Reality:
   * - Major routes are well-defined (M1 highway: Lilongwe-Blantyre)
   * - Transporters have regular routes (e.g., weekly Lilongwe-Blantyre-Lilongwe)
   * - Empty return trips are the primary opportunity
   * - Deviation tolerance: 50km is acceptable, 100km+ is too much
   */
  async calculateRouteScore(shipment, transporter) {
    // Check if this is a known return route for the transporter
    const isKnownReturnRoute = await this.isKnownReturnRoute(
      transporter.user_id,
      shipment.origin,
      shipment.destination
    );

    if (isKnownReturnRoute) {
      return 100; // Perfect match - known return route
    }

    // Check if transporter has done this exact route before
    if (transporter.route_experience > 0) {
      return 90; // Very good match - has experience on this route
    }

    // Calculate geographic proximity
    // In Africa, we use major cities as waypoints, not exact GPS
    const routeMatch = await this.calculateGeographicMatch(shipment, transporter);

    if (routeMatch.exactMatch) {
      return 80; // Good match - same cities
    }

    if (routeMatch.distanceKm < 50) {
      return 70; // Acceptable match - close deviation
    }

    if (routeMatch.distanceKm < 100) {
      return 50; // Fair match - moderate deviation
    }

    if (routeMatch.distanceKm < 200) {
      return 30; // Weak match - significant deviation
    }

    return 10; // Poor match - but not impossible
  }

  /**
   * Check if this is a known return route
   * 
   * Logic: If transporter frequently does A→B, they need B→A returns
   */
  async isKnownReturnRoute(transporterId, origin, destination) {
    const query = `
      SELECT COUNT(*) as trip_count
      FROM shipments s
      JOIN matches m ON s.id = m.shipment_id
      WHERE m.transporter_id = $1
        AND m.status IN ('completed', 'in_transit')
        AND s.origin = $2  -- They go FROM destination
        AND s.destination = $3  -- TO origin
        AND s.created_at > NOW() - INTERVAL '90 days'
    `;

    const result = await this.db.query(query, [
      transporterId,
      destination,  // Note: reversed
      origin
    ]);

    return result.rows[0].trip_count >= 2; // Done this route 2+ times in 90 days
  }

  /**
   * Geographic matching using Malawi's road network
   * 
   * African Reality:
   * - GPS coordinates are often inaccurate or missing
   * - People think in cities/towns, not lat/lng
   * - Major routes: M1, M5, M18 highways
   */
  async calculateGeographicMatch(shipment, transporter) {
    // If both origin and destination match exactly (city names)
    const exactMatch = await this.checkExactCityMatch(
      shipment.origin,
      shipment.destination,
      transporter
    );

    if (exactMatch) {
      return { exactMatch: true, distanceKm: 0 };
    }

    // Calculate distance using GPS if available
    if (shipment.origin_geom && shipment.destination_geom) {
      // Use PostGIS for accurate distance calculation
      const query = `
        SELECT 
          ST_Distance(
            $1::geography,
            $2::geography
          ) / 1000 as distance_km
      `;

      const result = await this.db.query(query, [
        shipment.origin_geom,
        shipment.destination_geom
      ]);

      return {
        exactMatch: false,
        distanceKm: result.rows[0].distance_km
      };
    }

    // Fallback: Use predefined city-to-city distances
    const distanceKm = this.getCityDistance(shipment.origin, shipment.destination);

    return { exactMatch: false, distanceKm };
  }

  /**
   * Predefined distances between major Malawian cities
   * (More reliable than GPS in areas with poor connectivity)
   */
  getCityDistance(origin, destination) {
    const distances = {
      'Lilongwe-Blantyre': 320,
      'Blantyre-Lilongwe': 320,
      'Lilongwe-Mzuzu': 350,
      'Mzuzu-Lilongwe': 350,
      'Blantyre-Zomba': 65,
      'Zomba-Blantyre': 65,
      'Lilongwe-Salima': 100,
      'Salima-Lilongwe': 100,
      'Blantyre-Mangochi': 160,
      'Mangochi-Blantyre': 160,
      'Mzuzu-Nkhata Bay': 50,
      'Nkhata Bay-Mzuzu': 50
    };

    const key = `${origin}-${destination}`;
    return distances[key] || 500; // Default: assume far if unknown
  }

  /**
   * Capacity matching - Can the vehicle handle the load?
   * 
   * African Reality:
   * - Trucks are often overloaded (cultural norm)
   * - Vehicle capacity ratings may be outdated
   * - Safety margin needed for poor road conditions
   * - Multiple small loads can combine
   */
  calculateCapacityScore(shipmentWeight, vehicleCapacity) {
    const utilizationPercent = (shipmentWeight / vehicleCapacity) * 100;

    if (utilizationPercent >= 80 && utilizationPercent <= 100) {
      return 100; // Perfect - near full capacity
    }

    if (utilizationPercent >= 60 && utilizationPercent < 80) {
      return 90; // Good - decent utilization
    }

    if (utilizationPercent >= 40 && utilizationPercent < 60) {
      return 70; // Fair - under-utilized
    }

    if (utilizationPercent >= 20 && utilizationPercent < 40) {
      return 50; // Poor - very under-utilized
    }

    if (utilizationPercent < 20) {
      return 30; // Very poor - wasteful
    }

    if (utilizationPercent > 100 && utilizationPercent <= 110) {
      return 60; // Slight overload - common in Africa
    }

    if (utilizationPercent > 110) {
      return 20; // Dangerous overload - risky
    }

    return 50; // Default
  }

  /**
   * Timing match - Can pickup happen when needed?
   * 
   * African Reality:
   * - "Tomorrow morning" is more common than "8:00 AM sharp"
   * - Flexibility is expected (±2 days is normal)
   * - Rainy season affects timing (October-March)
   * - Market days create spikes (Saturday is busiest)
   */
  async calculateTimingScore(shipment, transporter) {
    const departureDate = new Date(shipment.departure_date);
    const today = new Date();
    const daysUntilDeparture = Math.ceil(
      (departureDate - today) / (1000 * 60 * 60 * 24)
    );

    // Check if transporter has a conflicting trip
    const hasConflict = await this.hasScheduleConflict(
      transporter.user_id,
      departureDate
    );

    if (hasConflict) {
      return 20; // Has another shipment same day
    }

    // Scoring based on timing
    if (daysUntilDeparture === 0) {
      return 100; // Today - urgent
    }

    if (daysUntilDeparture === 1) {
      return 95; // Tomorrow - very soon
    }

    if (daysUntilDeparture >= 2 && daysUntilDeparture <= 3) {
      return 85; // 2-3 days - good planning window
    }

    if (daysUntilDeparture >= 4 && daysUntilDeparture <= 7) {
      return 70; // Week ahead - plenty of time
    }

    if (daysUntilDeparture > 7 && daysUntilDeparture <= 14) {
      return 50; // 1-2 weeks - far out
    }

    return 30; // More than 2 weeks - too far in advance
  }

  async hasScheduleConflict(transporterId, date) {
    const query = `
      SELECT COUNT(*) as conflict_count
      FROM shipments s
      JOIN matches m ON s.id = m.shipment_id
      WHERE m.transporter_id = $1
        AND m.status IN ('accepted', 'in_transit')
        AND s.departure_date = $2
    `;

    const result = await this.db.query(query, [transporterId, date]);
    return result.rows[0].conflict_count > 0;
  }

  /**
   * Reputation score - Can we trust this transporter?
   * 
   * African Reality:
   * - Trust is earned slowly, lost quickly
   * - Ratings are sparse initially (cold start problem)
   * - Verification status matters (union membership, etc.)
   * - Completion rate more important than star ratings
   */
  calculateReputationScore(transporter) {
    let score = 0;

    // 1. Verification status (40 points)
    if (transporter.verified) {
      score += 40;
    } else {
      score += 10; // Unverified but not blocked
    }

    // 2. Rating average (40 points)
    if (transporter.rating_count >= 5) {
      // Has enough ratings to be reliable
      const ratingScore = (transporter.rating_average / 5) * 40;
      score += ratingScore;
    } else if (transporter.rating_count > 0) {
      // Has some ratings but not enough
      const ratingScore = (transporter.rating_average / 5) * 30;
      score += ratingScore;
    } else {
      // No ratings - neutral
      score += 20; // Benefit of the doubt
    }

    // 3. Activity recency (20 points)
    const daysSinceActive = Math.ceil(
      (new Date() - new Date(transporter.last_active_at)) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceActive <= 7) {
      score += 20; // Very active
    } else if (daysSinceActive <= 30) {
      score += 15; // Active recently
    } else {
      score += 5; // Inactive
    }

    return Math.min(score, 100);
  }

  /**
   * Experience score - Has the transporter proven themselves?
   * 
   * Factors:
   * - Total completed trips
   * - Trips on this specific route
   * - Account age
   * - Dispute history
   */
  calculateExperienceScore(transporter) {
    let score = 0;

    // Route-specific experience (50 points)
    if (transporter.route_experience >= 10) {
      score += 50; // Expert on this route
    } else if (transporter.route_experience >= 5) {
      score += 40;
    } else if (transporter.route_experience >= 2) {
      score += 30;
    } else if (transporter.route_experience === 1) {
      score += 20;
    } else {
      score += 10; // Never done this route
    }

    // General completion count (30 points) - fetched separately
    // This is simplified; in production, fetch from DB

    // Account age (20 points) - older accounts are more trustworthy
    // This is simplified; in production, calculate from created_at

    score += 25; // Placeholder for general experience

    return Math.min(score, 100);
  }

  /**
   * Create match record in database
   */
  async createMatch(shipment, transporter, score) {
    const match = await this.db.matches.create({
      shipment_id: shipment.id,
      transporter_id: transporter.user_id,
      vehicle_id: transporter.vehicle_id,
      match_score: score,
      match_algorithm_version: 'v1.0',
      status: 'pending',
      matched_at: new Date()
    });

    // Update shipment status if this is first match
    await this.db.shipments.update(shipment.id, {
      status: 'matched',
      matched_at: new Date()
    });

    return match;
  }

  /**
   * Notify transporters about new matches
   * 
   * Strategy:
   * - Top 3 matches: SMS + WhatsApp immediately
   * - Matches 4-10: WhatsApp only
   * - All matches: Available in USSD menu
   */
  async notifyTransporters(matches) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const priority = i < 3; // Top 3 are priority

      if (priority) {
        // Send SMS
        await this.notification.sendSMS(
          match.transporter.phone,
          `Matola: New load ${match.shipment.origin}→${match.shipment.destination}, ${match.shipment.weight_kg}kg, MK${match.shipment.price_mwk}. Check *384*628652# or WhatsApp.`
        );
      }

      // Send WhatsApp to all
      await this.notification.sendWhatsApp(
        match.transporter.phone,
        'match_found',
        [
          match.transporter.name,
          match.shipment.origin,
          match.shipment.destination,
          `${match.shipment.weight_kg}kg`,
          `MK ${match.shipment.price_mwk.toLocaleString()}`
        ]
      );

      // Mark as notified
      await this.db.matches.update(match.id, {
        notified_at: new Date()
      });
    }
  }

  /**
   * Background job to match pending shipments
   * Runs every 15 minutes
   */
  async matchPendingShipments() {
    const pendingShipments = await this.db.shipments.findAll({
      where: { status: 'pending' },
      limit: 100
    });

    for (const shipment of pendingShipments) {
      try {
        await this.findMatches(shipment.id);
      } catch (error) {
        console.error(`Error matching shipment ${shipment.id}:`, error);
      }
    }
  }
}

module.exports = new MatchingService();
```

### 5.2.2 Transporter Search (Reverse Matching)

```javascript
/**
 * When transporter searches for loads
 * (Reverse of the main matching algorithm)
 */
class TransporterSearchService {
  async findLoadsForTransporter(transporterId, filters = {}) {
    const transporter = await this.db.users.findById(transporterId);
    const vehicles = await this.db.vehicles.findAll({
      where: { user_id: transporterId, status: 'active' }
    });

    if (vehicles.length === 0) {
      return { loads: [], message: 'Please register a vehicle first' };
    }

    // Find shipments that match transporter's capabilities
    let query = `
      SELECT 
        s.*,
        u.name as shipper_name,
        u.phone as shipper_phone,
        u.rating_average as shipper_rating,
        
        -- Calculate match score (similar to main algorithm)
        (
          CASE
            -- Same route they've done before
            WHEN EXISTS (
              SELECT 1 FROM shipments s2
              JOIN matches m2 ON s2.id = m2.shipment_id
              WHERE m2.transporter_id = $1
                AND m2.status = 'completed'
                AND s2.origin = s.origin
                AND s2.destination = s.destination
            ) THEN 90
            
            -- Good capacity utilization
            WHEN s.weight_kg >= $2 * 0.8 THEN 85
            WHEN s.weight_kg >= $2 * 0.6 THEN 75
            
            ELSE 60
          END
        ) as match_score
        
      FROM shipments s
      JOIN users u ON s.shipper_id = u.id
      WHERE s.status = 'pending'
        AND s.weight_kg <= $2  -- Can carry
        AND s.departure_date >= CURRENT_DATE
        AND s.departure_date <= CURRENT_DATE + INTERVAL '7 days'  -- Next week
    `;

    const params = [transporterId, vehicles[0].capacity_kg];

    // Apply filters
    if (filters.origin) {
      query += ` AND s.origin ILIKE $${params.length + 1}`;
      params.push(`%${filters.origin}%`);
    }

    if (filters.destination) {
      query += ` AND s.destination ILIKE $${params.length + 1}`;
      params.push(`%${filters.destination}%`);
    }

    if (filters.min_price) {
      query += ` AND s.price_mwk >= $${params.length + 1}`;
      params.push(filters.min_price);
    }

    query += ` ORDER BY match_score DESC, s.created_at DESC LIMIT 50`;

    const result = await this.db.query(query, params);

    return {
      loads: result.rows,
      vehicle: vehicles[0],
      filters_applied: filters
    };
  }
}
```

---

## 5.3 Price Intelligence & Recommendations

**African Pricing Reality:**
- Prices are negotiated, not fixed
- Market rates vary by season (harvest time is cheaper)
- Fuel prices affect everything (frequent changes)
- Road conditions impact price (rainy season premium)
- Cargo type matters (fragile = higher price)

```javascript
// src/services/pricingService.js

class PricingService {
  /**
   * Suggest price range based on historical data
   */
  async suggestPrice(origin, destination, weight_kg, cargo_type) {
    // 1. Get historical prices for this route
    const historicalQuery = `
      SELECT 
        AVG(s.price_mwk) as avg_price,
        MIN(s.price_mwk) as min_price,
        MAX(s.price_mwk) as max_price,
        STDDEV(s.price_mwk) as price_stddev,
        COUNT(*) as sample_size,
        
        -- Price per kg
        AVG(s.price_mwk / s.weight_kg) as avg_price_per_kg
        
      FROM shipments s
      JOIN matches m ON s.id = m.shipment_id
      WHERE s.origin = $1
        AND s.destination = $2
        AND s.cargo_type = $3
        AND m.status IN ('completed', 'accepted')
        AND s.created_at > NOW() - INTERVAL '90 days'  -- Recent prices only
    `;

    const historical = await this.db.query(historicalQuery, [
      origin,
      destination,
      cargo_type
    ]);

    const data = historical.rows[0];

    if (!data || data.sample_size < 3) {
      // Not enough data - use baseline calculation
      return this.calculateBaselinePrice(origin, destination, weight_kg, cargo_type);
    }

    // 2. Calculate suggested price for this shipment
    const pricePerKg = data.avg_price_per_kg;
    const estimatedPrice = pricePerKg * weight_kg;

    // 3. Apply seasonal adjustments
    const seasonalMultiplier = this.getSeasonalMultiplier();
    const adjustedPrice = estimatedPrice * seasonalMultiplier;

    // 4. Return recommendation range
    return {
      recommended: Math.round(adjustedPrice),
      min: Math.round(adjustedPrice * 0.85), // 15% below
      max: Math.round(adjustedPrice * 1.15), // 15% above
      market_data: {
        avg_price: data.avg_price,
        sample_size: data.sample_size,
        confidence: data.sample_size >= 10 ? 'high' : 'medium'
      },
      message: `Based on ${data.sample_size} similar shipments in the last 90 days`
    };
  }

  /**
   * Baseline price calculation when no historical data
   * 
   * Formula: Base rate + (Distance × Rate per km) + (Weight factor)
   */
  calculateBaselinePrice(origin, destination, weight_kg, cargo_type) {
    const distance = this.getRouteDistance(origin, destination);

    // Base rates (MWK)
    const baseRate = 5000; // Minimum for any shipment
    const ratePerKm = 80; // MWK per km
    const ratePerKg = 15; // MWK per kg

    // Cargo type multipliers
    const cargoMultipliers = {
      food: 1.0,
      building_materials: 1.1,
      furniture: 1.15,
      livestock: 1.2, // Higher risk
      electronics: 1.3, // Fragile
      other: 1.0
    };

    const multiplier = cargoMultipliers[cargo_type] || 1.0;

    const basePrice = (baseRate + (distance * ratePerKm) + (weight_kg * ratePerKg)) * multiplier;

    return {
      recommended: Math.round(basePrice),
      min: Math.round(basePrice * 0.8),
      max: Math.round(basePrice * 1.2),
      market_data: null,
      message: 'Estimated price (no historical data available)'
    };
  }

  /**
   * Seasonal price adjustments
   * 
   * African Reality:
   * - Harvest season (April-June): Lower prices, high supply
   * - Planting season (November-December): Higher prices
   * - Rainy season (December-March): Higher prices (poor roads)
   */
  getSeasonalMultiplier() {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 4 && month <= 6) {
      return 0.9; // Harvest season - 10% cheaper
    }

    if (month >= 12 || month <= 3) {
      return 1.15; // Rainy season - 15% premium
    }

    if (month >= 11 && month <= 12) {
      return 1.1; // Planting season - 10% premium
    }

    return 1.0; // Normal pricing
  }

  /**
   * Route distance lookup (km)
   */
  getRouteDistance(origin, destination) {
    const routes = {
      'Lilongwe-Blantyre': 320,
      'Blantyre-Lilongwe': 320,
      'Lilongwe-Mzuzu': 350,
      'Mzuzu-Lilongwe': 350,
      'Blantyre-Zomba': 65,
      'Zomba-Blantyre': 65,
      'Lilongwe-Salima': 100,
      'Mzuzu-Nkhata Bay': 50
    };

    const key = `${origin}-${destination}`;
    return routes[key] || this.estimateDistanceFromGPS(origin, destination) || 300;
  }
}
```

---

## 5.4 Matching Dashboard for Operations Team

**Why Manual Oversight Matters:**
- Algorithms can't detect fraud (fake listings, scams)
- Cultural nuances require human judgment
- High-value shipments need extra verification
- Dispute prevention through early intervention

```javascript
// src/controllers/adminMatchingController.js

class AdminMatchingController {
  /*** Admin dashboard: View pending matches needing review
   */
  async getPendingReviews(req, res) {
    const query = `
      SELECT 
        m.id,
        m.match_score,
        m.status,
        m.matched_at,
        
        -- Shipment details
        s.reference as shipment_ref,
        s.origin,
        s.destination,
        s.weight_kg,
        s.price_mwk,
        s.cargo_type,
        
        -- Shipper details
        shipper.name as shipper_name,
        shipper.phone as shipper_phone,
        shipper.rating_average as shipper_rating,
        shipper.verified as shipper_verified,
        
        -- Transporter details
        trans.name as transporter_name,
        trans.phone as transporter_phone,
        trans.rating_average as transporter_rating,
        trans.verified as transporter_verified,
        
        -- Vehicle details
        v.registration,
        v.type as vehicle_type,
        v.capacity_kg,
        
        -- Flags
        CASE 
          WHEN s.price_mwk > 500000 THEN true  -- High value
          WHEN NOT trans.verified THEN true     -- Unverified transporter
          WHEN trans.rating_count < 5 THEN true -- New transporter
          ELSE false
        END as needs_review
        
      FROM matches m
      JOIN shipments s ON m.shipment_id = s.id
      JOIN users shipper ON s.shipper_id = shipper.id
      JOIN users trans ON m.transporter_id = trans.id
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.status = 'pending'
        AND m.match_score >= 30
      ORDER BY 
        needs_review DESC,
        m.match_score DESC,
        m.matched_at ASC
      LIMIT 100
    `;

    const matches = await this.db.query(query);

    res.json({
      pending_reviews: matches.rows,
      review_criteria: {
        high_value_threshold: 500000,
        min_transporter_ratings: 5,
        verification_required: true
      }
    });
  }

  /**
   * Admin action: Approve or reject match
   */
  async reviewMatch(req, res) {
    const { matchId, action, notes } = req.body;
    // action: 'approve' | 'reject' | 'flag'

    const match = await this.db.matches.findById(matchId);

    if (action === 'approve') {
      await this.db.matches.update(matchId, {
        status: 'approved',
        metadata: { ...match.metadata, admin_approved: true, admin_notes: notes }
      });

      // Notify both parties
      await this.notificationService.sendMatchApproval(match);
    }

    if (action === 'reject') {
      await this.db.matches.update(matchId, {
        status: 'rejected',
        rejection_reason: notes
      });

      // Find alternative matches
      await this.matchingService.findMatches(match.shipment_id, { excludeTransporters: [match.transporter_id] });
    }

    res.json({ success: true, action });
  }
}
```

---

This matching algorithm is designed for **African realities**: prioritizing trust, flexibility, and human oversight over pure algorithmic optimization. It balances automation (for efficiency) with manual control (for safety and cultural fit).

# 6. TRUST & VERIFICATION SYSTEMS

In Africa, **trust is earned through relationships, not technology**. A beautiful app means nothing if users don't trust the people on the other end. This section details how Matola builds, maintains, and repairs trust in an environment where:

- Most users have never used a logistics platform
- Cash transactions dominate (high fraud risk)
- Legal recourse is slow and expensive
- Personal reputation matters more than terms of service
- Word-of-mouth can make or break the business

---

## 6.1 Multi-Layered Trust Framework

```yaml
Trust Pyramid (Bottom to Top):

Level 1: BASIC VERIFICATION (Entry Requirement)
  - Phone number verification (OTP)
  - Real name collection
  - Primary location/area
  - User agreement acceptance
  
Level 2: IDENTITY VERIFICATION (Standard Users)
  - National ID photo upload
  - Selfie verification (match to ID)
  - Address confirmation
  - Business registration (for companies)
  
Level 3: PROFESSIONAL VERIFICATION (Transporters)
  - Driver's license verification
  - Vehicle registration documents
  - Insurance certificate
  - Road worthiness certificate
  - Vehicle photos (4 angles)
  
Level 4: COMMUNITY VERIFICATION (Trusted Partners)
  - Transport union membership
  - NASFAM membership (farmers)
  - Business association membership
  - Reference from existing verified users
  
Level 5: PLATFORM VERIFICATION (Elite Status)
  - 50+ completed trips
  - 4.5+ star rating
  - Zero disputes
  - Background check passed
  - In-person verification by field agent

Visual Trust Indicators:
  ✓ Phone Verified (green checkmark)
  ⭐ ID Verified (gold star)
  🚛 Professional Driver (truck badge)
  🏆 Union Member (union badge)
  💎 Platform Verified (diamond badge)
```

---

## 6.2 Phone Number Verification (Level 1)

**Why This Matters:**
- In Malawi, phone numbers are identity
- People change phones but keep numbers (transfer SIM)
- Mobile money is tied to phone number
- Easy to verify, hard to fake at scale

```javascript
// src/services/verificationService.js

class VerificationService {
  constructor() {
    this.sms = require('./smsService');
    this.redis = require('../redis');
    this.db = require('../db');
  }

  /**
   * Send OTP to phone number
   * 
   * Security measures:
   * - Rate limit: 3 OTPs per phone per hour
   * - Rate limit: 10 OTPs per IP per hour
   * - OTP expires in 5 minutes
   * - OTP is 6 digits (easier to read on SMS)
   * - Each OTP can only be used once
   */
  async sendOTP(phone, ip, language = 'en') {
    // 1. Normalize phone number
    const normalizedPhone = this.normalizePhone(phone);

    // 2. Check rate limits
    await this.checkRateLimits(normalizedPhone, ip);

    // 3. Generate OTP
    const otp = this.generateOTP();

    // 4. Store OTP in Redis
    const otpKey = `otp:${normalizedPhone}`;
    await this.redis.setex(otpKey, 300, otp); // 5 minutes

    // 5. Track attempts
    const attemptKey = `otp:attempts:${normalizedPhone}`;
    await this.redis.incr(attemptKey);
    await this.redis.expire(attemptKey, 3600); // 1 hour

    // 6. Send SMS
    await this.sms.sendOTP(normalizedPhone, otp, language);

    // 7. Log for audit
    await this.db.audit_logs.create({
      action: 'otp_sent',
      entity: 'phone_verification',
      entity_id: normalizedPhone,
      ip_address: ip,
      timestamp: new Date()
    });

    return {
      success: true,
      message: language === 'ny' 
        ? 'Nambala yotsimikizira yatumizidwa ku foni yanu'
        : 'Verification code sent to your phone',
      expires_in: 300
    };
  }

  async checkRateLimits(phone, ip) {
    // Phone limit: 3 per hour
    const phoneAttempts = await this.redis.get(`otp:attempts:${phone}`);
    if (phoneAttempts && parseInt(phoneAttempts) >= 3) {
      throw new Error('Too many attempts. Please try again in 1 hour.');
    }

    // IP limit: 10 per hour
    const ipAttempts = await this.redis.get(`otp:attempts:ip:${ip}`);
    if (ipAttempts && parseInt(ipAttempts) >= 10) {
      throw new Error('Too many requests from this network. Please try again later.');
    }
  }

  generateOTP() {
    // 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Verify OTP
   * 
   * Security:
   * - 3 attempts max per OTP
   * - Case-insensitive comparison
   * - Constant-time comparison (prevent timing attacks)
   * - OTP deleted after successful verification
   */
  async verifyOTP(phone, otp, ip) {
    const normalizedPhone = this.normalizePhone(phone);
    const otpKey = `otp:${normalizedPhone}`;

    // 1. Check if OTP exists
    const storedOTP = await this.redis.get(otpKey);
    if (!storedOTP) {
      throw new Error('OTP expired or not found. Please request a new one.');
    }

    // 2. Check verification attempts
    const attemptsKey = `otp:verify:${normalizedPhone}`;
    const attempts = await this.redis.get(attemptsKey) || 0;
    if (parseInt(attempts) >= 3) {
      await this.redis.del(otpKey); // Invalidate OTP
      throw new Error('Too many incorrect attempts. Please request a new OTP.');
    }

    // 3. Compare OTP (constant-time to prevent timing attacks)
    const isValid = this.constantTimeCompare(otp.trim(), storedOTP);

    if (!isValid) {
      // Increment attempts
      await this.redis.incr(attemptsKey);
      await this.redis.expire(attemptsKey, 300);
      
      throw new Error(`Incorrect code. ${3 - parseInt(attempts) - 1} attempts remaining.`);
    }

    // 4. OTP is valid - delete it (single use)
    await this.redis.del(otpKey);
    await this.redis.del(attemptsKey);

    // 5. Mark phone as verified
    await this.markPhoneVerified(normalizedPhone);

    // 6. Log successful verification
    await this.db.audit_logs.create({
      action: 'phone_verified',
      entity: 'phone_verification',
      entity_id: normalizedPhone,
      ip_address: ip,
      timestamp: new Date()
    });

    return {
      success: true,
      phone: normalizedPhone,
      verified_at: new Date()
    };
  }

  constantTimeCompare(a, b) {
    // Prevent timing attacks by comparing all characters
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  async markPhoneVerified(phone) {
    await this.redis.set(`verified:phone:${phone}`, '1', 'EX', 86400 * 30); // 30 days cache
  }

  normalizePhone(phone) {
    // Convert to +265XXXXXXXXX format
    let normalized = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    if (normalized.startsWith('0')) {
      normalized = '+265' + normalized.substring(1);
    } else if (normalized.startsWith('265')) {
      normalized = '+' + normalized;
    } else if (!normalized.startsWith('+')) {
      normalized = '+265' + normalized;
    }

    // Validate Malawi phone format
    if (!/^\+265\d{9}$/.test(normalized)) {
      throw new Error('Invalid Malawi phone number. Format: +265 99 123 4567');
    }

    return normalized;
  }
}
```

---

## 6.3 Identity Verification (Level 2)

**Malawi National ID Reality:**
- Format: XX-XXXXX-X-XXXX (e.g., BT-12345-6-1234)
- Not everyone has one (especially rural areas)
- Common alternative: Voter registration card
- Birth certificates for age verification

```javascript
// src/services/identityVerificationService.js

class IdentityVerificationService {
  constructor() {
    this.s3 = require('./s3Service');
    this.ml = require('./mlVerificationService'); // ML for ID verification
    this.db = require('../db');
  }

  /**
   * Upload and verify National ID
   * 
   * Process:
   * 1. User uploads photo of ID card
   * 2. User takes selfie
   * 3. ML checks if ID is legible and valid format
   * 4. ML compares selfie to ID photo (face match)
   * 5. Manual review by support team (if ML confidence low)
   */
  async verifyIdentity(userId, idPhotoUrl, selfieUrl) {
    const user = await this.db.users.findById(userId);

    // 1. Download images
    const idImage = await this.s3.downloadImage(idPhotoUrl);
    const selfieImage = await this.s3.downloadImage(selfieUrl);

    // 2. Extract ID information using OCR
    const idData = await this.ml.extractIDData(idImage);

    if (!idData.success) {
      return {
        success: false,
        status: 'rejected',
        reason: 'ID card image unclear. Please retake photo in good lighting.'
      };
    }

    // 3. Validate ID format
    const isValidFormat = this.validateMalawiIDFormat(idData.id_number);
    if (!isValidFormat) {
      return {
        success: false,
        status: 'rejected',
        reason: 'Invalid ID number format. Please ensure full ID is visible.'
      };
    }

    // 4. Face matching
    const faceMatch = await this.ml.compareFaces(idImage, selfieImage);

    if (faceMatch.confidence < 70) {
      // Low confidence - queue for manual review
      return await this.queueManualReview(userId, idData, faceMatch, 'low_confidence');
    }

    if (faceMatch.confidence >= 70 && faceMatch.confidence < 85) {
      // Medium confidence - auto-approve with flag
      return await this.approveWithFlag(userId, idData, 'medium_confidence');
    }

    // 5. High confidence - auto-approve
    return await this.approveIdentity(userId, idData);
  }

  validateMalawiIDFormat(idNumber) {
    // Format: XX-XXXXX-X-XXXX
    // Example: BT-12345-6-1234
    const regex = /^[A-Z]{2}-\d{5}-\d-\d{4}$/;
    return regex.test(idNumber);
  }

  async approveIdentity(userId, idData) {
    await this.db.users.update(userId, {
      verified: true,
      verification_method: 'national_id',
      verification_date: new Date(),
      metadata: {
        id_number: idData.id_number,
        id_name: idData.name,
        id_dob: idData.date_of_birth
      }
    });

    // Send confirmation
    await this.notificationService.sendVerificationSuccess(userId);

    return {
      success: true,
      status: 'approved',
      verified_at: new Date()
    };
  }

  async queueManualReview(userId, idData, faceMatch, reason) {
    await this.db.verification_queue.create({
      user_id: userId,
      type: 'identity',
      status: 'pending_review',
      data: {
        id_data: idData,
        face_match_confidence: faceMatch.confidence,
        reason
      },
      created_at: new Date()
    });

    return {
      success: true,
      status: 'pending_review',
      message: 'Your documents are under review. We\'ll notify you within 24 hours.',
      estimated_review_time: '24 hours'
    };
  }

  /**
   * Manual review dashboard for support team
   */
  async getReviewQueue() {
    const query = `
      SELECT 
        vq.id,
        vq.user_id,
        vq.type,
        vq.data,
        vq.created_at,
        
        u.name,
        u.phone,
        u.role,
        
        -- Time waiting
        EXTRACT(EPOCH FROM (NOW() - vq.created_at))/3600 as hours_waiting
        
      FROM verification_queue vq
      JOIN users u ON vq.user_id = u.id
      WHERE vq.status = 'pending_review'
      ORDER BY vq.created_at ASC
      LIMIT 50
    `;

    const queue = await this.db.query(query);
    return queue.rows;
  }

  /**
   * Support agent approves/rejects verification
   */
  async manualReview(queueId, agentId, decision, notes) {
    const item = await this.db.verification_queue.findById(queueId);

    if (decision === 'approve') {
      await this.approveIdentity(item.user_id, item.data.id_data);
    } else {
      await this.rejectVerification(item.user_id, notes);
    }

    // Update queue item
    await this.db.verification_queue.update(queueId, {
      status: decision === 'approve' ? 'approved' : 'rejected',
      reviewed_by: agentId,
      reviewed_at: new Date(),
      notes
    });

    return { success: true, decision };
  }
}
```

---

## 6.4 Transport Union Verification (Level 4)

**Why Union Verification is Gold Standard:**
- Unions know their members personally
- Self-regulation: unions don't vouch for bad actors
- Community accountability (lose reputation = lose membership)
- Instant credibility with other users

**Major Transport Unions in Malawi:**
- Malawi Transport Association (MTA)
- Commercial Drivers Association (CDA)
- Minibus Operators Association (MOA)
- National Small Scale Farmers Association (NASFAM) - for farmer-shippers

```javascript
// src/services/unionVerificationService.js

class UnionVerificationService {
  constructor() {
    this.db = require('../db');
  }

  /**
   * Register transport union as verification partner
   */
  async registerUnion(unionData) {
    const union = await this.db.unions.create({
      name: unionData.name,
      abbreviation: unionData.abbreviation,
      registration_number: unionData.registration_number,
      contact_person: unionData.contact_person,
      contact_phone: unionData.contact_phone,
      contact_email: unionData.contact_email,
      verification_authority: true,
      status: 'active'
    });

    // Assign API key for union to verify members
    const apiKey = this.generateUnionAPIKey(union.id);
    await this.db.unions.update(union.id, { api_key: apiKey });

    return { union, api_key: apiKey };
  }

  /**
   * Union verifies their member
   * 
   * Flow:
   * 1. Transporter provides union membership number to Matola
   * 2. Matola sends verification request to union
   * 3. Union confirms via API or manual process
   * 4. Matola marks user as union-verified
   */
  async verifyUnionMember(userId, unionId, membershipNumber) {
    const user = await this.db.users.findById(userId);
    const union = await this.db.unions.findById(unionId);

    // Create verification request
    const request = await this.db.union_verifications.create({
      user_id: userId,
      union_id: unionId,
      membership_number: membershipNumber,
      status: 'pending',
      requested_at: new Date()
    });

    // Send notification to union contact
    await this.notificationService.sendUnionVerificationRequest(
      union.contact_phone,
      {
        user_name: user.name,
        user_phone: user.phone,
        membership_number: membershipNumber,
        verification_link: `https://matola.mw/union/verify/${request.id}`
      }
    );

    return {
      success: true,
      status: 'pending',
      message: `Verification request sent to ${union.name}. You'll be notified once approved.`
    };
  }

  /**
   * Union confirms member via API
   */
  async confirmMember(requestId, unionApiKey, confirmationData) {
    // Verify union API key
    const union = await this.db.unions.findOne({ where: { api_key: unionApiKey } });
    if (!union) {
      throw new Error('Invalid API key');
    }

    const request = await this.db.union_verifications.findById(requestId);

    // Update verification
    await this.db.union_verifications.update(requestId, {
      status: 'approved',
      verified_at: new Date(),
      verified_by: confirmationData.verified_by,
      notes: confirmationData.notes
    });

    // Update user record
    await this.db.users.update(request.user_id, {
      verified: true,
      verification_method: 'union',
      verification_date: new Date(),
      metadata: {
        union_id: union.id,
        union_name: union.name,
        membership_number: request.membership_number
      }
    });

    // Send notification to user
    await this.notificationService.sendVerificationSuccess(request.user_id);

    return { success: true, verified: true };
  }

  /**
   * Bulk upload of union members
   * 
   * Unions can provide CSV of verified members:
   * name, phone, membership_number, vehicle_registration
   */
  async bulkVerifyMembers(unionId, csvData, uploadedBy) {
    const union = await this.db.unions.findById(unionId);
    const members = this.parseCSV(csvData);

    const results = {
      total: members.length,
      verified: 0,
      existing: 0,
      errors: []
    };

    for (const member of members) {
      try {
        // Check if user exists
        let user = await this.db.users.findOne({ where: { phone: member.phone } });

        if (!user) {
          // Create new user account
          user = await this.db.users.create({
            phone: member.phone,
            name: member.name,
            role: 'transporter',
            verified: true,
            verification_method: 'union_bulk',
            verification_date: new Date(),
            metadata: {
              union_id: union.id,
              union_name: union.name,
              membership_number: member.membership_number
            }
          });

          results.verified++;
        } else {
          // Update existing user
          await this.db.users.update(user.id, {
            verified: true,
            verification_method: 'union_bulk',
            verification_date: new Date(),
            metadata: {
              ...user.metadata,
              union_id: union.id,
              union_name: union.name,
              membership_number: member.membership_number
            }
          });

          results.existing++;
        }

        // Add vehicle if provided
        if (member.vehicle_registration) {
          await this.db.vehicles.create({
            user_id: user.id,
            registration: member.vehicle_registration,
            status: 'active',
            verified: true
          });
        }

        // Send welcome SMS
        await this.sms.send(
          member.phone,
          `Welcome to Matola! You've been verified by ${union.name}. Dial *384*628652# to start.`
        );

      } catch (error) {
        results.errors.push({
          member: member.name,
          phone: member.phone,
          error: error.message
        });
      }
    }

    // Log bulk upload
    await this.db.audit_logs.create({
      action: 'union_bulk_verification',
      entity: 'union',
      entity_id: unionId,
      changes: results,
      user_id: uploadedBy
    });

    return results;
  }

  parseCSV(csvData) {
    // Simple CSV parser
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const member = {};
      headers.forEach((header, index) => {
        member[header] = values[index];
      });
      return member;
    });
  }

  generateUnionAPIKey(unionId) {
    const crypto = require('crypto');
    return `union_${unionId}_${crypto.randomBytes(32).toString('hex')}`;
  }
}
```

---

## 6.5 Rating & Reputation System

**African Cultural Context:**
- Direct criticism is culturally uncomfortable ("It's impolite to complain")
- People prefer private resolution over public shaming
- Star ratings feel impersonal
- Specific feedback is more actionable

**Matola's Approach: Balanced Rating System**

```javascript
// src/services/ratingService.js

class RatingService {
  constructor() {
    this.db = require('../db');
  }

  /**
   * Request rating after shipment completion
   * 
   * Timing:
   * - 2 hours after delivery (give time to unpack/inspect)
   * - Reminder after 24 hours if not rated
   * - Auto-rate 4 stars after 7 days (assume satisfied)
   */
  async requestRating(shipmentId) {
    const shipment = await this.db.shipments.findById(shipmentId);
    const match = await this.db.matches.findOne({ where: { shipment_id: shipmentId, status: 'completed' } });

    // Shipper rates transporter
    await this.sendRatingRequest(
      shipment.shipper_id,
      match.transporter_id,
      shipmentId,
      'transporter'
    );

    // Transporter rates shipper
    await this.sendRatingRequest(
      match.transporter_id,
      shipment.shipper_id,
      shipmentId,
      'shipper'
    );
  }

  async sendRatingRequest(raterId, ratedUserId, shipmentId, role) {
    const rater = await this.db.users.findById(raterId);
    const ratedUser = await this.db.users.findById(ratedUserId);

    const message = role === 'transporter'
      ? `How was your experience with driver ${ratedUser.name}? Rate 1-5 stars. Reply via WhatsApp or dial *384*628652#`
      : `How was your experience with shipper ${ratedUser.name}? Rate 1-5 stars via WhatsApp or USSD.`;

    // Send via WhatsApp (preferred)
    await this.whatsapp.sendMessage(rater.phone, message);

    // Also send SMS as backup
    await this.sms.send(rater.phone, message);

    // Create rating reminder
    await this.db.rating_reminders.create({
      shipment_id: shipmentId,
      rater_id: raterId,
      rated_user_id: ratedUserId,
      status: 'pending',
      sent_at: new Date()
    });
  }

  /**
   * Submit rating with detailed feedback
   * 
   * Categories (optional but encouraged):
   * - Punctuality: Was pickup/delivery on time?
   * - Communication: Did they respond quickly?
   * - Condition: Was cargo handled carefully?
   * - Professionalism: Were they respectful?
   */
  async submitRating(raterId, ratedUserId, shipmentId, ratingData) {
    const { 
      rating,  // 1-5 overall
      comment,  // Optional text feedback
      categories  // Optional: { punctuality: 5, communication: 4, ... }
    } = ratingData;

    // Validation
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if already rated
    const existing = await this.db.ratings.findOne({
      where: {
        shipment_id: shipmentId,
        rater_id: raterId,
        rated_user_id: ratedUserId
      }
    });

    if (existing) {
      throw new Error('You have already rated this trip');
    }

    // Create rating
    const newRating = await this.db.ratings.create({
      shipment_id: shipmentId,
      rater_id: raterId,
      rated_user_id: ratedUserId,
      rating,
      comment: this.moderateComment(comment),  // Filter profanity/spam
      categories: categories || {},
      created_at: new Date()
    });

    // Update user's average rating (handled by database trigger)

    // Thank rater
    await this.whatsapp.sendMessage(
      raterId,
      `Thank you for your feedback! Your rating helps improve our community.`
    );

    // Notify rated user (if positive)
    if (rating >= 4) {
      const rater = await this.db.users.findById(raterId);
      await this.whatsapp.sendMessage(
        ratedUserId,
        `Good news! ${rater.name} gave you ${rating} stars ⭐`
      );
    }

    // If negative rating, escalate for review
    if (rating <= 2) {
      await this.escalateNegativeRating(newRating);
    }

    return newRating;
  }

  /**
   * Handle negative ratings proactively
   * 
   * African approach: Private mediation before public punishment
   */
  async escalateNegativeRating(rating) {
    // Notify support team
    await this.notificationService.notifySupport({
      type: 'negative_rating',
      rating_id: rating.id,
      shipment_id: rating.shipment_id,
      rating_score: rating.rating,
      comment: rating.comment
    });

    // Reach out to rated user privately
    const ratedUser = await this.db.users.findById(rating.rated_user_id);
    await this.whatsapp.sendMessage(
      ratedUser.phone,
      `We noticed you received a low rating on your recent trip. Our support team will contact you to understand what happened and help improve. Reply HELP if you'd like to explain your side.`
    );

    // Create support ticket
    await this.db.support_tickets.create({
      user_id: rating.rated_user_id,
      type: 'low_rating',
      priority: 'medium',
      data: {
        rating_id: rating.id,
        shipment_id: rating.shipment_id
      },
      status: 'open'
    });
  }

  /**
   * Moderate comments to remove:
   * - Phone numbers (prevent off-platform contact)
   * - Profanity
   * - Spam/promotional content
   * - Personal attacks
   */
  moderateComment(comment) {
    if (!comment) return null;

    let moderated = comment;

    // Remove phone numbers
    moderated = moderated.replace(/[\+]?[0-9]{9,15}/g, '[removed]');

    // Remove URLs
    moderated = moderated.replace(/https?:\/\/[^\s]+/g, '[removed]');

    // Simple profanity filter (Chichewa and English)
    const profanity = ['idiot', 'stupid', 'opusa', 'mbuli']; // Expand as needed
    profanity.forEach(word => {
      const regex = new RegExp(word, 'gi');
      moderated = moderated.replace(regex, '***');
    });

    return moderated.substring(0, 500); // Max 500 chars
  }

  /**
   * Auto-rate after 7 days of no response
   * 
   * Assumption: If they don't complain, they're satisfied
   * Default: 4 stars (good but not perfect)
   */
  async autoRateStaleShipments() {
    const query = `
      SELECT 
        s.id as shipment_id,
        s.shipper_id,
        m.transporter_id,
        m.id as match_id
      FROM shipments s
      JOIN matches m ON s.id = m.shipment_id
      WHERE s.status = 'delivered'
        AND s.delivered_at < NOW() - INTERVAL '7 days'
        AND NOT EXISTS (
          SELECT 1 FROM ratings r 
          WHERE r.shipment_id = s.id
        )
      LIMIT 100
    `;

    const staleShipments = await this.db.query(query);

    for (const shipment of staleShipments.rows) {
      // Auto-rate shipper → transporter (4 stars)
      await this.db.ratings.create({
        shipment_id: shipment.shipment_id,
        rater_id: shipment.shipper_id,
        rated_user_id: shipment.transporter_id,
        rating: 4,
        comment: 'Auto-rated (no feedback provided)',
        categories: {},
        created_at: new Date(),
        is_auto_rated: true
      });

      // Auto-rate transporter → shipper (4 stars)
      await this.db.ratings.create({
        shipment_id: shipment.shipment_id,
        rater_id: shipment.transporter_id,
        rated_user_id: shipment.shipper_id,
        rating: 4,
        comment: 'Auto-rated (no feedback provided)',
        categories: {},
        created_at: new Date(),
        is_auto_rated: true
      });
    }

    return staleShipments.rows.length;
  }

  /**
   * Display rating summary for users
   */
  async getRatingSummary(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        
        -- Distribution
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star,
        
        -- Category averages
        AVG((categories->>'punctuality')::int) as avg_punctuality,
        AVG((categories->>'communication')::int) as avg_communication,
        AVG((categories->>'condition')::int) as avg_condition,
        AVG((categories->>'professionalism')::int) as avg_professionalism
        
      FROM ratings
      WHERE rated_user_id = $1
    `;

    const summary = await this.db.query(query, [userId]);
    return summary.rows[0];
  }
}
```

---

## 6.6 Dispute Resolution System

**African Dispute Resolution Culture:**
- Mediation preferred over litigation
- Elders/community leaders often mediate
- Face-saving is important (avoid public embarrassment)
- Solutions focus on restoration, not punishment

```javascript
// src/services/disputeService.js

class DisputeService {
  constructor() {
    this.db = require('../db');
  }

  /**
   * Open a dispute
   * 
   * Common dispute types:
   * - Cargo damage
   * - Non-delivery
   * - Wrong items delivered
   * - Overcharging
   * - Rudeness/misconduct
   * - Payment issues
   */
  async openDispute(userId, shipmentId, disputeData) {
    const { type, description, evidence_urls } = disputeData;

    // Create dispute record
    const dispute = await this.db.disputes.create({
      shipment_id: shipmentId,
      initiated_by: userId,
      type,
      description,
      evidence: evidence_urls || [],
      status: 'open',
      severity: this.calculateSeverity(type),
      created_at: new Date()
    });

    // Notify other party
    const shipment = await this.db.shipments.findById(shipmentId);
    const match = await this.db.matches.findOne({ where: { shipment_id: shipmentId } });
    
    const otherParty = userId === shipment.shipper_id 
      ? match.transporter_id 
      : shipment.shipper_id;

    await this.notificationService.sendDisputeNotification(otherParty, dispute);

    // Assign to support team
    await this.assignToSupport(dispute.id);

    // Hold payment if exists
    await this.holdPayment(shipmentId);

    return dispute;
  }

  calculateSeverity(type) {
    const severityMap = {
      cargo_damage: 'high',
      non_delivery: 'critical',
      wrong_items: 'high',
      overcharging: 'medium',
      misconduct: 'medium',
      payment_issue: 'high'
    };

    return severityMap[type] || 'medium';
  }

  /**
   * Support agent handles dispute
   * 
   * Process:
   * 1. Contact both parties separately
   * 2. Gather evidence
   * 3. Attempt mediation
   * 4. Make resolution decision
   * 5. Execute resolution (refund, partial payment, etc.)
   */
  async mediateDispute(disputeId, agentId) {
    const dispute = await this.db.disputes.findById(disputeId);

    // Update status
    await this.db.disputes.update(disputeId, {
      status: 'under_review',
      assigned_to: agentId,
      review_started_at: new Date()
    });

    // Contact both parties
    const shipment = await this.db.shipments.findById(dispute.shipment_id);
    const match = await this.db.matches.findOne({ where: { shipment_id: dispute.shipment_id } });

    await this.whatsapp.sendMessage(
      shipment.shipper_id,
      `Hello, I'm ${agentName} from Matola support. I'm reviewing your dispute for shipment #${shipment.reference}. I'll call you shortly to understand what happened.`
    );

    await this.whatsapp.sendMessage(
      match.transporter_id,
      `Hello, a dispute has been raised for shipment #${shipment.reference}. I'll call you to hear your side of the story.`
    );

    return { success: true, status: 'under_review' };
  }

  /**
   * Resolve dispute with decision
   */
  async resolveDispute(disputeId, agentId, resolution) {
    const {
      decision,  // 'favor_shipper' | 'favor_transporter' | 'split' | 'dismissed'
      explanation,
      compensation_amount,
      action_taken
    } = resolution;

    const dispute = await this.db.disputes.findById(disputeId);

    // Update dispute
    await this.db.disputes.update(disputeId, {
      status: 'resolved',
      resolution: decision,
      resolution_explanation: explanation,
      compensation_amount,
      resolved_by: agentId,
      resolved_at: new Date()
    });

    // Execute resolution
    await this.executeResolution(dispute, resolution);

    // Notify both parties
    await this.notifyResolution(dispute, resolution);

    // Update user records if misconduct proven
    if (decision === 'favor_shipper' && dispute.type === 'misconduct') {
      await this.flagUser(dispute.match.transporter_id, 'misconduct_confirmed');
    }

    return { success: true, resolution };
  }

  async executeResolution(dispute, resolution) {
    const { decision, compensation_amount } = resolution;
    const payment = await this.db.payments.findOne({ where: { shipment_id: dispute.shipment_id } });

    if (decision === 'favor_shipper') {
      // Refund shipper (full or partial)
      await this.processRefund(payment.id, compensation_amount || payment.amount_mwk);
    }

    if (decision === 'favor_transporter') {
      // Release payment to transporter
      await this.releasePayment(payment.id);
    }

    if (decision === 'split') {
      // Split payment
      const shipperRefund = compensation_amount;
      const transporterPay = payment.amount_mwk - compensation_amount;
      
      await this.processRefund(payment.id, shipperRefund);
      await this.releasePayment(payment.id, transporterPay);
    }

    if (decision === 'dismissed') {
      // No action - release payment to transporter
      await this.releasePayment(payment.id);
    }
  }

  async flagUser(userId, reason) {
    const user = await this.db.users.findById(userId);

    // Increment flag count
    const flagCount = (user.metadata.flag_count || 0) + 1;

    await this.db.users.update(userId, {
      metadata: {
        ...user.metadata,
        flag_count: flagCount,
        last_flag_reason: reason,
        last_flag_date: new Date()
      }
    });

    // Auto-suspend if 3+ flags
    if (flagCount >= 3) {
      await this.suspendUser(userId, 'Multiple disputes/misconduct flags');
    }
  }

  async suspendUser(userId, reason) {
    await this.db.users.update(userId, {
      status: 'suspended',
      metadata: {
        ...user.metadata,
        suspension_reason: reason,
        suspension_date: new Date()
      }
    });

    // Notify user
    await this.whatsapp.sendMessage(
      user.phone,
      `Your Matola account has been temporarily suspended due to: ${reason}. Contact support at +265 XXX XXXX to resolve.`
    );
  }
}
```

---

## 6.7 Fraud Prevention Measures

```yaml
Fraud Types & Prevention:

1. FAKE LISTINGS:
   Problem: Users post shipments they don't have
   Prevention:
     - Require payment upfront (escrow)
     - Photo verification before matching
     - Limit new users to 1 shipment/day
     - Manual review for high-value loads
   
2. GHOST TRANSPORTERS:
   Problem: Accept jobs, never show up
   Prevention:
     - Require vehicle photos & documents
     - Track no-show rate (suspend after 2)
     - Deposit system (MWK 10,000 held, returned after 10 trips)
     - Union verification preferred

3. PAYMENT FRAUD:
   Problem: Fake payment confirmations
   Prevention:
     - WhatsApp photo verification (cash)
     - Mobile money webhooks (automated)
     - Support team verification before release
     - Transaction limits for new users

4. CARGO THEFT:
   Problem: Driver takes cargo, disappears
   Prevention:
     - GPS tracking (Phase 2)
     - Photo at pickup and delivery
     - Union membership verification
     - Insurance for high-value shipments
     - Police report assistance

5. RATING MANIPULATION:
   Problem: Fake 5-star ratings
   Prevention:
     - Only verified trips can be rated
     - Detect rating patterns (all 5s suspicious)
     - Manual review of new accounts with perfect ratings
     - Weight ratings by trip value

6. IDENTITY THEFT:
   Problem: Using someone else's documents
   Prevention:
     - Selfie + ID comparison
     - Live video verification (Phase 2)
     - Union cross-reference
     - Community reporting

7. ACCOUNT TAKEOVER:
   Problem: Stolen phone/account
   Prevention:
     - OTP for sensitive actions
     - Device fingerprinting
     - Alert on unusual activity (new device, location)
     - Easy account recovery process

Fraud Detection Triggers:
  - New user with high-value first shipment (>MWK 500,000)
  - Multiple cancellations in short period
  - Same device used for multiple accounts
  - Payment from different phone than registered
  - Perfect 5.0 rating with <5 trips
  - Cargo type changes after matching
  - Location drastically different from profile
```

---

This trust system is designed for **African realities**: recognizing that technology alone cannot build trust, but must work alongside community structures, cultural norms, and human judgment. The goal is not to eliminate all fraud (impossible), but to make it rare enough that honest users feel safe.

# 7. OPERATIONAL RUNBOOKS

This section provides **day-to-day management procedures** for running Matola in the African context. These are battle-tested protocols for when things go wrong (and they will).

---

## 7.1 Daily Operations Checklist

```yaml
MORNING ROUTINE (6:00 AM - 9:00 AM CAT)

Support Team Lead:
  ☐ Check system uptime dashboard (target: 99.5%)
  ☐ Review overnight alerts (email/SMS/WhatsApp)
  ☐ Check USSD service status (*384*628652# test dial)
  ☐ Review payment failures from previous day
  ☐ Check pending verification queue (target: <24h wait)
  ☐ Review dispute escalations (respond within 4 hours)
  ☐ Check SMS/WhatsApp credit balance (top up if <20%)
  ☐ Brief support agents on priority issues
  ☐ Post team availability status in ops WhatsApp group

Technical Operations:
  ☐ Check server CPU/memory usage (alert if >80%)
  ☐ Review error logs (filter Critical/High severity)
  ☐ Check database connection pool (should be <80% utilization)
  ☐ Verify backup completion (last 24 hours)
  ☐ Check Redis cache hit rate (target: >85%)
  ☐ Monitor API response times (p95 <2s)
  ☐ Test USSD flow (complete full user journey)
  ☐ Check queue depths (matching, notifications, payments)

Field Operations:
  ☐ Check fuel availability for field vehicle
  ☐ Review scheduled in-person verifications for the day
  ☐ Confirm appointments with transport unions
  ☐ Check inventory: marketing materials, verification forms
  ☐ Test mobile hotspot and backup power banks
  ☐ Update field visit log with today's destinations

MID-DAY CHECK (12:00 PM - 1:00 PM CAT)

All Teams:
  ☐ Review active shipments (check for delays)
  ☐ Monitor live matching activity
  ☐ Check customer satisfaction (any complaints?)
  ☐ Review payment processing (any stuck transactions?)
  ☐ Update management dashboard with KPIs
  ☐ Address any urgent support tickets

EVENING WRAP-UP (5:00 PM - 6:00 PM CAT)

Support Team:
  ☐ Close resolved tickets
  ☐ Escalate unresolved issues to next day
  ☐ Send end-of-day summary to management
  ☐ Schedule follow-ups for next morning
  ☐ Update on-call contact in case of emergency

Technical Operations:
  ☐ Review day's performance metrics
  ☐ Schedule any maintenance for overnight
  ☐ Ensure on-call engineer has laptop + internet access
  ☐ Document any incidents or anomalies

Finance/Admin:
  ☐ Reconcile cash payments collected today
  ☐ Process transporter payouts (if due)
  ☐ Update financial records
  ☐ Prepare bank deposits for next morning
```

---

## 7.2 System Monitoring & Alerting Protocols

### 7.2.1 Alert Response Matrix

```yaml
CRITICAL ALERTS (Immediate Response - Page On-Call)

Alert: Database Connection Failure
Symptoms: "Connection timeout", "Too many connections"
Impact: Entire platform down
Response Time: <5 minutes
Actions:
  1. Check database server status (AWS RDS dashboard)
  2. Verify network connectivity
  3. Check connection pool exhaustion (PgBouncer)
  4. If pool exhausted: Kill long-running queries
  5. If server down: Initiate failover to standby
  6. Notify engineering team immediately
  7. Post status update: "We're experiencing technical issues. Our team is working on it."
Escalation: If not resolved in 15 minutes, call CTO

Alert: USSD Service Down
Symptoms: Africa's Talking API returning errors
Impact: 70% of users cannot access platform
Response Time: <10 minutes
Actions:
  1. Test USSD manually (*384*628652#)
  2. Check Africa's Talking service status page
  3. Verify callback URL is reachable
  4. Check server logs for webhook errors
  5. Test with different phone/network (Airtel vs TNM)
  6. If AT outage: Post notice via SMS/WhatsApp
  7. If our server issue: Restart USSD service
Escalation: Contact Africa's Talking support (+254 XXX)

Alert: Payment Webhook Failed
Symptoms: Multiple payment confirmations not received
Impact: Funds held in limbo, users cannot complete trips
Response Time: <30 minutes
Actions:
  1. Check payment provider status (Airtel Money/TNM)
  2. Verify webhook signature validation isn't blocking
  3. Check server logs for webhook processing errors
  4. Manually query payment status via API
  5. Update payment records manually if confirmed
  6. Notify affected users of status
Escalation: Contact payment provider support

HIGH PRIORITY ALERTS (Respond Within 1 Hour)

Alert: API Response Time Spike (>2s p95)
Symptoms: Slow queries, timeout errors
Impact: Poor user experience, USSD timeouts
Actions:
  1. Check database query performance (slow query log)
  2. Identify bottleneck endpoints (APM dashboard)
  3. Check server CPU/memory usage
  4. Review recent code deployments (rollback if needed)
  5. Scale up servers if traffic spike
  6. Optimize slow queries or add indexes

Alert: Queue Backlog (>1000 items)
Symptoms: Notifications delayed, matches not processing
Impact: Users not receiving timely updates
Actions:
  1. Check worker processes are running
  2. Increase worker count temporarily
  3. Identify slow jobs causing backlog
  4. Check for failed jobs in dead letter queue
  5. Process manually if critical (payments, matches)

Alert: SMS/WhatsApp Credits Low (<20%)
Symptoms: Credit balance dropping rapidly
Impact: Cannot send notifications
Actions:
  1. Top up credits immediately (online portal)
  2. Check for unusual usage spike (possible spam)
  3. Review message logs for anomalies
  4. Set higher threshold alert (30%) going forward

MEDIUM PRIORITY ALERTS (Respond Within 4 Hours)

Alert: Disk Space >80%
Actions:
  1. Identify large files/logs consuming space
  2. Clean up old logs (>30 days)
  3. Archive old backups to S3 Glacier
  4. Increase disk size if needed
  5. Set up log rotation if not configured

Alert: Failed Verification Queue Growing
Actions:
  1. Review failed verifications
  2. Identify common failure reasons
  3. Improve verification flow if systemic issue
  4. Manually process if user error

Alert: Unusual Traffic Pattern
Actions:
  1. Check for bot activity
  2. Review access logs for suspicious IPs
  3. Enable rate limiting if attack detected
  4. Block malicious IPs via firewall
```

### 7.2.2 Incident Response Procedure

```javascript
// Incident Template: incidents/INCIDENT_YYYYMMDD_NNN.md

/**
 * INCIDENT REPORT
 * 
 * Incident ID: INC_20241207_001
 * Severity: Critical / High / Medium / Low
 * Status: Open / Investigating / Resolved / Post-Mortem
 * 
 * TIMELINE (All times in CAT):
 * - HH:MM - Incident detected
 * - HH:MM - On-call engineer paged
 * - HH:MM - Root cause identified
 * - HH:MM - Fix deployed
 * - HH:MM - Incident resolved
 * 
 * IMPACT:
 * - Users affected: X,XXX
 * - Duration: X hours X minutes
 * - Services affected: USSD / WhatsApp / PWA / Payments
 * - Revenue impact: MWK X,XXX (if applicable)
 * 
 * ROOT CAUSE:
 * [Detailed technical explanation]
 * 
 * RESOLUTION:
 * [What was done to fix it]
 * 
 * PREVENTION:
 * [How to prevent this in future]
 * - Monitoring improvement: [specific metric to track]
 * - Code change: [specific fix]
 * - Process change: [specific procedure]
 * 
 * LESSONS LEARNED:
 * - What went well?
 * - What could be improved?
 * - Action items for next sprint
 */

// Example Incident Report

## INCIDENT: Database Connection Pool Exhaustion

**Incident ID:** INC_20241207_001  
**Severity:** Critical  
**Date:** December 7, 2024  
**Duration:** 23 minutes  

### Timeline (CAT)
- 14:32 - Monitoring alert: Database connection errors
- 14:33 - On-call engineer (Alice) paged via SMS
- 14:35 - Alice connects to server, confirms pool exhaustion
- 14:37 - Identified: Matching job running slow query (missing index)
- 14:40 - Killed long-running queries manually
- 14:42 - Created database index on shipments.departure_date
- 14:45 - Services restored, monitoring recovery
- 14:55 - Confirmed stable, incident closed

### Impact
- **Users affected:** ~500 (could not post shipments or find loads)
- **Services down:** USSD (timeout errors), PWA (500 errors)
- **Payment impact:** 0 (payment service has separate pool)
- **Revenue impact:** Minimal (short duration, no payments failed)

### Root Cause
Matching algorithm running unoptimized query scanning entire shipments table:
```sql
-- BAD: No index on departure_date
SELECT * FROM shipments 
WHERE status = 'pending' 
AND departure_date >= CURRENT_DATE 
ORDER BY created_at DESC;
```

With 50,000+ shipments in database, this query took 8+ seconds and exhausted connection pool during peak matching job (runs every 15 min).

### Resolution
1. **Immediate:** Killed slow queries, freed connections
2. **Short-term:** Created index:
   ```sql
   CREATE INDEX CONCURRENTLY idx_shipments_status_departure 
   ON shipments(status, departure_date) 
   WHERE status = 'pending';
   ```
3. **Long-term:** Added query timeout (5s), connection pool monitoring

### Prevention Measures
- ✅ Added slow query alert (>2s warns, >5s critical)
- ✅ Scheduled weekly query performance review
- ✅ Implemented query explain plan in CI/CD (catch before production)
- ✅ Increased connection pool size: 50→100 (temporary, not root fix)
- ⏳ TODO: Add read replica for analytics queries (reduce main DB load)

### Lessons Learned
**What went well:**
- Alert fired quickly (within 1 minute)
- On-call responded fast (3 minutes)
- Root cause identified quickly (5 minutes)
- Fix was straightforward (add index)

**What could improve:**
- Should have caught this in staging (need better load testing)
- Index creation should have been in initial migration
- Need automated query performance regression tests

**Action Items:**
1. [@TechLead] Add query performance tests to CI/CD by Dec 14
2. [@DevOps] Set up weekly load testing on staging by Dec 21
3. [@Engineering] Audit all queries for missing indexes by Jan 5
```

---

## 7.3 Customer Support Procedures

### 7.3.1 Support Ticket Categories & SLAs

```yaml
Ticket Priorities & Response Times:

CRITICAL (Response: 15 min | Resolution: 4 hours)
  - Payment not received after delivery
  - Account locked/suspended incorrectly
  - Cannot access account (OTP not working)
  - Safety/security issue
  - Cargo theft reported

HIGH (Response: 1 hour | Resolution: 24 hours)
  - Shipment matched but driver not responding
  - Wrong cargo delivered
  - Cargo damaged during transport
  - Dispute escalation
  - Verification stuck for >48 hours

MEDIUM (Response: 4 hours | Resolution: 72 hours)
  - Rating dispute
  - Profile information incorrect
  - Cannot upload documents
  - Feature not working as expected
  - General how-to questions

LOW (Response: 24 hours | Resolution: 7 days)
  - Feature requests
  - General feedback
  - Documentation clarification
  - Historical data questions
```

### 7.3.2 Common Support Scenarios

```markdown
## SCENARIO 1: "Driver Not Showing Up"

**Symptoms:**
- Shipper reports driver accepted load but hasn't arrived
- Cannot reach driver by phone
- Departure time has passed

**Support Agent Actions:**

1. **Verify the Match** (2 minutes)
   - Check shipment status in admin dashboard
   - Confirm match acceptance timestamp
   - Review agreed pickup time and location

2. **Contact Driver** (5 minutes)
   - Call driver's registered phone number
   - If no answer, send WhatsApp message
   - Give 15 minute window to respond
   - Check driver's recent activity (last seen)

3. **Driver Responsive - Delay Reason** (10 minutes)
   - Get explanation (traffic, breakdown, etc.)
   - Estimate new arrival time
   - Relay to shipper via WhatsApp/call
   - Update shipment notes
   - Monitor situation

4. **Driver Not Responsive - Escalate** (30 minutes)
   - Mark match as "no-show"
   - Trigger automatic backup matching
   - Notify shipper: "Finding alternative driver"
   - Flag driver account (2 strikes = suspension)
   - Find next best match (within 30 min)
   - Call new driver before notifying shipper

5. **Document & Follow-Up**
   - Create support ticket with full timeline
   - Send apology discount to shipper (10% off next shipment)
   - Follow up with no-show driver within 24h
   - If legitimate emergency, no penalty
   - If habitual no-show, suspend account

**WhatsApp Template to Shipper:**
```
Hello [Name], we understand [Driver] has not arrived yet. 
We've contacted them and are finding you an alternative driver. 
You'll receive an update within 30 minutes. 

Sorry for this inconvenience. Your next shipment will get 10% discount.

Need urgent help? Call us: +265 XXX XXXX
```

**Escalation Criteria:**
- Unable to reach driver after 30 minutes
- Shipper reports safety concern
- High-value shipment (>MWK 500,000)
- Repeat offender driver

---

## SCENARIO 2: "Payment Not Released After Delivery"

**Symptoms:**
- Driver completed delivery
- Shipper confirmed receipt
- Payment stuck in "held" status
- Driver requesting immediate payment

**Support Agent Actions:**

1. **Verify Delivery** (3 minutes)
   - Check shipment status: should be "delivered"
   - Confirm shipper marked as received
   - Check delivery timestamp
   - Review any photos uploaded

2. **Check Payment Status** (2 minutes)
   - View payment record in admin panel
   - Current status: pending/held/processing/completed
   - Check escrow hold reason
   - Review payment method (mobile money/cash)

3. **Common Causes & Resolutions:**

   **a) Shipper Hasn't Confirmed Delivery**
   - Send reminder to shipper:
     ```
     Hi [Name], has your shipment #[REF] been delivered? 
     Please confirm so we can release payment to the driver.
     Reply: YES (delivered) or NO (not yet)
     ```
   - If confirmed: Proceed to release payment
   - If denied: Open investigation

   **b) Automatic Hold (Fraud Detection)**
   - Review flagged reason
   - Check user verification status
   - Verify transaction legitimacy
   - If legitimate: Override hold, release payment
   - If suspicious: Escalate to manager

   **c) Technical Issue (Webhook Failed)**
   - Check payment provider status
   - Manually verify payment with provider API
   - Update payment status manually
   - Release escrow funds
   - Log technical incident

4. **Release Payment** (5 minutes)
   ```javascript
   // Admin action
   await paymentService.releaseEscrow(paymentId, {
     released_by: agentId,
     reason: 'Manual release - delivery confirmed',
     notes: 'Shipper confirmed via WhatsApp, photos verified'
   });
   ```

5. **Notify Driver**
   ```
   Good news! Payment of MWK [AMOUNT] has been released.
   
   Method: [Airtel Money/TNM/Cash]
   Reference: [REF]
   
   It may take 5-30 minutes to reflect in your account.
   
   Receipt: https://matola.mw/receipt/[ID]
   ```

6. **Document Resolution**
   - Update support ticket
   - Note resolution time
   - If technical issue: Create bug ticket
   - If repeated for this shipper: Flag account

**Escalation Criteria:**
- Payment amount >MWK 500,000
- Dispute over delivery quality
- Fraud suspected
- Cannot verify delivery

---

## SCENARIO 3: "Cargo Damaged During Transport"

**Symptoms:**
- Shipper reports items broken/damaged
- May include photos of damage
- Requesting refund or compensation

**Support Agent Actions:**

1. **Gather Information** (10 minutes)
   - Request photos of damage (WhatsApp)
   - Ask for description: What was damaged? How bad?
   - Check if cargo was insured
   - Review shipment details (cargo type, value, weight)
   - Check if special handling was specified

2. **Contact Driver** (10 minutes)
   - Inform of damage claim
   - Request their side of story
   - Ask for photos taken at pickup/delivery
   - Check if driver noted pre-existing damage

3. **Assess Responsibility** (15 minutes)
   
   **Driver at Fault:**
   - Overloaded vehicle
   - Reckless driving (per shipper testimony)
   - Improper packaging/securing
   - Violated special handling instructions
   
   **Not Driver's Fault:**
   - Poor road conditions (documented)
   - Items poorly packaged by shipper
   - Pre-existing damage (noted at pickup)
   - Normal wear for cargo type

   **Unclear Responsibility:**
   - No photos from pickup
   - Conflicting stories
   - No witnesses

4. **Determine Compensation** (10 minutes)

   **Driver Clearly At Fault:**
   - Full refund to shipper
   - Driver pays for damage (deduct from earnings)
   - Flag driver account
   - Offer shipper future discount

   **Shared Responsibility:**
   - 50% refund to shipper
   - 50% payment to driver
   - Both parties warned
   - Suggest better packaging next time

   **Shipper At Fault:**
   - No refund
   - Full payment to driver
   - Educate shipper on proper packaging
   - Provide packaging guidelines

   **Unclear:**
   - Escalate to manager
   - May offer 25% goodwill refund
   - Mark both accounts for monitoring

5. **Execute Resolution** (5 minutes)
   ```javascript
   // Partial refund
   await paymentService.processRefund(paymentId, {
     amount: compensationAmount,
     reason: 'Cargo damage - partial responsibility',
     approved_by: agentId,
     notes: '[detailed explanation]'
   });
   ```

6. **Educate & Prevent** (5 minutes)
   - Send packaging guidelines to shipper
   - Send cargo handling best practices to driver
   - If fragile items: Suggest insurance for future
   - Update knowledge base with this scenario

**Cargo Handling Guidelines (Send to Users):**

*For Shippers:*
```
📦 PACKAGING TIPS:
- Use sturdy boxes/crates
- Wrap fragile items individually
- Fill empty space with padding
- Mark boxes: FRAGILE / THIS SIDE UP
- Take photos before handing to driver
- Declare true cargo value

For extra protection:
- Add insurance (3% of value)
- Request special handling
- Use our recommended packaging service
```

*For Drivers:*
```
🚛 CARGO CARE:
- Inspect cargo at pickup (note any damage)
- Secure items properly (use ropes/straps)
- Drive carefully on rough roads
- Check cargo periodically during trip
- Take photos at pickup and delivery
- Report any issues immediately

Your reputation depends on safe delivery!
```

**Escalation Criteria:**
- Cargo value >MWK 100,000
- Shipper threatening legal action
- Driver disputing claim aggressively
- Repeat damage claims (same user)

---

## SCENARIO 4: "Cannot Register / Login"

**Symptoms:**
- User reports OTP not received
- "Invalid code" error
- Account locked
- Phone number not recognized

**Support Agent Actions:**

1. **Identify Issue Type** (2 minutes)

   **OTP Not Received:**
   - Check SMS logs (was it sent?)
   - Check user's phone number format
   - Ask which network (Airtel/TNM)
   - Network outage? (check status)

   **OTP Expired:**
   - Explain 5-minute expiry
   - Send new OTP
   - Ask user to check time immediately

   **Invalid Code Error:**
   - Ask user to read code slowly
   - Check for typos (0 vs O, 1 vs I)
   - Ask to try again carefully
   - If 3rd attempt: Send new OTP

   **Phone Number Not Recognized:**
   - Verify phone number format
   - Check if previously registered
   - Check for typos in entry

2. **Resolution Steps:**

   **Resend OTP:**
   ```javascript
   // Admin panel action
   await authService.resendOTP(phoneNumber, {
     triggered_by: agentId,
     reason: 'User did not receive SMS'
   });
   ```

   **Manual Verification (Last Resort):**
   ```javascript
   // If OTP system completely broken
   await authService.manualVerify(phoneNumber, {
     verified_by: agentId,
     method: 'support_call',
     notes: 'Verified via voice call, user answered security questions'
   });
   ```

   **Account Recovery:**
   ```javascript
   // If user locked out
   await authService.unlockAccount(userId, {
     unlocked_by: agentId,
     reason: 'Failed OTP attempts - user verified via call'
   });
   ```

3. **Troubleshooting Network Issues:**
   - If widespread: Post system status update
   - If single user: Suggest they check airtime balance
   - Try alternative number if available
   - Worst case: Manual verification via video call

4. **Document & Monitor:**
   - Track OTP failure rate (alert if >5%)
   - Note network provider if pattern emerges
   - Escalate to tech team if systemic issue

---

## SCENARIO 5: "Verification Taking Too Long"

**Symptoms:**
- User submitted documents 48+ hours ago
- Still showing "pending review"
- User complaining about delay

**Support Agent Actions:**

1. **Check Verification Queue** (2 minutes)
   - Find user in admin verification panel
   - Check submission timestamp
   - Review documents submitted
   - Check rejection history (if any)

2. **Review Documents** (5 minutes)
   
   **Documents Clear & Valid:**
   - Approve immediately
   - Apologize for delay
   - Send confirmation WhatsApp

   **Documents Unclear:**
   - Request better photos:
     ```
     Hi [Name], we need clearer photos of your:
     - [ID Card / License / Vehicle Registration]
     
     Tips for good photos:
     - Good lighting (daytime outdoors)
     - Flat surface (no glare)
     - Full document visible
     - Text must be readable
     
     Upload via WhatsApp or call us for help.
     ```

   **Documents Invalid/Suspicious:**
   - Escalate to senior agent
   - May require video call verification
   - Possible rejection

3. **Expedite Process** (If Legitimate):**
   ```javascript
   // Fast-track verification
   await verificationService.approve(userId, {
     approved_by: agentId,
     fast_tracked: true,
     reason: 'Delay exceeded SLA, documents valid'
   });
   ```

4. **Compensate for Delay:**
   - If delay >72 hours: Apologize + offer benefit
   - Benefit options:
     * First shipment fee waived
     * Featured listing (transporter)
     * Priority matching for 7 days

5. **Prevent Future Delays:**
   - If backlog: Alert manager to add temp reviewer
   - If unclear instructions: Update verification UI
   - If technical issue: Escalate to engineering

**WhatsApp Response:**
```
Hi [Name], sorry for the delay in reviewing your verification.

✅ Good news: You're now VERIFIED!

You can now:
- Post unlimited shipments (shippers)
- Accept loads (transporters)
- Access priority matching
- Earn trust badges

As an apology, your first shipment is FREE!

Start now: *384*628652# or WhatsApp "POST"
```

---

## SCENARIO 6: "Price Dispute After Agreement"

**Symptoms:**
- Shipper and driver agreed on price
- At delivery, driver demands more money
- Shipper refuses to pay extra
- Payment held in escrow

**Support Agent Actions:**

1. **Verify Original Agreement** (5 minutes)
   - Check shipment listing price
   - Review match acceptance (was counter-offer made?)
   - Check chat history (if any price negotiation)
   - Review any special conditions mentioned

2. **Get Both Sides** (15 minutes)
   
   **Driver's Claim:**
   - "Road conditions worse than expected"
   - "Cargo heavier than stated"
   - "Extra stops requested"
   - "Fuel prices increased"

   **Shipper's Response:**
   - "Price was agreed upfront"
   - "Nothing changed from original posting"
   - "Driver trying to extort"

3. **Investigate Claims** (10 minutes)
   
   **Check if Cargo Weight Accurate:**
   - Compare posted weight vs actual
   - If significantly heavier: Driver has case
   - If same: Shipper has case

   **Check if Route Changed:**
   - Original: Lilongwe → Blantyre (direct)
   - Actual: Lilongwe → Zomba → Blantyre (detour)
   - If detour: Was it shipper's request?

   **Check if Conditions Changed:**
   - Weather events (heavy rains blocking roads)
   - Road closures (forced longer route)
   - Government checkpoints (unexpected delays)

4. **Resolution Decision:**

   **Shipper Correct (Enforce Original Price):**
   - Release agreed amount only
   - Warn driver about price manipulation
   - Document on driver's record

   **Driver Correct (Approve Extra Charge):**
   - Request shipper pay difference
   - If shipper refuses: Matola covers difference
   - Update pricing guidelines to prevent future

   **Compromise (Split Difference):**
   - Shipper pays 50% of extra
   - Matola absorbs 50%
   - Educate both parties

5. **Policy Enforcement:**
   ```
   MATOLA PRICE POLICY:
   
   ✅ Price is FINAL once match accepted
   ✅ Changes only if:
      - Cargo weight misrepresented (±20%)
      - Route significantly changed
      - Force majeure (impassable roads)
   
   ❌ NOT valid reasons:
      - Fuel price changes
      - Driver changed mind
      - "Didn't know it was far"
      - Traffic delays
   
   Violation = Account warning/suspension
   ```

6. **Prevent Future Disputes:**
   - Add price confirmation step in USSD
   - Show "binding agreement" message
   - Educate users on fixed pricing
   - Penalize repeat offenders

---

## 7.4 Field Operations Procedures

### 7.4.1 In-Person Verification Visits

```markdown
## FIELD VERIFICATION PROTOCOL

**Purpose:** Build trust through face-to-face verification of transporters

**Frequency:** 
- Priority: New transporters with >3 pending shipments
- Routine: 10-15 verifications per week per field agent
- Target: All active transporters verified within 90 days

**Equipment Checklist:**
- ☐ Smartphone with camera (charged + backup battery)
- ☐ Portable printer (for instant ID cards)
- ☐ Verification forms (5 copies)
- ☐ Company ID badge
- ☐ Matola branded materials (stickers, posters)
- ☐ Measuring tape (for vehicle dimensions)
- ☐ Mobile hotspot (for uploads)
- ☐ Cash float (MWK 20,000 for emergencies)

**Verification Process:**

1. **Schedule Appointment** (Phone/WhatsApp)
   ```
   Hello [Name], this is [Agent] from Matola. 

   We'd like to verify your account in person. This will:
   ✅ Give you a VERIFIED badge
   ✅ Increase your matches by 50%
   ✅ Allow higher value shipments

   When are you available? We can meet at:
   - Your home/office
   - Transport union office
   - Our Matola office

   Takes only 15 minutes!
   ```

2. **Meeting Preparation**
   - Confirm location and time (1 hour before)
   - Review user's profile and documents
   - Plan route (group nearby verifications)
   - Inform office of schedule

3. **On-Site Verification** (15-20 minutes)
   
   **a) Identity Verification:**
   - Check National ID or Passport
   - Compare photo to person
   - Verify name, date of birth
   - Take photo of ID (both sides)
   - Take photo with user (selfie)

   **b) Vehicle Inspection (Transporters):**
   - Check registration matches submitted documents
   - Verify VIN number
   - Measure cargo space (length × width × height)
   - Check vehicle condition:
     * Tires (tread depth, damage)
     * Lights (functional)
     * Brakes (visual check)
     * Overall roadworthiness
   - Take photos (4 angles + registration plate)
   - Check insurance and inspection stickers

   **c) Address Verification:**
   - Confirm physical location
   - Take GPS coordinates
   - Take photo of premises/landmark
   - Verify against stated address

   **d) Reference Check (Optional):**
   - Ask for 2 references (other transporters/shippers)
   - Call references on spot if available
   - Document in notes

4. **Documentation** (Mobile App Entry)
   ```javascript
   // Field agent mobile app
   {
     user_id: "uuid",
     verification_type: "in_person",
     verified_by: agentId,
     verification_date: "2024-12-07",
     location: {
       lat: -13.9626,
       lng: 33.7741,
       address: "Area 25, Lilongwe"
     },
     documents_checked: [
       "national_id",
       "vehicle_registration",
       "insurance_certificate"
     ],
     vehicle_inspection: {
       registration: "RU 1234",
       make: "Isuzu",
       model: "ELF",
       year: 2015,
       condition: "good",
       capacity_verified: "1500kg",
       photos: ["url1", "url2", "url3", "url4"]
     },
     notes: "Vehicle in good condition. Driver professional and cooperative.",
     recommendation: "approve"
   }
   ```

5. **Issue Verification Materials:**
   - Print verification certificate on spot
   - Give Matola vehicle sticker (windshield)
   - Provide marketing materials
   - Explain verified benefits

6. **Follow-Up:**
   - Upload all photos within 2 hours
   - Update user status to "verified"
   - Send confirmation WhatsApp
   - Schedule next verification (annual renewal)

**Red Flags (Reject or Escalate):**
- ID does not match person
- Vehicle registration fake or altered
- Vehicle unsafe for cargo transport
- Address false or suspicious
- User aggressive or uncooperative
- Conflicting information in documents

**Safety Protocol:**
- Always verify in public or semi-public spaces
- Inform office of location before meeting
- Check in after each verification
- If unsafe situation: Leave immediately, report
- Never handle large cash amounts
```

### 7.4.2 Transport Union Partnership Management

```markdown
## UNION ENGAGEMENT PROTOCOL

**Goal:** Build strong relationships with transport unions for bulk user acquisition and verification

**Target Unions:**1. Malawi Transport Association (MTA) - Lilongwe
2. Commercial Drivers Association (CDA) - Blantyre
3. Minibus Operators Association (MOA) - Mzuzu
4. NASFAM (farmers/shippers) - Nationwide

**Engagement Steps:**

1. **Initial Contact** (Week 1)
   - Schedule meeting with union leadership
   - Prepare presentation (15-min pitch)
   - Bring:
     * Company profile
     * Partnership proposal document
     * Sample verification process
     * Commission structure (if applicable)

2. **Pitch Meeting** (Week 2-3)
   - Present Matola value proposition:
     * Reduce empty returns
     * Increase member earnings
     * Provide verification service
     * No cost to union
   - Propose partnership benefits:
     * Bulk member verification
     * Featured union badge on platform
     * Priority matching for members
     * Monthly earnings reports
     * Revenue share (optional): 2% of member transactions

3. **Pilot Program** (Month 1-2)
   - Verify 20-50 union members
   - Track performance:
     * Match success rate
     * Earnings increase
     * Member satisfaction
   - Weekly check-in with union leadership
   - Address any issues quickly

4. **Full Rollout** (Month 3+)
   - Bulk member upload (CSV)
   - Union-branded marketing materials
   - Joint launch event
   - Ongoing support:
     * Monthly performance reports
     * Quarterly review meetings
     * Issue resolution within 24h

5. **Maintain Relationship:**
   - Monthly email newsletter
   - Quarterly in-person meeting
   - Annual member survey
   - Respond to union concerns within 4 hours
   - Recognize top-performing members

**Union Partnership Agreement Template:**
```
MATOLA-UNION PARTNERSHIP AGREEMENT

Between: Matola Logistics Ltd
And: [Union Name]

1. MEMBER VERIFICATION
   - Matola will verify [Union] members at no cost
   - [Union] provides member list (name, phone, vehicle reg)
   - Verification completed within 7 days of submission

2. PLATFORM BENEFITS
   - Verified members receive union badge
   - Priority matching for union members
   - Dedicated support line for union issues

3. PERFORMANCE REPORTING
   - Monthly report to [Union] leadership showing:
     * Active members on platform
     * Total earnings by members
     * Average earnings increase
     * Match success rates

4. QUALITY ASSURANCE
   - [Union] vouches for member legitimacy
   - [Union] handles member disputes first
   - Matola escalates serious issues to [Union]
   - Both parties commit to member satisfaction

5. REVENUE SHARE (Optional)
   - [Union] receives 2% of gross transaction value
   - Paid monthly via mobile money
   - Transparent reporting dashboard

6. TERM
   - 12 months, auto-renewing
   - Either party can terminate with 30 days notice

Signed:
___________________ (Matola Representative)
___________________ (Union Representative)
Date: _______________
```

---

