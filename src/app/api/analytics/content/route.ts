import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getPeriodCutoff(period: string): Date {
  const now = new Date()
  const days = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - days)
  return cutoff
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') ?? '30d'
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)
    const cutoff = getPeriodCutoff(period)
    const userId = session.user.id

    const where = { userId, createdAt: { gte: cutoff } }

    const [total, jobs] = await Promise.all([
      prisma.repurposeJob.count({ where }),
      prisma.repurposeJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          inputType: true,
          inputUrl: true,
          inputContent: true,
          status: true,
          targetPlatforms: true,
          createdAt: true,
          _count: {
            select: { outputs: true },
          },
        },
      }),
    ])

    return NextResponse.json({ total, limit, offset, jobs })
  } catch (error) {
    console.error('[GET /api/analytics/content]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
