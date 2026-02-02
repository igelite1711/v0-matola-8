/**
 * USSD Service Unit Tests
 * PRD Requirements: USSD is PRIMARY channel (60% of users)
 * Tests cover state machine transitions and session management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  normalizePhone,
  validateLocation,
  getCargoType,
  formatMenu,
  handleMainMenu,
  handlePostShipmentOrigin,
  handlePostShipmentDestination,
  handlePostShipmentCargoType,
  handlePostShipmentWeight,
  handlePostShipmentPrice,
} from '@/lib/ussd/ussd-service'

describe('USSD Service', () => {
  describe('normalizePhone', () => {
    it('should normalize local format to international', () => {
      expect(normalizePhone('0991234567')).toBe('+265991234567')
      expect(normalizePhone('991234567')).toBe('+265991234567')
    })

    it('should keep already normalized numbers', () => {
      expect(normalizePhone('+265991234567')).toBe('+265991234567')
      expect(normalizePhone('265991234567')).toBe('+265991234567')
    })

    it('should handle numbers with spaces', () => {
      expect(normalizePhone('099 123 4567')).toBe('+265991234567')
    })
  })

  describe('validateLocation', () => {
    it('should recognize major Malawi cities', () => {
      const lilongwe = validateLocation('Lilongwe')
      expect(lilongwe).not.toBeNull()
      expect(lilongwe?.name).toBe('Lilongwe')
      expect(lilongwe?.region).toBe('Central')
    })

    it('should handle case-insensitive input', () => {
      expect(validateLocation('BLANTYRE')?.name).toBe('Blantyre')
      expect(validateLocation('mzuzu')?.name).toBe('Mzuzu')
    })

    it('should return null for unknown locations', () => {
      expect(validateLocation('Unknown City')).toBeNull()
    })
  })

  describe('getCargoType', () => {
    it('should map numbered selections to cargo types', () => {
      expect(getCargoType('1')).toBe('food')
      expect(getCargoType('2')).toBe('building_materials')
      expect(getCargoType('3')).toBe('furniture')
      expect(getCargoType('4')).toBe('livestock')
      expect(getCargoType('5')).toBe('other')
    })

    it('should return default for invalid selection', () => {
      expect(getCargoType('99')).toBe('other')
    })
  })

  describe('formatMenu', () => {
    it('should truncate long menus to 160 chars', () => {
      const longText = 'A'.repeat(200)
      const formatted = formatMenu(longText)
      expect(formatted.length).toBeLessThanOrEqual(160)
    })

    it('should preserve short menus unchanged', () => {
      const shortText = 'Welcome to Matola'
      expect(formatMenu(shortText)).toBe(shortText)
    })
  })

  describe('handleMainMenu', () => {
    it('should return main menu with shipment count for empty input', () => {
      const result = handleMainMenu('', 'en', 2)
      expect(result.response).toContain('Welcome to Matola')
      expect(result.response).toContain('1. Post a load')
      expect(result.response).toContain('2 active')
      expect(result.newState).toBe('MAIN_MENU')
    })

    it('should return Chichewa menu for ny language', () => {
      const result = handleMainMenu('', 'ny', 0)
      expect(result.response).toContain('Moni ku Matola')
      expect(result.response).toContain('1. Lemba katundu')
    })

    it('should transition to POST_SHIPMENT_ORIGIN on selection 1', () => {
      const result = handleMainMenu('1', 'en')
      expect(result.newState).toBe('POST_SHIPMENT_ORIGIN')
    })

    it('should end session on selection 0', () => {
      const result = handleMainMenu('0', 'en')
      expect(result.newState).toBe('ENDED')
      expect(result.response).toContain('Goodbye')
    })
  })

  describe('handlePostShipmentOrigin', () => {
    it('should accept valid location and transition to destination', () => {
      const result = handlePostShipmentOrigin('Lilongwe', {}, 'en')
      expect(result.newState).toBe('POST_SHIPMENT_DESTINATION')
      expect(result.context.origin).toBe('Lilongwe')
    })

    it('should go back to main menu on 0', () => {
      const result = handlePostShipmentOrigin('0', {}, 'en')
      expect(result.newState).toBe('MAIN_MENU')
    })

    it('should show error for too short input', () => {
      const result = handlePostShipmentOrigin('AB', {}, 'en')
      expect(result.newState).toBe('POST_SHIPMENT_ORIGIN')
      expect(result.response).toContain('enter location')
    })
  })

  describe('handlePostShipmentDestination', () => {
    const context = { origin: 'Lilongwe' }

    it('should accept valid location and transition to cargo type', () => {
      const result = handlePostShipmentDestination('Blantyre', context, 'en')
      expect(result.newState).toBe('POST_SHIPMENT_CARGO_TYPE')
      expect(result.context.destination).toBe('Blantyre')
    })

    it('should preserve origin in context', () => {
      const result = handlePostShipmentDestination('Mzuzu', context, 'en')
      expect(result.context.origin).toBe('Lilongwe')
    })
  })

  describe('handlePostShipmentCargoType', () => {
    const context = { origin: 'Lilongwe', destination: 'Blantyre' }

    it('should accept cargo type selection and transition to weight', () => {
      const result = handlePostShipmentCargoType('1', context, 'en')
      expect(result.newState).toBe('POST_SHIPMENT_WEIGHT')
      expect(result.context.cargoType).toBe('food')
    })

    it('should show error for invalid selection', () => {
      const result = handlePostShipmentCargoType('99', context, 'en')
      expect(result.newState).toBe('POST_SHIPMENT_CARGO_TYPE')
    })
  })

  describe('handlePostShipmentWeight', () => {
    const context = { 
      origin: 'Lilongwe', 
      destination: 'Blantyre', 
      cargoType: 'food' 
    }

    it('should accept valid weight and transition to price', () => {
      const result = handlePostShipmentWeight('500', context, 'en')
      expect(result.newState).toBe('POST_SHIPMENT_PRICE')
      expect(result.context.weightKg).toBe(500)
    })

    it('should handle weights with units', () => {
      const result = handlePostShipmentWeight('500kg', context, 'en')
      expect(result.context.weightKg).toBe(500)
    })

    it('should show error for invalid weight', () => {
      const result = handlePostShipmentWeight('abc', context, 'en')
      expect(result.newState).toBe('POST_SHIPMENT_WEIGHT')
    })

    it('should reject zero weight', () => {
      const result = handlePostShipmentWeight('0', context, 'en')
      expect(result.newState).toBe('POST_SHIPMENT_WEIGHT')
    })
  })

  describe('handlePostShipmentPrice', () => {
    const context = { 
      origin: 'Lilongwe', 
      destination: 'Blantyre', 
      cargoType: 'food',
      weightKg: 500
    }

    it('should accept valid price and transition to confirm', () => {
      const result = handlePostShipmentPrice('50000', context, 'en')
      expect(result.newState).toBe('POST_SHIPMENT_CONFIRM')
      expect(result.context.priceMwk).toBe(50000)
    })

    it('should handle prices with commas', () => {
      const result = handlePostShipmentPrice('50,000', context, 'en')
      expect(result.context.priceMwk).toBe(50000)
    })

    it('should show confirmation summary', () => {
      const result = handlePostShipmentPrice('50000', context, 'en')
      expect(result.response).toContain('Lilongwe')
      expect(result.response).toContain('Blantyre')
      expect(result.response).toContain('500')
      expect(result.response).toContain('50,000')
    })
  })
})

describe('USSD Session State Machine', () => {
  it('should complete full shipment posting flow', () => {
    // Start at main menu
    let result = handleMainMenu('', 'en', 0)
    expect(result.newState).toBe('MAIN_MENU')

    // Select "Post a load"
    result = handleMainMenu('1', 'en')
    expect(result.newState).toBe('POST_SHIPMENT_ORIGIN')

    // Enter origin
    result = handlePostShipmentOrigin('Lilongwe', {}, 'en')
    expect(result.newState).toBe('POST_SHIPMENT_DESTINATION')

    // Enter destination
    result = handlePostShipmentDestination('Blantyre', result.context, 'en')
    expect(result.newState).toBe('POST_SHIPMENT_CARGO_TYPE')

    // Select cargo type
    result = handlePostShipmentCargoType('1', result.context, 'en')
    expect(result.newState).toBe('POST_SHIPMENT_WEIGHT')

    // Enter weight
    result = handlePostShipmentWeight('500', result.context, 'en')
    expect(result.newState).toBe('POST_SHIPMENT_PRICE')

    // Enter price - should show confirmation
    result = handlePostShipmentPrice('50000', result.context, 'en')
    expect(result.newState).toBe('POST_SHIPMENT_CONFIRM')
    expect(result.response).toContain('Confirm')
  })
})
