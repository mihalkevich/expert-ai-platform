import { z } from 'zod'

// ---------------------------------------------------------------------------
// Shared tone + metadata fields
// ---------------------------------------------------------------------------
const toneFields = {
  formalityCasual: z.number().int().min(0).max(100).optional(),
  seriousFun: z.number().int().min(0).max(100).optional(),
  technicalSimple: z.number().int().min(0).max(100).optional(),
  conciseVerbose: z.number().int().min(0).max(100).optional(),
}

const metaFields = {
  industry: z.string().max(100).optional(),
  targetAudience: z.string().max(200).optional(),
  customInstructions: z.string().max(2000).optional(),
}

// ---------------------------------------------------------------------------
// Voice profile creation
// ---------------------------------------------------------------------------
export const voiceProfileCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500).optional(),
  /**
   * List of sample texts used to capture the author's style.
   * Each sample should be a substantial piece of their own writing.
   */
  samples: z
    .array(z.string().min(10, 'Each sample must be at least 10 characters'))
    .max(20, 'Maximum 20 samples per profile')
    .optional()
    .default([]),
  ...toneFields,
  ...metaFields,
})

export type VoiceProfileCreateInput = z.infer<typeof voiceProfileCreateSchema>

// ---------------------------------------------------------------------------
// Voice profile update
// ---------------------------------------------------------------------------
export const voiceProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  samples: z
    .array(z.string().min(10, 'Each sample must be at least 10 characters'))
    .max(20)
    .optional(),
  ...toneFields,
  ...metaFields,
})

export type VoiceProfileUpdateInput = z.infer<typeof voiceProfileUpdateSchema>

// ---------------------------------------------------------------------------
// Add samples to existing profile
// ---------------------------------------------------------------------------
export const voiceProfileAddSamplesSchema = z.object({
  samples: z
    .array(z.string().min(100, 'Each sample must be at least 100 characters'))
    .min(1)
    .max(10),
})

export type VoiceProfileAddSamplesInput = z.infer<typeof voiceProfileAddSamplesSchema>

// ---------------------------------------------------------------------------
// Voice profile test / preview
// ---------------------------------------------------------------------------
export const voiceProfileTestSchema = z.object({
  text: z
    .string()
    .min(20, 'Test text must be at least 20 characters')
    .max(2000, 'Test text must be at most 2000 characters'),
  platform: z
    .enum(['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'NEWSLETTER', 'BLOG'])
    .optional()
    .default('LINKEDIN'),
})

export type VoiceProfileTestInput = z.infer<typeof voiceProfileTestSchema>

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------
export const voiceProfileListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['TRAINING', 'READY', 'FAILED']).optional(),
})

export type VoiceProfileListInput = z.infer<typeof voiceProfileListSchema>
