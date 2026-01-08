# Testing Guide

This document provides instructions for running and writing tests for the MATOLA LOGISTICS PLATFORM.

## Test Setup

The project uses:
- **Vitest** for unit and integration tests
- **Playwright** for end-to-end (E2E) tests
- **Testing Library** for React component testing

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### All Tests

```bash
# Run both unit and E2E tests
npm run test:all
```

## Test Structure

```
tests/
├── setup.ts                 # Test configuration and mocks
├── unit/                    # Unit tests
│   └── lib/
│       ├── auth/
│       └── validators/
├── integration/             # Integration tests
│   └── api/
└── e2e/                     # End-to-end tests
    ├── auth.spec.ts
    └── shipments.spec.ts
```

## Writing Tests

### Unit Tests

Unit tests test individual functions or utilities in isolation.

Example:
```typescript
import { describe, it, expect } from 'vitest'
import { hashPin, verifyPin } from '@/lib/auth/password'

describe('Password Utilities', () => {
  it('should hash a PIN successfully', async () => {
    const pin = '1234'
    const hash = await hashPin(pin)
    expect(hash).toBeDefined()
    expect(hash).not.toBe(pin)
  })
})
```

### Integration Tests

Integration tests test API routes with database interactions.

Example:
```typescript
import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as registerHandler } from '@/app/api/auth/register/route'

describe('Auth API Integration Tests', () => {
  it('should register a new user', async () => {
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
  })
})
```

### E2E Tests

E2E tests test the full user flow in a browser.

Example:
```typescript
import { test, expect } from '@playwright/test'

test('should login with existing credentials', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="phone"]', '265991234567')
  await page.fill('input[name="pin"]', '1234')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/\/dashboard/)
})
```

## Test Configuration

### Vitest Config

Located in `vitest.config.ts`:
- Uses `jsdom` environment for DOM testing
- Includes test setup file
- Configures path aliases

### Playwright Config

Located in `playwright.config.ts`:
- Tests multiple browsers (Chrome, Firefox, Safari)
- Mobile testing support
- Automatic server startup

## Best Practices

1. **Isolation**: Each test should be independent
2. **Naming**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mocking**: Mock external dependencies
5. **Coverage**: Aim for 70%+ code coverage

## CI/CD Integration

Tests automatically run in CI/CD pipeline:
- On every push to `main` or `develop`
- On pull requests
- Before deployment

## Troubleshooting

### Tests failing locally

1. Ensure dependencies are installed: `npm install`
2. Check database connection (for integration tests)
3. Verify Redis is running (for integration tests)
4. Clear test cache: `rm -rf node_modules/.vite`

### E2E tests failing

1. Install Playwright browsers: `npx playwright install`
2. Ensure dev server is running: `npm run dev`
3. Check browser compatibility

