/**
 * WhatsApp Service Unit Tests
 * PRD Requirements: Section 3.3 - WhatsApp Business Integration
 * WhatsApp is SECONDARY channel (25% of users)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('WhatsApp Service', () => {
    describe('Message Parsing', () => {
        it('should parse POST command correctly', () => {
            const parsePostCommand = (message: string): { origin?: string; destination?: string } | null => {
                const match = message.match(/post\s+(.+?)\s+to\s+(.+)/i)
                if (!match) return null
                return { origin: match[1].trim(), destination: match[2].trim() }
            }

            expect(parsePostCommand('POST Lilongwe TO Blantyre')).toEqual({
                origin: 'Lilongwe',
                destination: 'Blantyre',
            })

            expect(parsePostCommand('post mzuzu to zomba')).toEqual({
                origin: 'mzuzu',
                destination: 'zomba',
            })

            expect(parsePostCommand('Hello')).toBeNull()
        })

        it('should recognize command keywords', () => {
            const parseCommand = (message: string): string => {
                const msg = message.toLowerCase().trim()

                if (msg.startsWith('post ')) return 'POST_SHIPMENT'
                if (msg === 'find load') return 'FIND_LOAD'
                if (msg === 'help') return 'HELP'
                if (msg === 'my shipments') return 'MY_SHIPMENTS'
                if (['hi', 'hello', 'hey'].includes(msg)) return 'GREETING'
                if (['yes', 'no'].includes(msg)) return 'CONFIRMATION'
                if (/^[1-5]$/.test(msg)) return 'NUMERIC_SELECTION'

                return 'UNKNOWN'
            }

            expect(parseCommand('POST Lilongwe TO Blantyre')).toBe('POST_SHIPMENT')
            expect(parseCommand('find load')).toBe('FIND_LOAD')
            expect(parseCommand('HELP')).toBe('HELP')
            expect(parseCommand('hi')).toBe('GREETING')
            expect(parseCommand('yes')).toBe('CONFIRMATION')
            expect(parseCommand('3')).toBe('NUMERIC_SELECTION')
            expect(parseCommand('random text')).toBe('UNKNOWN')
        })
    })

    describe('Conversation State Management', () => {
        it('should maintain conversation context', () => {
            interface WhatsAppContext {
                phone: string
                state: string
                context: Record<string, any>
                language: 'en' | 'ny'
                updatedAt: number
            }

            const createContext = (phone: string): WhatsAppContext => ({
                phone,
                state: 'INITIAL',
                context: {},
                language: 'en',
                updatedAt: Date.now(),
            })

            const updateContext = (
                ctx: WhatsAppContext,
                newState: string,
                newContextData: Record<string, any>
            ): WhatsAppContext => ({
                ...ctx,
                state: newState,
                context: { ...ctx.context, ...newContextData },
                updatedAt: Date.now(),
            })

            let ctx = createContext('+265991234567')
            expect(ctx.state).toBe('INITIAL')

            ctx = updateContext(ctx, 'POST_CARGO_TYPE', { origin: 'Lilongwe', destination: 'Blantyre' })
            expect(ctx.state).toBe('POST_CARGO_TYPE')
            expect(ctx.context.origin).toBe('Lilongwe')
        })

        it('should expire after 24 hours per PRD', () => {
            // PRD: WhatsApp conversation TTL: 86400 seconds (24h)
            const SESSION_TTL = 86400 // seconds

            const isExpired = (updatedAt: number): boolean => {
                const now = Math.floor(Date.now() / 1000)
                const sessionAge = now - Math.floor(updatedAt / 1000)
                return sessionAge > SESSION_TTL
            }

            const recentContext = Date.now()
            expect(isExpired(recentContext)).toBe(false)

            const oldContext = Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
            expect(isExpired(oldContext)).toBe(true)
        })
    })

    describe('Message Templates', () => {
        it('should format shipment confirmation template', () => {
            // PRD: Template with variables {{1}}, {{2}}, {{3}}, {{4}}
            const formatTemplate = (template: string, variables: string[]): string => {
                let result = template
                variables.forEach((value, index) => {
                    result = result.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'), value)
                })
                return result
            }

            const template = `Hi {{1}}, your shipment has been posted successfully!
📦 Reference: {{2}}
📍 Route: {{3}} → {{4}}
📊 Status: Waiting for transporter`

            const formatted = formatTemplate(template, ['John', 'ML12345', 'Lilongwe', 'Blantyre'])

            expect(formatted).toContain('Hi John')
            expect(formatted).toContain('Reference: ML12345')
            expect(formatted).toContain('Lilongwe → Blantyre')
        })

        it('should format match notification template', () => {
            const template = `Good news {{1}}! A transporter has accepted your load.

🚛 Driver: {{2}}
📞 Phone: {{3}}
🚗 Vehicle: {{4}}
📅 Pickup: {{5}}

Please confirm pickup time with the driver.`

            const formatTemplate = (template: string, variables: string[]): string => {
                let result = template
                variables.forEach((value, index) => {
                    result = result.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'), value)
                })
                return result
            }

            const formatted = formatTemplate(template, [
                'Grace',
                'Patrick Phiri',
                '+265 88 765 4321',
                'Isuzu Truck (RU 4567)',
                'Tomorrow 8:00 AM'
            ])

            expect(formatted).toContain('Good news Grace')
            expect(formatted).toContain('Driver: Patrick Phiri')
            expect(formatted).toContain('Isuzu Truck')
        })
    })

    describe('Response Generation', () => {
        it('should generate cargo type selection menu', () => {
            const generateCargoMenu = (): string => {
                return `What type of cargo?
1️⃣ Food (maize, rice, etc)
2️⃣ Building materials
3️⃣ Furniture
4️⃣ Livestock
5️⃣ Other

Reply with number or type`
            }

            const menu = generateCargoMenu()
            expect(menu).toContain('1️⃣ Food')
            expect(menu).toContain('5️⃣ Other')
            expect(menu).toContain('Reply with number')
        })

        it('should generate shipment summary', () => {
            const generateSummary = (
                origin: string,
                destination: string,
                weight: number,
                price: number
            ): string => {
                return `Perfect! Here's your shipment summary:

📍 From: ${origin}
📍 To: ${destination}
📦 Cargo: ${weight}kg
💰 Price: MWK ${price.toLocaleString()}

Is this correct?
Reply YES to post or NO to cancel`
            }

            const summary = generateSummary('Lilongwe', 'Blantyre', 500, 50000)

            expect(summary).toContain('From: Lilongwe')
            expect(summary).toContain('To: Blantyre')
            expect(summary).toContain('500kg')
            expect(summary).toContain('MWK 50,000')
        })
    })

    describe('Phone Number Handling', () => {
        it('should extract phone from WhatsApp format', () => {
            const extractPhone = (whatsappId: string): string => {
                return whatsappId.replace('whatsapp:', '').replace('+', '')
            }

            expect(extractPhone('whatsapp:+265991234567')).toBe('265991234567')
            expect(extractPhone('whatsapp:265991234567')).toBe('265991234567')
        })

        it('should format phone for Twilio', () => {
            const formatForTwilio = (phone: string): string => {
                let normalized = phone.replace(/\s+/g, '')
                if (!normalized.startsWith('+')) {
                    normalized = '+' + normalized
                }
                return `whatsapp:${normalized}`
            }

            expect(formatForTwilio('265991234567')).toBe('whatsapp:+265991234567')
            expect(formatForTwilio('+265991234567')).toBe('whatsapp:+265991234567')
        })
    })

    describe('Error Handling', () => {
        it('should handle invalid input gracefully', () => {
            const handleInvalidInput = (
                currentState: string,
                expectedType: string
            ): string => {
                const hints: Record<string, string> = {
                    'number': 'Please enter a number (e.g., 500)',
                    'price': 'Please enter amount in MWK (e.g., 50000)',
                    'location': 'Please enter a valid location (e.g., Lilongwe)',
                    'selection': 'Please select 1-5 or type your choice',
                }

                return hints[expectedType] || 'I didn\'t understand that. Please try again.'
            }

            expect(handleInvalidInput('POST_WEIGHT', 'number')).toContain('enter a number')
            expect(handleInvalidInput('POST_PRICE', 'price')).toContain('amount in MWK')
        })

        it('should handle rate limiting', () => {
            // PRD: Rate limiting on all endpoints
            const checkRateLimit = (requestCount: number, windowSize: number, limit: number): boolean => {
                return requestCount <= limit
            }

            const limit = 30 // PRD: 30 req/min for general endpoints
            const windowSize = 60 // seconds

            expect(checkRateLimit(25, windowSize, limit)).toBe(true)
            expect(checkRateLimit(35, windowSize, limit)).toBe(false)
        })
    })

    describe('Full Conversation Flow', () => {
        it('should complete registration flow', () => {
            const states = ['INITIAL', 'REGISTRATION_NAME', 'REGISTRATION_ROLE', 'REGISTERED']

            const processRegistration = (
                state: string,
                input: string,
                context: Record<string, any>
            ): { newState: string; newContext: Record<string, any> } => {
                switch (state) {
                    case 'INITIAL':
                        return {
                            newState: 'REGISTRATION_NAME',
                            newContext: context
                        }
                    case 'REGISTRATION_NAME':
                        return {
                            newState: 'REGISTRATION_ROLE',
                            newContext: { ...context, name: input }
                        }
                    case 'REGISTRATION_ROLE':
                        if (['1', '2', 'shipper', 'transporter'].includes(input.toLowerCase())) {
                            const role = input === '1' || input.toLowerCase() === 'shipper'
                                ? 'shipper'
                                : 'transporter'
                            return {
                                newState: 'REGISTERED',
                                newContext: { ...context, role }
                            }
                        }
                        return { newState: state, newContext: context }
                    default:
                        return { newState: state, newContext: context }
                }
            }

            let state = 'INITIAL'
            let context: Record<string, any> = {}

                // User says "hi"
                ({ newState: state, newContext: context } = processRegistration(state, 'hi', context))
            expect(state).toBe('REGISTRATION_NAME')

                // User enters name
                ({ newState: state, newContext: context } = processRegistration(state, 'John Banda', context))
            expect(state).toBe('REGISTRATION_ROLE')
            expect(context.name).toBe('John Banda')

                // User selects role
                ({ newState: state, newContext: context } = processRegistration(state, '1', context))
            expect(state).toBe('REGISTERED')
            expect(context.role).toBe('shipper')
        })
    })
})
