import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { POST as loginHandler } from '@/app/api/auth/login/route'

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

describe('Auth API Integration Tests', () => {
  beforeAll(() => {
    // Setup test database or mocks
  })

  afterAll(() => {
    // Cleanup
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          phone: '265991234567',
          pin: '1234',
          role: 'shipper',
        }),
      })

      const response = await registerHandler(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.user).toBeDefined()
      expect(data.user.phone).toBe('265991234567')
    })

    it('should reject duplicate phone number', async () => {
      // First registration
      const request1 = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User 1',
          phone: '265991234567',
          pin: '1234',
          role: 'shipper',
        }),
      })
      await registerHandler(request1)

      // Duplicate registration
      const request2 = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User 2',
          phone: '265991234567',
          pin: '5678',
          role: 'transporter',
        }),
      })

      const response = await registerHandler(request2)
      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      // First register
      const registerRequest = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          phone: '265991234567',
          pin: '1234',
          role: 'shipper',
        }),
      })
      await registerHandler(registerRequest)

      // Then login
      const loginRequest = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          phone: '265991234567',
          pin: '1234',
        }),
      })

      const response = await loginHandler(loginRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user).toBeDefined()
      expect(data.accessToken).toBeDefined()
      expect(data.refreshToken).toBeDefined()
    })

    it('should reject incorrect PIN', async () => {
      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          phone: '265991234567',
          pin: 'wrong',
        }),
      })

      const response = await loginHandler(request)
      expect(response.status).toBe(401)
    })
  })
})
