import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  workers: 1,
  use: {
    headless: true,
  },
  webServer: [
    {
      command: 'npx farcaster-test-harness-serve 4000',
      port: 4000,
      reuseExistingServer: true,
    },
    {
      command: 'NEXT_PUBLIC_QUICK_AUTH_ORIGIN=http://localhost:4100 pnpm dev --port 3100',
      port: 3100,
      reuseExistingServer: true,
    },
    {
      command: 'npx farcaster-test-harness-quick-auth 4100',
      port: 4100,
      reuseExistingServer: true,
      stdout: 'pipe',
    },
  ],
})
