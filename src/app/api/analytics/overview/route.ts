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
    const cutoff = getPeriodCutoff(period)
    const userId = session.user.id

    const [
      totalRepurposes,
      periodRepurposes,
      totalOutputs,
      connectedAccounts,
      voiceProfiles,
      activeMonitors,
      challenges,
      jobsByStatus,
      outputsByPlatform,
      repurposeTrend,
    ] = await Promise.all([
      prisma.repurposeJob.count({ where: { userId } }),
      prisma.repurposeJob.count({ where: { userId, createdAt: { gte: cutoff } } }),
      prisma.output.count({ where: { repurposeJob: { userId } } }),
      prisma.socialAccount.count({ where: { userId, isActive: true } }),
      prisma.voiceProfile.count({ where: { userId } }),
      prisma.topicMonitor.count({ where: { userId, isActive: true } }),
      prisma.challenge.groupBy({
        by: ['status'],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.repurposeJob.groupBy({
        by: ['status'],
        where: { userId, createdAt: { gte: cutoff } },
        _count: { _all: true },
      }),
      prisma.output.groupBy({
        by: ['platform'],
        where: { repurposeJob: { userId, createdAt: { gte: cutoff } } },
        _count: { _all: true },
      }),
      prisma.repurposeJob.findMany({
        where: { userId, createdAt: { gte: cutoff } },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    // Group repurpose trend by day
    const trendMap: Record<string, number> = {}
    for (const job of repurposeTrend) {
      const day = job.createdAt.toISOString().split('T')[0]
      trendMap[day] = (trendMap[day] ?? 0) + 1
    }
    const trendData = Object.entries(trendMap).map(([date, count]) => ({ date, count }))

    const repurposesByStatus = jobsByStatus.map((s) => ({
      status: s.status,
      count: s._count._all,
    }))

    const repurposesByPlatform = outputsByPlatform.map((p) => ({
      platform: p.platform,
      count: p._count._all,
    }))

    const challengesByStatus = challenges.map((c) => ({
      status: c.status,
      count: c._count._all,
    }))

    return NextResponse.json({
      totalRepurposes,
      periodRepurposes,
      totalOutputs,
      connectedAccounts,
      voiceProfiles,
      activeMonitors,
      challengesByStatus,
      repurposesByStatus,
      repurposesByPlatform,
      repurposeTrend: trendData,
      period,
    })
  } catch (error) {
    console.error('[GET /api/analytics/overview]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
