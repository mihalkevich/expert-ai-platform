import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getCurrentUsage } from '@/services/billing/usage'

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plan = (session.user.planStatus ?? 'FREE') as import('@/lib/constants').PlanName
    const usage = await getCurrentUsage(session.user.id, plan)

    return NextResponse.json({
      used: usage.used,
      limit: usage.limit,
      periodStart: usage.periodStart,
      periodEnd: usage.periodEnd,
      plan,
    })
  } catch (error) {
    console.error('[GET /api/usage]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
