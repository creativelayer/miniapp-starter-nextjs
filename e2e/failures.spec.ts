import { test, expect } from '@playwright/test'

test('signIn=rejected shows auth-failed', async ({ page }) => {
  await page.goto('http://localhost:4000/host?url=http://localhost:3100&fixture=launcher&signIn=rejected')
  await expect(page.locator('#status')).toHaveText('READY', { timeout: 20000 })
  const appFrame = page.frameLocator('iframe#miniapp-frame')
  await expect(appFrame.locator('[data-testid="auth-status"]')).toHaveText('auth-failed', { timeout: 20000 })
})

test('wallet=disconnected shows Connect button', async ({ page }) => {
  await page.goto('http://localhost:4000/host?url=http://localhost:3100&fixture=launcher&wallet=disconnected')
  await expect(page.locator('#status')).toHaveText('READY', { timeout: 20000 })
  const appFrame = page.frameLocator('iframe#miniapp-frame')
  await expect(appFrame.locator('[data-testid="connect-button"]')).toBeVisible({ timeout: 20000 })
})
