import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { POST as loginHandler } from '@/app/api/auth/login/route'
import { hashPin } from '@/lib/auth/password'

// Shared Prisma user mocks so we can control behaviour per test.
// Use `var` so that Vitest's hoisting for `vi.mock` does not hit TDZ issues.
// These will be assigned inside the mock factory below.
// eslint-disable-next-line no-var
var createMock: any
// eslint-disable-next-line no-var
var findUniqueMock: any

// Mock Prisma client used by the auth routes
vi.mock('@/lib/db/prisma', () => {
  createMock = vi.fn()
  findUniqueMock = vi.fn()

  return {
    prisma: {
      user: {
        create: createMock,
        findUnique: findUniqueMock,
      },
    },
  }
})

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    createMock.mockReset()
    findUniqueMock.mockReset()
  })

  beforeAll(() => {
    // Setup test database or mocks
  })

  afterAll(() => {
    // Cleanup
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // No existing user
      findUniqueMock.mockResolvedValueOnce(null)

      const user = {
        id: 'user-1',
        name: 'Test User',
        phone: '265991234567',
        email: null,
        whatsapp: null,
        pinHash: await hashPin('1234'),
        role: 'shipper',
        verified: false,
        verificationLevel: 'phone',
        preferredLanguage: 'en',
      }
      createMock.mockResolvedValueOnce(user)

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
      // First registration: no existing user, then user is created
      findUniqueMock.mockResolvedValueOnce(null)
      const user = {
        id: 'user-1',
        name: 'Test User 1',
        phone: '265991234567',
        email: null,
        whatsapp: null,
        pinHash: await hashPin('1234'),
        role: 'shipper',
        verified: false,
        verificationLevel: 'phone',
        preferredLanguage: 'en',
      }
      createMock.mockResolvedValueOnce(user)

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

      // Duplicate registration: findUnique should now return an existing user
      findUniqueMock.mockResolvedValueOnce(user)

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
      // PRD: duplicate registration should return 409 Conflict
      expect(response.status).toBe(409)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      // First register: behave like a successful registration
      findUniqueMock.mockResolvedValueOnce(null)
      const user = {
        id: 'user-1',
        name: 'Test User',
        phone: '265991234567',
        email: null,
        whatsapp: null,
        pinHash: await hashPin('1234'),
        role: 'shipper',
        verified: false,
        verificationLevel: 'phone',
        preferredLanguage: 'en',
      }
      createMock.mockResolvedValueOnce(user)

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

      // Login: user should be found with the same hashed PIN
      findUniqueMock.mockResolvedValueOnce(user)

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
      // User exists but with different PIN hash
      const user = {
        id: 'user-1',
        name: 'Test User',
        phone: '265991234567',
        email: null,
        whatsapp: null,
        pinHash: await hashPin('1234'),
        role: 'shipper',
        verified: false,
        verificationLevel: 'phone',
        preferredLanguage: 'en',
      }
      findUniqueMock.mockResolvedValueOnce(user)

      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          phone: '265991234567',
          // Use a valid PIN format but incorrect value so we exercise 401 Invalid Credentials
          pin: '9999',
        }),
      })

      const response = await loginHandler(request)
      expect(response.status).toBe(401)
    })
  })
})

