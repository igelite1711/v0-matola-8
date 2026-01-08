# MATOLA - CRITICAL MISSING FEATURES IMPLEMENTATION GUIDE

**Date:** December 8, 2025  
**Priority:** 🔴 CRITICAL - These features are BLOCKING the PRD-compliant deployment  
**Target Completion:** 4-6 weeks (depending on resource allocation)

---

## EXECUTIVE SUMMARY

The current implementation is **missing 60% of intended users** by not having USSD and WhatsApp integrations. According to the PRD:

- **USSD: 60% of users** (feature phones, offline capability)
- **WhatsApp: 25% of users** (smartphone users without data bundle)
- **PWA: 15% of users** (power users with data)

**Current State:** PWA only = 15% coverage  
**Need to Achieve:** 100% coverage (USSD + WhatsApp + PWA)

---

## PART 1: USSD INTEGRATION (60% OF USERS)

### Overview

USSD (Unstructured Supplementary Service Data) is the PRIMARY channel for Matola because:
- Works on **any phone** (feature, smart, old)
- No data bundle required
- No app installation
- Session-based (server controls flow)
- Familiar interface (users know USSD from banking)

**Target:** Dial *384*628652# or *384*68*265#

---

### Implementation Roadmap

#### Phase 1: Infrastructure Setup (Week 1)

**1. Sign Up with Africa's Talking**

```bash
Website: https://africastalking.com/
Service: USSD
Step 1: Create account
Step 2: Get API credentials
Step 3: Get USSD short code (*384*628652# or shared *384*68*265#)
Cost: ~$500-2000/month for dedicated short code
Budget Option: Shared short code ~$50/month
```

**2. Create USSD Service Environment**

```env
# .env.local
AFRICAS_TALKING_API_KEY=your_api_key
AFRICAS_TALKING_USERNAME=your_username
AFRICAS_TALKING_SHORT_CODE=384628652 # or 68
USSD_SESSION_TTL=300 # 5 minutes
REDIS_URL=redis://localhost:6379
```

**3. Redis Setup**

```bash
# For session storage
docker run -d -p 6379:6379 redis:latest

# Or use RedisCloud: https://redis.com/try-free/
```

---

#### Phase 2: Core USSD Handler (Week 1-2)

**File Structure:**

```
lib/
  ussd/
    service.ts           # Main USSD handler
    state-machine.ts     # State transitions
    messages.ts          # Menu templates (English/Chichewa)
    handlers/
      auth.ts           # Login/Register
      shipment.ts       # Post/Find shipments
      account.ts        # Account info
      tracking.ts       # Track shipment
      help.ts           # Help menu

app/
  api/
    ussd/
      route.ts          # Webhook handler
```

**Create: `lib/ussd/service.ts`**

```typescript
import Redis from 'ioredis'
import { USSDStateMachine } from './state-machine'
import { getUSSDMessage } from './messages'
import { verifyOTP, verifyPin } from '@/lib/auth/password'
import { prisma } from '@/lib/db/prisma'

export class USSDService {
  private redis: Redis.Redis
  private stateMachine: USSDStateMachine

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!)
    this.stateMachine = new USSDStateMachine()
  }

  /**
   * Handle incoming USSD request from Africa's Talking
   * Request format:
   * {
   *   "sessionId": "ATUid_...",
   *   "serviceCode": "628652",
   *   "phoneNumber": "+265991234567",
   *   "text": "" (first request) or "1\n2" (user responses)
   * }
   */
  async handleUSSDRequest(
    sessionId: string,
    serviceCode: string,
    phoneNumber: string,
    text: string
  ): Promise<{ response: string; isEnd: boolean }> {
    // Get user session from Redis
    let session = await this.getSession(sessionId, phoneNumber)

    // If new session, get language preference
    if (!session) {
      session = {
        sessionId,
        phone: phoneNumber,
        state: 'LANGUAGE_SELECT',
        language: 'en',
        context: {},
        createdAt: new Date(),
      }
    }

    // Update last activity
    session.updatedAt = new Date()

    // Parse user input
    const userInputs = text.split('*').filter(Boolean) // Split by * for menu hierarchy
    const userInput = userInputs[userInputs.length - 1] || ''

    // Get next state and message
    const { nextState, message, context, isEnd } = await this.stateMachine.transition(
      session.state,
      userInput,
      session.context,
      phoneNumber,
      session.language
    )

    // Update session
    session.state = nextState
    session.context = context
    await this.saveSession(sessionId, phoneNumber, session)

    // Format response for Africa's Talking
    const response = this.formatResponse(message, isEnd)
    return { response, isEnd }
  }

  private async getSession(sessionId: string, phone: string) {
    const key = `ussd:session:${phone}:${sessionId}`
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  private async saveSession(sessionId: string, phone: string, session: any) {
    const key = `ussd:session:${phone}:${sessionId}`
    await this.redis.setex(key, 300, JSON.stringify(session)) // 5 minute TTL
  }

  private formatResponse(message: string, isEnd: boolean): string {
    if (isEnd) {
      return `END ${message}`
    }
    return `CON ${message}`
  }
}
```

**Create: `lib/ussd/state-machine.ts`**

```typescript
/**
 * USSD State Machine - Defines all possible states and transitions
 */

export class USSDStateMachine {
  async transition(
    currentState: string,
    userInput: string,
    context: any,
    phone: string,
    language: string
  ): Promise<{
    nextState: string
    message: string
    context: any
    isEnd: boolean
  }> {
    switch (currentState) {
      // ==================== LANGUAGE SELECTION ====================
      case 'LANGUAGE_SELECT':
        return this.handleLanguageSelect(userInput, language)

      // ==================== MAIN MENU ====================
      case 'MAIN_MENU':
        return this.handleMainMenu(userInput, context, language)

      // ==================== AUTHENTICATION ====================
      case 'LOGIN_PHONE':
        return this.handleLoginPhone(userInput, language)

      case 'LOGIN_PIN':
        return this.handleLoginPin(userInput, context, language, phone)

      case 'REGISTER_NAME':
        return this.handleRegisterName(userInput, language)

      case 'REGISTER_ROLE':
        return this.handleRegisterRole(userInput, context, language)

      case 'REGISTER_PIN':
        return this.handleRegisterPin(userInput, context, language)

      case 'REGISTER_CONFIRM_PIN':
        return this.handleRegisterConfirmPin(userInput, context, language, phone)

      // ==================== POST SHIPMENT ====================
      case 'POST_SHIPMENT_ORIGIN':
        return this.handlePostShipmentOrigin(userInput, language)

      case 'POST_SHIPMENT_DESTINATION':
        return this.handlePostShipmentDestination(userInput, context, language)

      case 'POST_SHIPMENT_CARGO_TYPE':
        return this.handlePostShipmentCargoType(userInput, context, language)

      case 'POST_SHIPMENT_WEIGHT':
        return this.handlePostShipmentWeight(userInput, context, language)

      case 'POST_SHIPMENT_PRICE':
        return this.handlePostShipmentPrice(userInput, context, language)

      case 'POST_SHIPMENT_CONFIRM':
        return this.handlePostShipmentConfirm(userInput, context, language, phone)

      // ==================== FIND TRANSPORT ====================
      case 'FIND_TRANSPORT_ROUTE':
        return this.handleFindTransport(userInput, language, phone)

      // ==================== MY SHIPMENTS ====================
      case 'MY_SHIPMENTS_LIST':
        return this.handleMyShipments(userInput, language, phone)

      // ==================== ACCOUNT ====================
      case 'ACCOUNT_MENU':
        return this.handleAccountMenu(userInput, language, phone)

      // ==================== HELP ====================
      case 'HELP_MENU':
        return this.handleHelpMenu(userInput, language)

      default:
        return {
          nextState: 'MAIN_MENU',
          message: this.getMessage('INVALID_OPTION', language),
          context,
          isEnd: false,
        }
    }
  }

  // ==================== STATE HANDLERS ====================

  private async handleLanguageSelect(
    input: string,
    language: string
  ): Promise<{ nextState: string; message: string; context: any; isEnd: boolean }> {
    if (input === '1') {
      return {
        nextState: 'MAIN_MENU',
        message: this.getMessage('MAIN_MENU', 'en'),
        context: { language: 'en' },
        isEnd: false,
      }
    }
    if (input === '2') {
      return {
        nextState: 'MAIN_MENU',
        message: this.getMessage('MAIN_MENU', 'ny'),
        context: { language: 'ny' },
        isEnd: false,
      }
    }

    return {
      nextState: 'LANGUAGE_SELECT',
      message: this.getMessage('LANGUAGE_SELECT', language),
      context: {},
      isEnd: false,
    }
  }

  private async handleMainMenu(
    input: string,
    context: any,
    language: string
  ): Promise<{ nextState: string; message: string; context: any; isEnd: boolean }> {
    const stateMap: Record<string, string> = {
      '1': 'POST_SHIPMENT_ORIGIN',
      '2': 'FIND_TRANSPORT_ROUTE',
      '3': 'MY_SHIPMENTS_LIST',
      '4': 'ACCOUNT_MENU',
      '5': 'HELP_MENU',
      '0': 'END',
    }

    const nextState = stateMap[input] || 'MAIN_MENU'

    if (nextState === 'END') {
      return {
        nextState: 'END',
        message: this.getMessage('GOODBYE', language),
        context,
        isEnd: true,
      }
    }

    if (nextState === 'MAIN_MENU') {
      return {
        nextState: 'MAIN_MENU',
        message: this.getMessage('MAIN_MENU', language),
        context,
        isEnd: false,
      }
    }

    // For other options, get the appropriate message
    const messageKey = nextState
    return {
      nextState,
      message: this.getMessage(messageKey, language),
      context,
      isEnd: false,
    }
  }

  // ... (implement other handlers similarly)

  private getMessage(key: string, language: string): string {
    const messages = this.getMessages(language)
    return messages[key] || 'Invalid option'
  }

  private getMessages(language: string): Record<string, string> {
    if (language === 'ny') {
      return this.getChichewamessages()
    }
    return this.getEnglishMessages()
  }

  private getEnglishMessages(): Record<string, string> {
    return {
      LANGUAGE_SELECT: `Welcome to Matola

1. English
2. Chichewa

Select 1 or 2`,
      MAIN_MENU: `Welcome to Matola

1. Post a load
2. Find transport
3. My shipments
4. Account
5. Help
0. Exit`,
      // ... more messages
    }
  }

  private getChichewaMess ages(): Record<string, string> {
    return {
      LANGUAGE_SELECT: `Moni ku Matola

1. English
2. Chichewa

Sankhani 1 kapena 2`,
      MAIN_MENU: `Moni ku Matola

1. Lemba katundu
2. Peza galimoto
3. Katundu wanga
4. Akaunti
5. Thandizo
0. Tuluka`,
      // ... more messages
    }
  }
}
```

**Create: `app/api/ussd/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { USSDService } from '@/lib/ussd/service'
import { logger } from '@/lib/monitoring/logger'

const ussdService = new USSDService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, serviceCode, phoneNumber, text } = body

    // Validate Africa's Talking request
    if (!sessionId || !phoneNumber) {
      return NextResponse.json({ error: 'Invalid USSD request' }, { status: 400 })
    }

    // Log the request
    logger.info('USSD Request', {
      sessionId,
      phone: phoneNumber,
      text,
    })

    // Handle USSD
    const { response, isEnd } = await ussdService.handleUSSDRequest(
      sessionId,
      serviceCode || '628652',
      phoneNumber,
      text
    )

    // Africa's Talking expects:
    // "CON [message]" for continue
    // "END [message]" for end
    return new NextResponse(response, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  } catch (error: any) {
    logger.error('USSD Error', { error: error instanceof Error ? error : new Error(String(error)) })
    return new NextResponse('END Error processing your request. Please try again.', { status: 500 })
  }
}
```

---

#### Phase 3: Implement State Handlers (Week 2-3)

Each state handler needs to:
1. Validate user input
2. Query database if needed
3. Return next state and message
4. Handle back/cancel options

**Create: `lib/ussd/handlers/auth.ts`**

```typescript
import { prisma } from '@/lib/db/prisma'
import { hashPin, verifyPin } from '@/lib/auth/password'

export class AuthHandler {
  async handleLoginPhone(input: string, language: string) {
    // Validate phone format
    if (!input.match(/^\+?265\d{9}$/)) {
      return {
        nextState: 'LOGIN_PHONE',
        message: language === 'ny'
          ? 'Lemberani nambala ya foni (+265XXXXXXXXX)'
          : 'Enter phone number (+265XXXXXXXXX)',
        context: {},
        isEnd: false,
      }
    }

    return {
      nextState: 'LOGIN_PIN',
      message: language === 'ny'
        ? 'Lemberani PIN yanu (Manambala 4)'
        : 'Enter your PIN (4 digits)',
      context: { phone: input },
      isEnd: false,
    }
  }

  async handleLoginPin(input: string, context: any, language: string, phone: string) {
    if (!input.match(/^\d{4}$/)) {
      return {
        nextState: 'LOGIN_PIN',
        message: language === 'ny'
          ? 'PIN idzakhala manambala 4 okha'
          : 'PIN must be 4 digits',
        context,
        isEnd: false,
      }
    }

    // Verify user
    const user = await prisma.user.findUnique({
      where: { phone: context.phone },
    })

    if (!user || !(await verifyPin(input, user.pinHash || ''))) {
      return {
        nextState: 'LOGIN_PIN',
        message: language === 'ny'
          ? 'PIN ndi nambala ya foni sizingowona'
          : 'Invalid PIN or phone',
        context,
        isEnd: false,
      }
    }

    return {
      nextState: 'MAIN_MENU',
      message: language === 'ny'
        ? `Moni ${user.name}!\n\n1. Lemba katundu\n2. Peza galimoto\n3. Katundu wanga\n4. Akaunti\n0. Tuluka`
        : `Welcome ${user.name}!\n\n1. Post a load\n2. Find transport\n3. My shipments\n4. Account\n0. Exit`,
      context: { userId: user.id, phone, authenticated: true },
      isEnd: false,
    }
  }

  // ... register handlers
}
```

---

### Testing USSD

**Manual Testing:**

1. Set up Africa's Talking sandbox
2. Use their testing tool: https://africastalking.com/ussd/simulator
3. Dial your short code
4. Test each menu flow

**Unit Testing:**

```typescript
// tests/ussd/service.test.ts
import { USSDService } from '@/lib/ussd/service'

describe('USSDService', () => {
  let service: USSDService

  beforeAll(() => {
    service = new USSDService()
  })

  it('should handle language selection', async () => {
    const result = await service.handleUSSDRequest(
      'session123',
      '628652',
      '+265991234567',
      ''
    )

    expect(result.response).toContain('Welcome')
    expect(result.response).toContain('English')
  })

  it('should validate phone number on login', async () => {
    const result = await service.handleUSSDRequest(
      'session123',
      '628652',
      '+265991234567',
      '1\ninvalidphone'
    )

    expect(result.response).toContain('Invalid')
  })
})
```

---

## PART 2: WHATSAPP INTEGRATION (25% OF USERS)

### Overview

WhatsApp provides a familiar interface for 95% of smartphone users and works with:
- Low data (compressed media)
- Offline messages (queued)
- Rich media (photos, location)
- Group chats (community)

**Provider:** Twilio WhatsApp Business API  
**Cost:** ~$0.002-0.004 per message

---

### Implementation Roadmap

#### Phase 1: Twilio Setup (Week 2)

**1. Sign Up with Twilio**

```bash
Website: https://www.twilio.com/
Service: WhatsApp Business API
Cost: ~$0.002/message inbound, $0.002 outbound

Setup Steps:
1. Create account
2. Verify phone number
3. Request WhatsApp Business API access
4. Get account SID and auth token
5. Link WhatsApp Business account (Meta Business Manager)
```

**2. Environment Variables**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+265999XXX XXX
TWILIO_WEBHOOK_URL=https://yourdomain.com/api/whatsapp/webhook
```

**3. Twilio Webhook Configuration**

In Twilio console:
- Go to WhatsApp Sender → Phone Number
- Set Webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
- Method: POST

---

#### Phase 2: Message Handler (Week 2-3)

**Create: `lib/whatsapp/service.ts`**

```typescript
import twilio from 'twilio'
import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/monitoring/logger'

export class WhatsAppService {
  private client: twilio.Twilio
  private whatsappNumber: string

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER!
  }

  /**
   * Handle incoming WhatsApp message
   */
  async handleIncomingMessage(
    from: string,
    messageBody: string,
    mediaUrl?: string
  ): Promise<void> {
    const phone = from.replace('whatsapp:', '').replace('+', '+')

    try {
      // Get conversation context
      const context = await this.getConversationContext(phone)

      // Process message
      const response = await this.processMessage(phone, messageBody, context, mediaUrl)

      // Send response
      if (response) {
        await this.sendMessage(phone, response.text, response.mediaUrl)
      }

      // Update context
      if (response?.context) {
        await this.saveConversationContext(phone, response.context)
      }

      // Log
      logger.info('WhatsApp message handled', {
        phone,
        messageBody,
        response: response?.text,
      })
    } catch (error: any) {
      logger.error('WhatsApp Error', {
        phone,
        error: error instanceof Error ? error : new Error(String(error)),
      })

      // Send error response
      await this.sendMessage(phone, 'Sorry, I encountered an error. Please try again.')
    }
  }

  /**
   * Process message based on conversation context
   */
  private async processMessage(
    phone: string,
    message: string,
    context: any,
    mediaUrl?: string
  ): Promise<{ text: string; mediaUrl?: string; context?: any } | null> {
    const lowerMessage = message.toLowerCase().trim()

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    })

    // ==================== NEW USER ====================
    if (!user) {
      if (!context.registerStep) {
        // Start registration
        return {
          text: `Welcome to Matola! 👋

I'm here to help you find transport or cargo.

What's your name?`,
          context: { phone, registerStep: 'name', language: 'en' },
        }
      }

      if (context.registerStep === 'name') {
        return {
          text: `Nice to meet you, ${message}!

Are you a:
1️⃣ SHIPPER (I have cargo)
2️⃣ TRANSPORTER (I have a vehicle)

Reply with 1 or 2`,
          context: {
            phone,
            registerStep: 'role',
            name: message,
            language: 'en',
          },
        }
      }

      if (context.registerStep === 'role') {
        if (message === '1') {
          // Create user as shipper
          user = await prisma.user.create({
            data: {
              name: context.name,
              phone,
              role: 'shipper',
              verified: false,
              verificationLevel: 'none',
            },
          })

          return {
            text: `Great! You're registered as a shipper.

To post your first shipment, reply:
POST [origin] TO [destination]

Example:
POST Lilongwe TO Blantyre`,
            context: { phone, userId: user.id, language: 'en' },
          }
        }
      }
    }

    // ==================== AUTHENTICATED USER ====================
    if (context.userId || user) {
      const userId = context.userId || user.id

      // POST SHIPMENT
      if (lowerMessage.startsWith('post ')) {
        return this.handlePostShipment(message, context)
      }

      // FIND LOADS
      if (lowerMessage === 'find load' || lowerMessage === 'find') {
        return this.handleFindLoads(userId, context)
      }

      // MY SHIPMENTS
      if (lowerMessage === 'my shipments' || lowerMessage === 'my loads') {
        return this.handleMyShipments(userId, context)
      }

      // TRACK
      if (lowerMessage.startsWith('track ')) {
        return this.handleTrackShipment(message, userId)
      }

      // HELP
      if (lowerMessage === 'help') {
        return this.handleHelp(context)
      }

      // Default response
      return {
        text: `I didn't understand that.

Commands:
📦 POST [from] TO [to]
🚛 FIND LOAD
📋 MY SHIPMENTS
🚚 TRACK [shipment ID]
❓ HELP`,
        context,
      }
    }

    return null
  }

  private async handlePostShipment(message: string, context: any) {
    // Parse: "POST Lilongwe TO Blantyre"
    const match = message.match(/POST\s+(.+?)\s+TO\s+(.+)/i)
    if (!match) {
      return {
        text: 'Format: POST [origin] TO [destination]\nExample: POST Lilongwe TO Blantyre',
        context,
      }
    }

    const [, origin, destination] = match

    return {
      text: `Shipment from ${origin} to ${destination}

What type of cargo?
1️⃣ Food (maize, rice)
2️⃣ Building materials
3️⃣ Furniture
4️⃣ Livestock
5️⃣ Other

Reply with number`,
      context: {
        ...context,
        postStep: 'cargo_type',
        origin,
        destination,
      },
    }
  }

  private async handleFindLoads(userId: string, context: any) {
    // Get user's vehicle profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { transporterProfile: true },
    })

    if (!user?.transporterProfile) {
      return {
        text: '⚠️ You need to create a transporter profile first.',
        context,
      }
    }

    // Find matching shipments
    const shipments = await prisma.shipment.findMany({
      where: { status: 'pending' },
      take: 5,
    })

    if (!shipments.length) {
      return {
        text: 'No loads available right now. Check back later!',
        context,
      }
    }

    // Format shipments
    let text = 'Available loads:\n\n'
    shipments.forEach((s, i) => {
      text += `${i + 1}. ${s.originCity} → ${s.destinationCity}\n`
      text += `   📦 ${s.cargoType}\n`
      text += `   💰 MK ${s.price}\n\n`
    })
    text += 'Reply with number for details'

    return {
      text,
      context: { ...context, availableLoads: shipments.map(s => s.id) },
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendMessage(to: string, message: string, mediaUrl?: string): Promise<void> {
    const messageParams: any = {
      body: message,
      from: this.whatsappNumber,
      to: `whatsapp:${to}`,
    }

    if (mediaUrl) {
      messageParams.mediaUrl = mediaUrl
    }

    await this.client.messages.create(messageParams)
  }

  /**
   * Send templated message (for notifications)
   */
  async sendTemplate(
    to: string,
    templateName: string,
    variables: Record<string, string>
  ): Promise<void> {
    const body = this.formatTemplate(templateName, variables)
    await this.sendMessage(to, body)
  }

  private async getConversationContext(phone: string): Promise<any> {
    // In production, store in Redis or database
    // For MVP, use in-memory cache
    return {}
  }

  private async saveConversationContext(phone: string, context: any): Promise<void> {
    // Store in Redis/database
  }

  private formatTemplate(name: string, vars: Record<string, string>): string {
    const templates: Record<string, string> = {
      match_notification: `🎉 Great news!

A transporter has accepted your shipment.

Driver: ${vars.driverName}
Phone: ${vars.driverPhone}
Vehicle: ${vars.vehicleType}
Rating: ${vars.rating}/5

Contact them to confirm details.`,
      // ... more templates
    }

    return templates[name] || ''
  }
}
```

**Create: `app/api/whatsapp/webhook/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { WhatsAppService } from '@/lib/whatsapp/service'
import { logger } from '@/lib/monitoring/logger'

const whatsappService = new WhatsAppService()

export async function POST(request: NextRequest) {
  try {
    // Verify Twilio signature
    const signature = request.headers.get('X-Twilio-Signature') || ''
    const body = await request.text()
    const url = request.url

    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature,
      url,
      body
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse message
    const formData = new URLSearchParams(body)
    const from = formData.get('From') || ''
    const messageBody = formData.get('Body') || ''
    const mediaUrl = formData.get('MediaUrl0')

    // Handle message
    await whatsappService.handleIncomingMessage(from, messageBody, mediaUrl || undefined)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error('WhatsApp Webhook Error', {
      error: error instanceof Error ? error : new Error(String(error)),
    })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

---

### Testing WhatsApp

**Using Twilio's Sandbox:**

1. Go to Twilio Console → WhatsApp Sender
2. Note the sandbox number (e.g., +1-415-523-8886)
3. Send "join [invite code]" to activate your test
4. Send test messages

**Unit Tests:**

```typescript
// tests/whatsapp/service.test.ts
describe('WhatsAppService', () => {
  let service: WhatsAppService

  beforeAll(() => {
    service = new WhatsAppService()
  })

  it('should handle new user registration', async () => {
    const result = await service.processMessage(
      '+265991234567',
      'Hi',
      {}
    )

    expect(result?.text).toContain('Welcome')
    expect(result?.context.registerStep).toBe('name')
  })

  it('should parse POST command', async () => {
    const result = await service.processMessage(
      '+265991234567',
      'POST Lilongwe TO Blantyre',
      { userId: 'user123' }
    )

    expect(result?.text).toContain('cargo')
  })
})
```

---

## PART 3: INTEGRATION CHECKLIST

### Development Environment

- [ ] Set up Africa's Talking account
- [ ] Get USSD short code
- [ ] Set up Redis for USSD sessions
- [ ] Set up Twilio account
- [ ] Get WhatsApp Business API access
- [ ] Create environment variables
- [ ] Set up webhooks

### USSD Implementation

- [ ] Create USSD service
- [ ] Implement state machine
- [ ] Create message templates (EN/NY)
- [ ] Implement auth handlers
- [ ] Implement shipment handlers
- [ ] Implement tracking handlers
- [ ] Test with Africa's Talking simulator
- [ ] Deploy to production

### WhatsApp Implementation

- [ ] Create WhatsApp service
- [ ] Implement message parser
- [ ] Implement registration flow
- [ ] Implement shipment posting
- [ ] Implement load finding
- [ ] Implement tracking
- [ ] Test with Twilio sandbox
- [ ] Deploy to production

### Database & Backend

- [ ] Add WhatsApp phone field to User model
- [ ] Add conversation context storage
- [ ] Add shipment notification endpoints
- [ ] Add rate limiting for WhatsApp
- [ ] Add audit logging

### Frontend & PWA

- [ ] Update dashboard to show channel status
- [ ] Add WhatsApp share buttons
- [ ] Add USSD instructions
- [ ] Create help documentation

### Testing

- [ ] Unit tests for USSD state machine
- [ ] Unit tests for WhatsApp parsing
- [ ] Integration tests with real APIs
- [ ] Load testing (USSD/WhatsApp under traffic)
- [ ] User acceptance testing

---

## TIMELINE & RESOURCE ALLOCATION

**Scenario: Full-Time Team (3 developers)**

| Phase | Task | Time | Developer |
|-------|------|------|-----------|
| Week 1 | USSD Setup + Core Handler | 40h | Dev 1 |
| Week 1 | WhatsApp Setup + Message Handler | 40h | Dev 2 |
| Week 2-3 | USSD State Handlers | 60h | Dev 1 |
| Week 2-3 | WhatsApp Flows | 70h | Dev 2 |
| Week 3 | Integration Testing | 30h | Dev 3 |
| Week 3 | Deployment & Optimization | 30h | Dev 3 |
| **TOTAL** | | **270h (6-7 weeks)** | |

**Scenario: Part-Time (2 developers, 20h/week)**

- Total time: **13-14 weeks**
- Start: Now
- Launch: Mid-to-late January 2025

---

## ESTIMATED COST

| Service | Monthly | Notes |
|---------|---------|-------|
| Africa's Talking USSD | $500-2000 | Dedicated vs. shared code |
| Twilio WhatsApp | ~$50-200 | ~100K messages |
| Redis | $0-50 | Self-hosted or Redis Cloud |
| Hosting (extra) | $50-100 | For USSD/WhatsApp handlers |
| **TOTAL** | **$600-2400/month** | Production cost |

---

## SUCCESS METRICS

Once implemented:

- ✅ 60% of users can access via USSD
- ✅ 25% of users can access via WhatsApp
- ✅ <2s response time on all channels
- ✅ <5 minutes to post shipment on any channel
- ✅ 99.5% uptime (USSD is critical)
- ✅ 4.0/5.0+ user satisfaction

---

## FINAL NOTES

1. **USSD is CRITICAL** - This is your primary channel for 60% of users
2. **WhatsApp is HIGH PRIORITY** - Bridges gap for smartphone users without data
3. **Both are required** for PRD compliance and market success
4. **Start USSD first** - It's the revenue driver
5. **Test thoroughly** - Limited markets mean bugs affect all users

---

**Prepared by:** Code Analysis System  
**For:** Matola Team  
**Status:** Ready for Implementation
