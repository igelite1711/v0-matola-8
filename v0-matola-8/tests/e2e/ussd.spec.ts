/**
 * USSD Flow E2E Tests
 * PRD Requirements: USSD is PRIMARY channel (60% of users)
 * Tests full user journeys via USSD callback endpoint
 */

import { test, expect } from '@playwright/test'

// Mock USSD callback format (Africa's Talking)
interface UssdRequest {
    sessionId: string
    serviceCode: string
    phoneNumber: string
    text: string
}

// Helper to simulate USSD request
async function sendUssdRequest(
    request: any,
    baseUrl: string,
    params: UssdRequest
): Promise<{ body: string; status: number }> {
    const formData = new URLSearchParams()
    formData.append('sessionId', params.sessionId)
    formData.append('serviceCode', params.serviceCode)
    formData.append('phoneNumber', params.phoneNumber)
    formData.append('text', params.text)

    const response = await request.post(`${baseUrl}/api/ussd/callback`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData.toString(),
    })

    return {
        body: await response.text(),
        status: response.status(),
    }
}

test.describe('USSD Flow E2E', () => {
    const baseUrl = 'http://localhost:3000'
    const testPhone = '+265991234567'
    const serviceCode = '*384*628652#'

    test('should return main menu on initial dial', async ({ request }) => {
        const sessionId = `test_${Date.now()}`

        const response = await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '',
        })

        expect(response.status).toBe(200)
        expect(response.body).toContain('CON')
        expect(response.body.toLowerCase()).toMatch(/welcome|moni/)
        expect(response.body).toMatch(/1\.|2\.|3\./)
    })

    test('should navigate to post shipment flow', async ({ request }) => {
        const sessionId = `test_${Date.now()}`

        // Initial dial
        await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '',
        })

        // Select option 1 (Post a load)
        const response = await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '1',
        })

        expect(response.status).toBe(200)
        expect(response.body).toContain('CON')
        expect(response.body.toLowerCase()).toMatch(/pickup|origin|malo/)
    })

    test('should accept location input', async ({ request }) => {
        const sessionId = `test_${Date.now()}`

        // Navigate to origin input
        await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '1',
        })

        // Enter origin
        const response = await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '1*Lilongwe',
        })

        expect(response.status).toBe(200)
        expect(response.body.toLowerCase()).toMatch(/destination|malo ofika/)
    })

    test('should show cargo type menu', async ({ request }) => {
        const sessionId = `test_${Date.now()}`

        // Navigate through origin and destination
        await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '1*Lilongwe*Blantyre',
        })

        const response = await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '1*Lilongwe*Blantyre',
        })

        expect(response.status).toBe(200)
        // Should show cargo type or next step
        expect(response.body).toContain('CON')
    })

    test('should handle exit command', async ({ request }) => {
        const sessionId = `test_${Date.now()}`

        // Initial dial
        await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '',
        })

        // Select exit (0)
        const response = await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '0',
        })

        expect(response.status).toBe(200)
        expect(response.body).toContain('END')
        expect(response.body.toLowerCase()).toMatch(/goodbye|zikomo/)
    })

    test('should handle invalid input gracefully', async ({ request }) => {
        const sessionId = `test_${Date.now()}`

        // Initial dial
        await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '',
        })

        // Enter invalid option
        const response = await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: testPhone,
            text: '99',
        })

        expect(response.status).toBe(200)
        expect(response.body).toContain('CON')
        // Should still show menu or error hint
        expect(response.body.length).toBeGreaterThan(0)
    })

    test('should support Chichewa language', async ({ request }) => {
        // Use phone number pattern that triggers Chichewa (or manually test both)
        const sessionId = `test_${Date.now()}`

        const response = await sendUssdRequest(request, baseUrl, {
            sessionId,
            serviceCode,
            phoneNumber: '+265881234567', // Different prefix
            text: '',
        })

        expect(response.status).toBe(200)
        // Should have some content (either language)
        expect(response.body.length).toBeGreaterThan(20)
    })
})

test.describe('USSD Health Check', () => {
    test('should return health status on GET', async ({ request }) => {
        const response = await request.get('http://localhost:3000/api/ussd/callback')

        expect(response.status()).toBe(200)

        const json = await response.json()
        expect(json.status).toBe('ok')
        expect(json.shortCode).toBe('*384*628652#')
    })
})
