import {
  APP_ACCOUNT_ASSOCIATION,
  APP_BUTTON_TITLE,
  APP_DESCRIPTION,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_PRIMARY_CATEGORY,
  APP_REQUIRED_CAPABILITIES,
  APP_REQUIRED_CHAINS,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_SPLASH_URL,
  APP_SUBTITLE,
  APP_TAGS,
  APP_URL,
  APP_WEBHOOK_URL,
} from './constants'

/**
 * Build the manifest served at /.well-known/farcaster.json
 * See: https://miniapps.farcaster.xyz/docs/guides/publishing
 */
export function getFarcasterManifest() {
  return {
    accountAssociation: APP_ACCOUNT_ASSOCIATION ?? {
      header: '',
      payload: '',
      signature: '',
    },
    miniapp: {
      version: '1',
      name: APP_NAME,
      homeUrl: APP_URL,
      iconUrl: APP_ICON_URL,
      splashImageUrl: APP_SPLASH_URL,
      splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      webhookUrl: APP_WEBHOOK_URL,
      subtitle: APP_SUBTITLE,
      description: APP_DESCRIPTION,
      primaryCategory: APP_PRIMARY_CATEGORY,
      tags: APP_TAGS,
      requiredChains: APP_REQUIRED_CHAINS,
      requiredCapabilities: APP_REQUIRED_CAPABILITIES,
    },
  }
}

/**
 * Build the fc:miniapp embed metadata for the layout <meta> tag.
 * See: https://miniapps.farcaster.xyz/docs/guides/sharing
 */
export function getMiniAppEmbedMetadata(overrides?: { imageUrl?: string; url?: string }) {
  return {
    version: '1',
    imageUrl: overrides?.imageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TITLE,
      action: {
        type: 'launch_miniapp' as const,
        name: APP_NAME,
        url: overrides?.url ?? APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      },
    },
  }
}
