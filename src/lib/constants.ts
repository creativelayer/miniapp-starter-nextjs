/** Farcaster account association (domain ownership proof) */
type AccountAssociation = {
  header: string
  payload: string
  signature: string
}

// --- App Configuration ---

/** Base URL of the application (e.g. https://myapp.vercel.app) */
export const APP_URL: string = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

/** App name displayed to users (max 32 characters) */
export const APP_NAME: string = process.env.NEXT_PUBLIC_APP_NAME || 'My Mini App'

/** Short subtitle for app store listings (max 30 characters) */
export const APP_SUBTITLE: string = process.env.NEXT_PUBLIC_APP_SUBTITLE || ''

/** App description for metadata and app store (max 170 characters) */
export const APP_DESCRIPTION: string = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'A Farcaster Mini App'

/** Primary category for app store discovery */
export const APP_PRIMARY_CATEGORY: string = process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || 'social'

/** Tags for search and discovery (max 5 tags, 20 chars each) */
export const APP_TAGS: string[] = process.env.NEXT_PUBLIC_APP_TAGS
  ? JSON.parse(process.env.NEXT_PUBLIC_APP_TAGS)
  : []

// --- Asset URLs ---

/** App icon: 1024x1024px PNG, no alpha */
export const APP_ICON_URL: string = process.env.NEXT_PUBLIC_APP_ICON_URL || `${APP_URL}/icon.png`

/** Embed/OG image: 3:2 aspect ratio, 600x400 min */
export const APP_OG_IMAGE_URL: string = process.env.NEXT_PUBLIC_APP_OG_IMAGE_URL || `${APP_URL}/og.png`

/** Splash screen image: 200x200px */
export const APP_SPLASH_URL: string = process.env.NEXT_PUBLIC_APP_SPLASH_URL || `${APP_URL}/splash.png`

/** Splash screen background color (hex) */
export const APP_SPLASH_BACKGROUND_COLOR: string = process.env.NEXT_PUBLIC_APP_SPLASH_BACKGROUND_COLOR || '#7c3aed'

// --- Button ---

/** Button text shown on embed card (max 32 characters) */
export const APP_BUTTON_TITLE: string = process.env.NEXT_PUBLIC_APP_BUTTON_TITLE || 'Open App'

// --- Webhook ---

/** Webhook URL for notification events */
export const APP_WEBHOOK_URL: string = process.env.NEXT_PUBLIC_APP_WEBHOOK_URL || `${APP_URL}/api/webhook`

// --- Account Association ---
// Generate these values using the Mini App Manifest Tool in Warpcast.
// Set them as environment variables for each deployment environment.

const header = process.env.NEXT_PUBLIC_ACCOUNT_ASSOCIATION_HEADER
const payload = process.env.NEXT_PUBLIC_ACCOUNT_ASSOCIATION_PAYLOAD
const signature = process.env.NEXT_PUBLIC_ACCOUNT_ASSOCIATION_SIGNATURE

export const APP_ACCOUNT_ASSOCIATION: AccountAssociation | undefined =
  header && payload && signature ? { header, payload, signature } : undefined

// --- Chain & Capability Requirements ---

/** Required blockchain chains (CAIP-2 identifiers, e.g. eip155:8453 for Base) */
export const APP_REQUIRED_CHAINS: string[] = process.env.NEXT_PUBLIC_APP_REQUIRED_CHAINS
  ? JSON.parse(process.env.NEXT_PUBLIC_APP_REQUIRED_CHAINS)
  : ['eip155:8453']

/** Required SDK capabilities */
export const APP_REQUIRED_CAPABILITIES: string[] = process.env.NEXT_PUBLIC_APP_REQUIRED_CAPABILITIES
  ? JSON.parse(process.env.NEXT_PUBLIC_APP_REQUIRED_CAPABILITIES)
  : ['wallet.getEthereumProvider', 'actions.ready', 'actions.signIn']
