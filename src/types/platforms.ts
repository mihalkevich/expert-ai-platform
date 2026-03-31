import type { Platform } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Platform OAuth config
// ---------------------------------------------------------------------------
export interface PlatformOAuthConfig {
  platform: Platform
  clientIdEnvKey: string
  clientSecretEnvKey: string
  scopes: string[]
  authUrl: string
  tokenUrl: string
  revokeUrl?: string
}

export const PLATFORM_OAUTH_CONFIGS: Record<
  Extract<Platform, 'LINKEDIN' | 'TWITTER' | 'INSTAGRAM'>,
  PlatformOAuthConfig
> = {
  LINKEDIN: {
    platform: 'LINKEDIN',
    clientIdEnvKey: 'LINKEDIN_CLIENT_ID',
    clientSecretEnvKey: 'LINKEDIN_CLIENT_SECRET',
    scopes: ['openid', 'profile', 'email', 'w_member_social'],
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    revokeUrl: 'https://www.linkedin.com/oauth/v2/revoke',
  },
  TWITTER: {
    platform: 'TWITTER',
    clientIdEnvKey: 'TWITTER_CLIENT_ID',
    clientSecretEnvKey: 'TWITTER_CLIENT_SECRET',
    scopes: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    revokeUrl: 'https://api.twitter.com/2/oauth2/revoke',
  },
  INSTAGRAM: {
    platform: 'INSTAGRAM',
    clientIdEnvKey: 'INSTAGRAM_APP_ID',
    clientSecretEnvKey: 'INSTAGRAM_APP_SECRET',
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
    authUrl: 'https://www.facebook.com/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
  },
}

// ---------------------------------------------------------------------------
// Publishing payload shapes per platform
// ---------------------------------------------------------------------------
export interface LinkedInPostPayload {
  author: string // URN, e.g. "urn:li:person:XXXX"
  text: string
  visibility?: 'PUBLIC' | 'CONNECTIONS'
  mediaUrls?: string[]
}

export interface TwitterTweetPayload {
  text: string
  replyTo?: string
  mediaIds?: string[]
}

export interface InstagramMediaPayload {
  imageUrl?: string
  videoUrl?: string
  caption: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
}

export type PlatformPublishPayload =
  | LinkedInPostPayload
  | TwitterTweetPayload
  | InstagramMediaPayload

// ---------------------------------------------------------------------------
// Publishing result
// ---------------------------------------------------------------------------
export interface PublishResult {
  platform: Platform
  externalId: string
  url: string
  publishedAt: string
}

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------
export interface ScheduleEntry {
  contentOutputId: string
  platform: Platform
  scheduledAt: string // ISO 8601
}
