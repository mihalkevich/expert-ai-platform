import type { Platform, ContentType, PlanName } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Generic response wrappers
// ---------------------------------------------------------------------------
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
  code?: string
  details?: Record<string, string[]>
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  meta: PaginationMeta
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface SessionUser {
  id: string
  email: string
  name: string | null
  image: string | null
  plan: PlanName
  organizationId: string | null
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
}

// ---------------------------------------------------------------------------
// Content / Repurpose
// ---------------------------------------------------------------------------
export interface RepurposeRequest {
  title?: string
  rawContent?: string
  sourceUrl?: string
  contentType: ContentType
  targetPlatforms: Platform[]
  voiceProfileId?: string
  tone?: string
  instructions?: string
}

export interface RepurposeJobStatus {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number
  outputs: ContentOutput[]
  error?: string
  createdAt: string
  updatedAt: string
}

export interface ContentOutput {
  id: string
  platform: Platform
  content: string
  characterCount: number
  approved: boolean
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
}

export interface ContentItem {
  id: string
  title: string | null
  contentType: ContentType
  rawContent: string | null
  sourceUrl: string | null
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  outputs: ContentOutput[]
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Voice profiles
// ---------------------------------------------------------------------------
export interface VoiceProfile {
  id: string
  name: string
  description: string | null
  sampleCount: number
  status: 'TRAINING' | 'READY' | 'FAILED'
  createdAt: string
}

export interface VoiceProfileCreateRequest {
  name: string
  description?: string
  samples: string[] // base64 audio or URLs
}

// ---------------------------------------------------------------------------
// Social accounts
// ---------------------------------------------------------------------------
export interface SocialAccount {
  id: string
  platform: Platform
  handle: string
  displayName: string | null
  avatarUrl: string | null
  connected: boolean
  connectedAt: string
}

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------
export interface BillingPortalRequest {
  returnUrl: string
}

export interface CheckoutRequest {
  planId: PlanName
  successUrl: string
  cancelUrl: string
}

export interface CheckoutResponse {
  url: string
}

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------
export interface UsageStats {
  repurposesUsed: number
  repurposesLimit: number
  socialAccountsUsed: number
  socialAccountsLimit: number
  voiceProfilesUsed: number
  voiceProfilesLimit: number
  aiEmployeesUsed: number
  aiEmployeesLimit: number
  periodStart: string
  periodEnd: string
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------
export interface TeamMember {
  id: string
  userId: string
  name: string | null
  email: string
  image: string | null
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
  joinedAt: string
}

export interface TeamInviteRequest {
  email: string
  role: 'MEMBER' | 'VIEWER'
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------
export interface AnalyticsSummary {
  totalContent: number
  totalOutputs: number
  totalPublished: number
  engagementRate: number
  topPlatform: Platform | null
  periodStart: string
  periodEnd: string
}

export interface PlatformAnalytics {
  platform: Platform
  published: number
  scheduled: number
  engagement: number
}
