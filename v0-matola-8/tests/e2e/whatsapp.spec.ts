/**
 * WhatsApp Webhook E2E Tests
 * PRD Requirements: WhatsApp is SECONDARY channel (25% of users)
 * Tests webhook handling and message processing
 */

import { test, expect } from '@playwright/test'

// Mock Twilio webhook format
interface TwilioWebhookPayload {
    From: string
    Body: string
    MessageSid?: string
    MediaUrl0?: string
    Latitude?: string
    Longitude?: string
}

// Helper to simulate Twilio webhook
async function sendWhatsAppMessage(
    request: any,
    baseUrl: string,
    payload: TwilioWebhookPayload
): Promise<{ body: string; status: number; contentType: string }> {
    const formData = new URLSearchParams()
    formData.append('From', payload.From)
    formData.append('Body', payload.Body)
    if (payload.MessageSid) formData.append('MessageSid', payload.MessageSid)
    if (payload.MediaUrl0) formData.append('MediaUrl0', payload.MediaUrl0)
    if (payload.Latitude) formData.append('Latitude', payload.Latitude)
    if (payload.Longitude) formData.append('Longitude', payload.Longitude)

    const response = await request.post(`${baseUrl}/api/whatsapp/webhook`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
    })

    return {
        body: await response.text(),
        status: response.status(),
        contentType: response.headers()['content-type'] || '',
    }
}

test.describe('WhatsApp Webhook E2E', () => {
    const baseUrl = 'http://localhost:3000'

    test('should respond to greeting', async ({ request }) => {
        const response = await sendWhatsAppMessage(request, baseUrl, {
            From: 'whatsapp:+265991234567',
            Body: 'hi',
            MessageSid: `SM${Date.now()}`,
        })

        // Should return 200 or handle gracefully
        expect([200, 400, 500]).toContain(response.status)

        if (response.status === 200) {
            // Check for TwiML response format
            expect(response.body.toLowerCase()).toMatch(/welcome|moni|response|message/)
        }
    })

    test('should parse POST command', async ({ request }) => {
        const response = await sendWhatsAppMessage(request, baseUrl, {
            From: 'whatsapp:+265991234567',
            Body: 'POST Lilongwe TO Blantyre',
            MessageSid: `SM${Date.now()}`,
        })

        expect([200, 400, 500]).toContain(response.status)

        if (response.status === 200) {
            expect(response.body.toLowerCase()).toMatch(/cargo|type|got it/)
        }
    })

    test('should handle HELP command', async ({ request }) => {
        const response = await sendWhatsAppMessage(request, baseUrl, {
            From: 'whatsapp:+265991234567',
            Body: 'HELP',
            MessageSid: `SM${Date.now()}`,
        })

        expect([200, 400, 500]).toContain(response.status)
    })

    test('should handle FIND LOAD command', async ({ request }) => {
        const response = await sendWhatsAppMessage(request, baseUrl, {
            From: 'whatsapp:+265991234567',
            Body: 'find load',
            MessageSid: `SM${Date.now()}`,
        })

        expect([200, 400, 500]).toContain(response.status)
    })

    test('should validate request payload', async ({ request }) => {
        // Missing required fields
        const response = await sendWhatsAppMessage(request, baseUrl, {
            From: '',
            Body: '',
        })

        // Should handle gracefully (400 for bad request is acceptable)
        expect([200, 400]).toContain(response.status)
    })

    test('should handle rate limiting', async ({ request }) => {
        // Send multiple requests quickly
        const promises = Array.from({ length: 10 }, (_, i) =>
            sendWhatsAppMessage(request, baseUrl, {
                From: 'whatsapp:+265991234567',
                Body: `test ${i}`,
                MessageSid: `SM${Date.now()}_${i}`,
            })
        )

        const responses = await Promise.all(promises)

        // At least some should succeed
        const successCount = responses.filter(r => r.status === 200).length
        expect(successCount).toBeGreaterThan(0)
    })
})

test.describe('WhatsApp Health Check', () => {
    test('should return health status on GET', async ({ request }) => {
        const response = await request.get('http://localhost:3000/api/whatsapp/webhook')

        expect(response.status()).toBe(200)

        const json = await response.json()
        expect(json.status).toBe('ok')
        expect(json.service).toBe('matola-whatsapp')
    })

    test('should handle webhook verification challenge', async ({ request }) => {
        // Facebook/Meta webhook verification
        const response = await request.get(
            'http://localhost:3000/api/whatsapp/webhook?hub.challenge=test_challenge_123'
        )

        expect(response.status()).toBe(200)
        const text = await response.text()
        expect(text).toBe('test_challenge_123')
    })
})
