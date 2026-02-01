import { test, expect } from '@playwright/test'

test.describe('Shipment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="phone"]', '265991234567')
    await page.fill('input[name="pin"]', '1234')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test('should create a new shipment', async ({ page }) => {
    await page.goto('/dashboard/shipments/new')
    
    // Fill shipment form
    await page.fill('input[name="originCity"]', 'Lilongwe')
    await page.fill('input[name="destinationCity"]', 'Blantyre')
    await page.selectOption('select[name="cargoType"]', 'maize')
    await page.fill('input[name="weight"]', '1000')
    await page.fill('input[name="price"]', '50000')
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Should show success message or redirect
    await expect(page.locator('text=/success|created/i')).toBeVisible()
  })

  test('should list shipments', async ({ page }) => {
    await page.goto('/dashboard/shipments')
    
    // Should see shipments list
    await expect(page.locator('text=/shipment|no shipments/i')).toBeVisible()
  })
})
