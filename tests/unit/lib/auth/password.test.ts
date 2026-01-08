import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin } from '@/lib/auth/password'

describe('Password Utilities', () => {
  describe('hashPin', () => {
    it('should hash a PIN successfully', async () => {
      const pin = '1234'
      const hash = await hashPin(pin)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(pin)
      expect(hash.length).toBeGreaterThan(20)
    })

    it('should produce different hashes for the same PIN', async () => {
      const pin = '1234'
      const hash1 = await hashPin(pin)
      const hash2 = await hashPin(pin)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPin', () => {
    it('should verify a correct PIN', async () => {
      const pin = '1234'
      const hash = await hashPin(pin)
      
      const isValid = await verifyPin(pin, hash)
      expect(isValid).toBe(true)
    })

    it('should reject an incorrect PIN', async () => {
      const pin = '1234'
      const wrongPin = '5678'
      const hash = await hashPin(pin)
      
      const isValid = await verifyPin(wrongPin, hash)
      expect(isValid).toBe(false)
    })
  })
})

