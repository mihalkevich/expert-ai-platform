// ---------------------------------------------------------------------------
// Plan limits  (-1 = unlimited)
// ---------------------------------------------------------------------------
export const PLAN_LIMITS = {
  FREE: {
    repurposesPerMonth: 5,
    socialAccounts: 0,
    voiceProfiles: 0,
    aiEmployees: 0,
  },
  PRO: {
    repurposesPerMonth: 100,
    socialAccounts: 3,
    voiceProfiles: 5,
    aiEmployees: 0,
  },
  EXPERT: {
    repurposesPerMonth: -1,
    socialAccounts: 10,
    voiceProfiles: -1,
    aiEmployees: 0,
  },
  BUSINESS: {
    repurposesPerMonth: -1,
    socialAccounts: -1,
    voiceProfiles: -1,
    aiEmployees: 5,
  },
  ENTERPRISE: {
    repurposesPerMonth: -1,
    socialAccounts: -1,
    voiceProfiles: -1,
    aiEmployees: -1,
  },
} as const

export type PlanName = keyof typeof PLAN_LIMITS

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------
export const PLATFORMS = [
  'LINKEDIN',
  'TWITTER',
  'INSTAGRAM',
  'NEWSLETTER',
  'BLOG',
] as const

export type Platform = (typeof PLATFORMS)[number]

export const PLATFORM_LABELS: Record<Platform, string> = {
  LINKEDIN: 'LinkedIn',
  TWITTER: 'X / Twitter',
  INSTAGRAM: 'Instagram',
  NEWSLETTER: 'Newsletter',
  BLOG: 'Blog',
} as const

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  LINKEDIN: 3000,
  TWITTER: 280,
  INSTAGRAM: 2200,
  NEWSLETTER: 5000,
  BLOG: 10000,
} as const

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------
export const CONTENT_TYPES = [
  'VIDEO',
  'PODCAST',
  'ARTICLE',
  'TWITTER_THREAD',
  'LINKEDIN_POST',
  'MANUAL',
] as const

export type ContentType = (typeof CONTENT_TYPES)[number]

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  VIDEO: 'Video',
  PODCAST: 'Podcast',
  ARTICLE: 'Article',
  TWITTER_THREAD: 'Twitter Thread',
  LINKEDIN_POST: 'LinkedIn Post',
  MANUAL: 'Manual Input',
} as const

// ---------------------------------------------------------------------------
// AI Models
// ---------------------------------------------------------------------------
export const AI_MODELS = {
  GPT_4O: 'gpt-4o',
  GPT_4O_MINI: 'gpt-4o-mini',
  CLAUDE_SONNET: 'claude-3-5-sonnet-20241022',
  CLAUDE_HAIKU: 'claude-3-5-haiku-20241022',
} as const

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS]

// ---------------------------------------------------------------------------
// Queue / jobs
// ---------------------------------------------------------------------------
export const QUEUE_NAMES = {
  REPURPOSE: 'repurpose',
  VOICE_CLONE: 'voice-clone',
  SOCIAL_PUBLISH: 'social-publish',
  EMAIL_CAMPAIGN: 'email-campaign',
} as const

// ---------------------------------------------------------------------------
// Stripe price IDs (override via env)
// ---------------------------------------------------------------------------
export const STRIPE_PRICE_IDS: Record<Exclude<PlanName, 'FREE'>, string> = {
  PRO: process.env.STRIPE_PRICE_PRO ?? '',
  EXPERT: process.env.STRIPE_PRICE_EXPERT ?? '',
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS ?? '',
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE ?? '',
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------
export const APP_NAME = 'ContentRepurposer'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
export const SUPPORT_EMAIL = 'support@contentrepurposer.com'

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 20,
  maxLimit: 100,
} as const
