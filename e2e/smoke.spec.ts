import { test, expect } from '@playwright/test'

const HOST_URL = 'http://localhost:4000/host?url=http://localhost:3100&fixture=launcher'

test('harness loads app and reaches READY', async ({ page }) => {
  await page.goto(HOST_URL)
  await expect(page.locator('#status')).toHaveText('READY', { timeout: 20000 })
})

test('app renders inside harness iframe', async ({ page }) => {
  await page.goto(HOST_URL)
  await expect(page.locator('#status')).toHaveText('READY', { timeout: 20000 })
  const appFrame = page.frameLocator('iframe#miniapp-frame')
  await expect(appFrame.locator('text=Farcaster Mini App')).toBeVisible({ timeout: 5000 })
})

test('context shows FID and display name', async ({ page }) => {
  await page.goto(HOST_URL)
  await expect(page.locator('#status')).toHaveText('READY', { timeout: 20000 })
  const appFrame = page.frameLocator('iframe#miniapp-frame')
  await expect(appFrame.locator('[data-testid="fid"]')).toHaveText('fid:3621', { timeout: 20000 })
  await expect(appFrame.locator('[data-testid="display-name"]')).toHaveText('Test User')
})

test('Quick Auth authenticates successfully', async ({ page }) => {
  await page.goto(HOST_URL)
  await expect(page.locator('#status')).toHaveText('READY', { timeout: 20000 })
  const appFrame = page.frameLocator('iframe#miniapp-frame')
  await expect(appFrame.locator('[data-testid="auth-status"]')).toHaveText('authenticated:fid:3621', { timeout: 20000 })
})

test('Wagmi auto-connects wallet', async ({ page }) => {
  await page.goto(HOST_URL)
  await expect(page.locator('#status')).toHaveText('READY', { timeout: 20000 })
  const appFrame = page.frameLocator('iframe#miniapp-frame')
  await expect(appFrame.locator('[data-testid="wallet-address"]')).toBeVisible({ timeout: 20000 })
  await expect(appFrame.locator('[data-testid="wallet-address"]')).toHaveText(/0x1234567890abcdef1234567890abcdef12345678/i)
})
