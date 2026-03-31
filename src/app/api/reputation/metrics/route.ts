import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const metrics = await prisma.reputationMetric.findMany({
      where: {
        userId: session.user.id,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'desc' },
    })

    // Aggregate totals across all records
    const totals = metrics.reduce(
      (acc, m) => ({
        commentsPosted: acc.commentsPosted + m.commentCount,
        mentionsReceived: acc.mentionsReceived + m.mentionCount,
        newFollowers: acc.newFollowers + m.followerChange,
        avgSentiment:
          metrics.length > 0 ? acc.avgSentiment + m.sentimentScore / metrics.length : 0,
      }),
      { commentsPosted: 0, mentionsReceived: 0, newFollowers: 0, avgSentiment: 0 },
    )

    return NextResponse.json({ metrics, totals })
  } catch (error) {
    console.error('[GET /api/reputation/metrics]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
