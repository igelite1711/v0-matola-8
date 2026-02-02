import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  registerSchema,
  createShipmentSchema,
} from '@/lib/validators/api-schemas'

describe('API Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        phone: '265991234567',
        pin: '1234',
      }
      
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid phone number', () => {
      const invalidData = {
        phone: '123',
        pin: '1234',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing PIN', () => {
      const invalidData = {
        phone: '265991234567',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        phone: '265991234567',
        pin: '1234',
        role: 'shipper',
      }
      
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid role', () => {
      const invalidData = {
        name: 'John Doe',
        phone: '265991234567',
        pin: '1234',
        role: 'invalid_role',
      }
      
      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('createShipmentSchema', () => {
    it('should validate correct shipment data', () => {
      const validData = {
        originCity: 'Lilongwe',
        originDistrict: 'Lilongwe',
        originRegion: 'Central',
        destinationCity: 'Blantyre',
        destinationDistrict: 'Blantyre',
        destinationRegion: 'Southern',
        cargoType: 'maize',
        cargoDescription: 'Maize bags',
        weight: 1000,
        requiredVehicleType: 'medium_truck',
        pickupDate: new Date().toISOString(),
        pickupTimeWindow: 'Morning',
        price: 50000,
        paymentMethod: 'cash',
      }
      
      const result = createShipmentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject negative weight', () => {
      const invalidData = {
        originCity: 'Lilongwe',
        originDistrict: 'Lilongwe',
        originRegion: 'Central',
        destinationCity: 'Blantyre',
        destinationDistrict: 'Blantyre',
        destinationRegion: 'Southern',
        cargoType: 'maize',
        cargoDescription: 'Maize bags',
        weight: -100,
        requiredVehicleType: 'medium_truck',
        pickupDate: new Date().toISOString(),
        pickupTimeWindow: 'Morning',
        price: 50000,
        paymentMethod: 'cash',
      }
      
      const result = createShipmentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})

