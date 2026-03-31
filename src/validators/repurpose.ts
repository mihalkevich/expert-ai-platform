import { z } from 'zod'
import { PLATFORMS, CONTENT_TYPES } from '@/lib/constants'

// ---------------------------------------------------------------------------
// Repurpose creation
// ---------------------------------------------------------------------------
export const repurposeCreateSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    rawContent: z.string().min(10).max(50_000).optional(),
    sourceUrl: z.string().url('Must be a valid URL').optional(),
    contentType: z.enum(CONTENT_TYPES),
    targetPlatforms: z
      .array(z.enum(PLATFORMS))
      .min(1, 'Select at least one target platform')
      .max(PLATFORMS.length),
    voiceProfileId: z.string().cuid().optional(),
    tone: z
      .enum(['professional', 'casual', 'inspirational', 'educational', 'humorous'])
      .optional(),
    instructions: z.string().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    const requiresUrl: typeof CONTENT_TYPES[number][] = ['VIDEO', 'PODCAST', 'ARTICLE']
    if (requiresUrl.includes(data.contentType) && !data.sourceUrl && !data.rawContent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide either a source URL or raw content for this content type.',
        path: ['sourceUrl'],
      })
    }
    if (data.contentType === 'MANUAL' && !data.rawContent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Raw content is required for manual input.',
        path: ['rawContent'],
      })
    }
  })

export type RepurposeCreateInput = z.infer<typeof repurposeCreateSchema>

// ---------------------------------------------------------------------------
// Output regeneration
// ---------------------------------------------------------------------------
export const regenerateOutputSchema = z.object({
  platform: z.enum(PLATFORMS),
  instructions: z.string().max(1000).optional(),
  tone: z
    .enum(['professional', 'casual', 'inspirational', 'educational', 'humorous'])
    .optional(),
})

export type RegenerateOutputInput = z.infer<typeof regenerateOutputSchema>

// ---------------------------------------------------------------------------
// Output approval / scheduling
// ---------------------------------------------------------------------------
export const approveOutputSchema = z.object({
  approved: z.boolean(),
})

export const scheduleOutputSchema = z.object({
  scheduledAt: z
    .string()
    .datetime({ message: 'Must be a valid ISO 8601 date-time' })
    .refine((v) => new Date(v) > new Date(), {
      message: 'Scheduled time must be in the future',
    }),
})

export type ScheduleOutputInput = z.infer<typeof scheduleOutputSchema>

// ---------------------------------------------------------------------------
// List / filter
// ---------------------------------------------------------------------------
export const repurposeListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
    .optional(),
  contentType: z.enum(CONTENT_TYPES).optional(),
  platform: z.enum(PLATFORMS).optional(),
  search: z.string().max(200).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export type RepurposeListInput = z.infer<typeof repurposeListSchema>
