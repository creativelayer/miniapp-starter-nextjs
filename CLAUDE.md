# Farcaster Mini App — Next.js Starter Template

This is a production-ready starter for building Farcaster miniapps with Next.js.
It includes authentication, wallet integration, an authenticated API route, and a full e2e test suite.

## What's Already Wired Up

| Feature | Files | What it does |
|---------|-------|-------------|
| **Wagmi + Farcaster wallet** | `src/app/wagmi.ts`, `src/app/providers.tsx` | Auto-connects wallet via `farcasterMiniApp` connector, Base + mainnet chains |
| **Quick Auth (JWT)** | `src/app/page.tsx` | `sdk.quickAuth.getToken()` for auth, JWT contains FID in `sub` field |
| **Authenticated API route** | `src/app/api/hello/route.ts` | Verifies JWT server-side via `@farcaster/quick-auth`, extracts FID |
| **Farcaster context** | `src/app/page.tsx` | `sdk.context` provides `user.fid`, `user.displayName`, etc. |
| **App constants** | `src/lib/constants.ts` | All app config (name, URLs, account association) driven by env vars |
| **Farcaster manifest** | `src/app/.well-known/farcaster.json/route.ts`, `src/lib/manifest.ts` | Dynamic manifest built from constants, served at `/.well-known/farcaster.json` |
| **Embed meta tag** | `src/app/layout.tsx`, `src/lib/manifest.ts` | `fc:miniapp` meta tag built from constants |
| **E2E tests** | `e2e/smoke.spec.ts`, `e2e/api.spec.ts`, `e2e/failures.spec.ts` | 8 tests via Playwright + farcaster-test-harness |
| **Hydration guard** | `src/app/page.tsx` | `mounted` state pattern prevents SSR/client mismatch |

## Your Workflow

When asked to build a miniapp from this template:

1. **Read this file and the template code** to understand the patterns
2. **Design the app** — create a PRD at `docs/prd.md` with user stories and acceptance criteria
3. **Install Ralph** — clone into scripts/ralph:
   ```bash
   git clone https://github.com/snarktank/ralph scripts/ralph
   ```
4. **Convert PRD to Ralph format** — create `scripts/ralph/prd.json` from `docs/prd.md` following the JSON schema below
5. **Tell the user to run Ralph** — `./scripts/ralph/ralph.sh --tool claude 20`

**Do NOT implement the app yourself. Design it and create the PRD. Ralph builds it.**

### Ralph prd.json Schema

```json
{
  "featureName": "Feature Name",
  "branchName": "ralph/feature-name",
  "description": "Brief description from PRD overview",
  "userStories": [
    {
      "id": "US-001",
      "title": "Story title",
      "priority": 1,
      "acceptanceCriteria": [
        "Criterion 1",
        "Criterion 2",
        "pnpm build passes"
      ],
      "passes": false,
      "notes": "Implementation hints, file paths, patterns to follow"
    }
  ],
  "qualityChecks": {
    "typecheck": "pnpm build",
    "test": "pnpm test:e2e",
    "lint": "pnpm lint"
  },
  "techStack": {
    "framework": "Next.js 14 (App Router)",
    "testing": "Playwright + farcaster-test-harness"
  }
}
```

All stories must have `"passes": false`. Ralph marks them as it completes each one.

## Architecture Patterns

### SDK Initialization (every miniapp needs this)

```typescript
// Call ready() first, then read context
await sdk.actions.ready()
const context = await sdk.context
const fid = context?.user.fid
const displayName = context?.user.displayName
```

### Quick Auth (client-side)

```typescript
const { token } = await sdk.quickAuth.getToken({
  quickAuthServerOrigin: process.env.NEXT_PUBLIC_QUICK_AUTH_ORIGIN,
})
// Decode JWT to get FID client-side
const payload = JSON.parse(atob(token.split('.')[1]))
const fid = payload.sub
```

### Authenticated API Route (server-side)

```typescript
import { createClient } from '@farcaster/quick-auth'

const quickAuth = createClient({
  origin: process.env.NEXT_PUBLIC_QUICK_AUTH_ORIGIN || 'https://auth.farcaster.xyz',
})

// In your route handler:
const token = request.headers.get('Authorization')?.slice(7)
const domain = request.headers.get('x-forwarded-host') || new URL(request.url).host
await quickAuth.verifyJwt({ token, domain })
```

### Hydration Guard (required for any Wagmi-dependent UI)

```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => { setMounted(true) }, [])

// In JSX — only render wallet UI after mount
{mounted && isConnected ? <WalletInfo /> : mounted ? <ConnectButton /> : null}
```

Without this, Next.js SSR renders one thing, Wagmi client-side renders another → hydration error.

### Wallet Signing

```typescript
import { useSignMessage } from 'wagmi'

const { signMessageAsync } = useSignMessage()
const signature = await signMessageAsync({ message: 'Sign this' })
```

Wagmi auto-connects in the Farcaster host. No manual connect step needed.

## Test Harness

Tests run against the **farcaster-test-harness**, which emulates the Farcaster host (Warpcast).

### Ports

| Service | Port | Purpose |
|---------|------|---------|
| Test harness | 4000 | Host emulator (loads your app in iframe) |
| Your app | 3100 | Next.js dev server (tests only — dev uses 3000) |
| Quick Auth mock | 4100 | Mock auth server (issues/verifies JWTs) |

### Harness URL Format

```
http://localhost:4000/host?url=http://localhost:3100&fixture=launcher
```

Query params:
- `url` — your app URL
- `fixture` — context fixture: `launcher` (default), `cast_embed`, `notification`
- `wallet` — `connected` (default) or `disconnected`
- `signIn` — `success` (default) or `rejected`
- `tx` — `success` (default) for transaction simulation
- `chain` — initial chain ID (default `10`)

### Fixture Data (launcher)

The `launcher` fixture provides:
- **FID**: 3621
- **Username**: testuser
- **Display Name**: Test User
- **Wallet**: `0x1234567890abcdef1234567890abcdef12345678` (checksummed by Wagmi)
- **personal_sign**: auto-approved, returns `0xmock_personal_sign_<hash>`

### Writing Tests

```typescript
import { test, expect } from '@playwright/test'

const HOST_URL = 'http://localhost:4000/host?url=http://localhost:3100&fixture=launcher'

test('example', async ({ page }) => {
  await page.goto(HOST_URL)
  // Wait for harness to reach READY (app called sdk.actions.ready())
  await expect(page.locator('#status')).toHaveText('READY', { timeout: 20000 })

  // All app assertions go through the iframe frameLocator
  const appFrame = page.frameLocator('iframe#miniapp-frame')
  await expect(appFrame.locator('[data-testid="my-element"]')).toBeVisible({ timeout: 20000 })
})
```

Key rules:
- Always wait for `#status` to be `READY` before asserting app content
- Use `page.frameLocator('iframe#miniapp-frame')` for all in-app locators
- Use `data-testid` attributes on all testable elements
- Use generous timeouts (20000ms) — Next.js cold start + SDK init takes time
- Wagmi address assertions need case-insensitive regex: `toHaveText(/0x1234.../i)`

### Playwright Config

```typescript
webServer: [
  { command: 'npx farcaster-test-harness-serve 4000', port: 4000, reuseExistingServer: true },
  { command: 'NEXT_PUBLIC_QUICK_AUTH_ORIGIN=http://localhost:4100 pnpm dev --port 3100', port: 3100, reuseExistingServer: true },
  { command: 'npx farcaster-test-harness-quick-auth 4100', port: 4100, reuseExistingServer: true, stdout: 'pipe' },
]
```

- `workers: 1` — serial execution avoids race conditions
- `retries: 1` — handles cold-start flakiness on first test
- `stdout: 'pipe'` on quick-auth server — ensures Playwright waits for readiness

## Rules

### Must Do
- Use `fc:miniapp` meta tag (NOT `fc:frame` — that's backward-compat only)
- Use `text-gray-900` on all `<input>` and `<textarea>` elements (dark text on light backgrounds)
- Show display names everywhere — never show raw FID numbers to users
- Store `displayName` alongside FID in all data models
- Use `x-forwarded-host` header for JWT domain verification (proxy/tunnel support)
- Use the `mounted` state guard on any component that uses Wagmi hooks
- Add `data-testid` attributes to all interactive/testable elements
- Extract FID from JWT `sub` field server-side — never trust client-provided FID

### Must NOT Do
- Use `fc:frame:image` or any Frames v1 meta tags
- Set `NEXT_PUBLIC_QUICK_AUTH_ORIGIN` in `.env.local` — it gets baked into builds. Only set it inline in playwright.config.ts webServer command for tests
- Show raw FIDs in the UI
- Use light-colored text on inputs (invisible on white backgrounds)
- Import `sdk.wallet.ethProvider` directly — use Wagmi's `farcasterMiniApp` connector instead
- Run tests on port 3000 (conflicts with manual `pnpm dev`)

## PRD Guidelines

When designing user stories for Ralph:

1. **Right-size stories** — each must complete in one Claude Code context window
2. **Order by dependency** — data model → API routes → UI components → pages → tests
3. **Acceptance criteria must be binary** — pass/fail, not subjective
4. **Every story ends with `pnpm build passes`** — catches TypeScript errors early
5. **Test stories reference exact test IDs and expected values** — no ambiguity
6. **Include notes with implementation hints** — reference specific files and patterns from this template
7. **Delete starter leftovers** — remove `src/app/api/hello/` and update metadata in final story

## App Configuration

All app config lives in `src/lib/constants.ts`, driven by `NEXT_PUBLIC_*` env vars with sensible defaults.
When building a new app, update the defaults in constants.ts or set env vars per environment.

Key constants:
- `APP_URL` — base URL (`NEXT_PUBLIC_URL`, defaults to `http://localhost:3000`)
- `APP_NAME` — display name (`NEXT_PUBLIC_APP_NAME`)
- `APP_DESCRIPTION` — app description (`NEXT_PUBLIC_APP_DESCRIPTION`)
- `APP_BUTTON_TITLE` — embed button text (`NEXT_PUBLIC_APP_BUTTON_TITLE`)
- `APP_ACCOUNT_ASSOCIATION` — built from 3 env vars: `NEXT_PUBLIC_ACCOUNT_ASSOCIATION_HEADER`, `_PAYLOAD`, `_SIGNATURE`
- Asset URLs default to `${APP_URL}/icon.png`, `${APP_URL}/og.png`, `${APP_URL}/splash.png`

The manifest route (`src/app/.well-known/farcaster.json/route.ts`) and embed metadata (`src/lib/manifest.ts`) both read from these constants. No hardcoded URLs.

## File Reference

```
src/
  lib/
    constants.ts      — App config: name, URLs, account association, all via env vars
    manifest.ts       — getFarcasterManifest() + getMiniAppEmbedMetadata() builders
  app/
    layout.tsx        — Root layout with Providers wrapper + fc:miniapp meta tag from manifest.ts
    providers.tsx     — WagmiProvider + QueryClientProvider ('use client')
    wagmi.ts          — Wagmi config: Base + mainnet, farcasterMiniApp connector
    page.tsx          — Demo page: SDK init, Quick Auth, Wagmi, API call
    globals.css       — Tailwind base styles
    api/hello/route.ts           — Demo authenticated API route (delete when building your app)
    .well-known/farcaster.json/route.ts — Dynamic manifest endpoint

e2e/
  smoke.spec.ts       — READY, render, context, auth, wallet tests
  api.spec.ts         — Authenticated API call test
  failures.spec.ts    — signIn=rejected, wallet=disconnected tests

playwright.config.ts  — 3 webServers, serial execution, retry config
```

## Running

```bash
pnpm dev              # Dev server on port 3000
pnpm build            # Production build (typecheck)
pnpm test:e2e         # Run e2e tests (app on 3100, harness on 4000, auth on 4100)
```
