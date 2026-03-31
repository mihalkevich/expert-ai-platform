import { z } from 'zod'

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// ---------------------------------------------------------------------------
// ID params
// ---------------------------------------------------------------------------
export const idParamSchema = z.object({
  id: z.string().cuid(),
})

export type IdParamInput = z.infer<typeof idParamSchema>

// ---------------------------------------------------------------------------
// Date range
// ---------------------------------------------------------------------------
export const dateRangeSchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to)
      }
      return true
    },
    { message: '"from" must be before or equal to "to"', path: ['from'] },
  )

export type DateRangeInput = z.infer<typeof dateRangeSchema>

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------
export const emailSchema = z
  .string()
  .email('Must be a valid email address')
  .toLowerCase()
  .trim()

// ---------------------------------------------------------------------------
// Team invite
// ---------------------------------------------------------------------------
export const teamInviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['MEMBER', 'VIEWER'] as const, {
    error: () => ({ message: 'Role must be MEMBER or VIEWER' }),
  }),
})

export type TeamInviteInput = z.infer<typeof teamInviteSchema>

// ---------------------------------------------------------------------------
// Team member role update
// ---------------------------------------------------------------------------
export const teamMemberUpdateSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
})

export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>

// ---------------------------------------------------------------------------
// API key creation
// ---------------------------------------------------------------------------
export const apiKeyCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  expiresAt: z
    .string()
    .datetime()
    .optional()
    .refine((v) => (v ? new Date(v) > new Date() : true), {
      message: 'Expiry date must be in the future',
    }),
})

export type ApiKeyCreateInput = z.infer<typeof apiKeyCreateSchema>

// ---------------------------------------------------------------------------
// Generic search query
// ---------------------------------------------------------------------------
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type SearchQueryInput = z.infer<typeof searchQuerySchema>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Parse and validate request body (or search params object) against a Zod schema.
 * Returns { data } on success or throws a ZodError.
 */
export function parseBody<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> {
  return schema.parse(input)
}

/**
 * Safe variant — returns null instead of throwing on validation failure.
 */
export function safeParseBody<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.infer<T> | null {
  const result = schema.safeParse(input)
  return result.success ? result.data : null
}
