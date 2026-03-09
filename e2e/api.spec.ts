import { test, expect } from '@playwright/test'

const HOST_URL = 'http://localhost:4000/host?url=http://localhost:3100&fixture=launcher'

test('authenticated API call returns greeting', async ({ page }) => {
  await page.goto(HOST_URL)
  await expect(page.locator('#status')).toHaveText('READY', { timeout: 20000 })
  const appFrame = page.frameLocator('iframe#miniapp-frame')

  // Wait for auth to complete
  await expect(appFrame.locator('[data-testid="auth-status"]')).toHaveText('authenticated:fid:3621', { timeout: 20000 })

  // Call the API
  await appFrame.locator('[data-testid="call-api"]').click()

  // Verify response
  await expect(appFrame.locator('[data-testid="api-response"]')).toHaveText('Hello, Test User!', { timeout: 20000 })
})
