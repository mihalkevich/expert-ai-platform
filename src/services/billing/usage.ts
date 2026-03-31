import { prisma } from '@/lib/prisma'
import { PLAN_LIMITS } from '@/lib/constants'
import type { PlanName } from '@/lib/constants'

function getBillingPeriod(): { periodStart: Date; periodEnd: Date } {
  const now = new Date()
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { periodStart, periodEnd }
}

/**
 * Returns true if the user has not yet reached their monthly repurpose limit.
 */
export async function checkUsageLimit(userId: string, plan: PlanName): Promise<boolean> {
  const limit = PLAN_LIMITS[plan].repurposesPerMonth

  // -1 means unlimited
  if (limit === -1) return true

  const { periodStart, periodEnd } = getBillingPeriod()

  const record = await prisma.usageRecord.aggregate({
    where: {
      userId,
      feature: 'repurpose',
      recordedAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    _sum: {
      quantity: true,
    },
  })

  const used = record._sum.quantity ?? 0
  return used < limit
}

/**
 * Increments the repurpose usage count for the current billing period.
 */
export async function incrementUsage(userId: string): Promise<void> {
  await prisma.usageRecord.create({
    data: {
      userId,
      feature: 'repurpose',
      quantity: 1,
    },
  })
}

/**
 * Returns the current usage stats for a user.
 */
export async function getCurrentUsage(
  userId: string,
  plan: PlanName,
): Promise<{ used: number; limit: number; periodStart: Date; periodEnd: Date }> {
  const { periodStart, periodEnd } = getBillingPeriod()
  const limit = PLAN_LIMITS[plan].repurposesPerMonth

  const record = await prisma.usageRecord.aggregate({
    where: {
      userId,
      feature: 'repurpose',
      recordedAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    _sum: {
      quantity: true,
    },
  })

  return {
    used: record._sum.quantity ?? 0,
    limit,
    periodStart,
    periodEnd,
  }
}
