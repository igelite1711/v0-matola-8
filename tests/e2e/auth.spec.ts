import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should register and login a new user', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register')
    
    // Fill registration form
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="phone"]', '265991234567')
    await page.fill('input[name="pin"]', '1234')
    await page.selectOption('select[name="role"]', 'shipper')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Wait for redirect or success message
    await expect(page).toHaveURL(/\/dashboard|\/login/)
  })

  test('should login with existing credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="phone"]', '265991234567')
    await page.fill('input[name="pin"]', '1234')
    
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="phone"]', '265991234567')
    await page.fill('input[name="pin"]', 'wrong')
    
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=/invalid|error/i')).toBeVisible()
  })
})

