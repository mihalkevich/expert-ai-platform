import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const monitorId = searchParams.get('monitorId')

    // Get all monitors belonging to this user
    const userMonitors = await prisma.topicMonitor.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })
    const monitorIds = userMonitors.map((m) => m.id)

    const validStatuses = ['PENDING', 'COMMENTED', 'SKIPPED', 'FAILED'] as const
    type PostStatus = typeof validStatuses[number]

    const posts = await prisma.monitoredPost.findMany({
      where: {
        topicMonitorId: monitorId
          ? monitorId
          : { in: monitorIds },
        ...(statusParam && validStatuses.includes(statusParam as PostStatus) && {
          status: statusParam as PostStatus,
        }),
      },
      include: {
        topicMonitor: {
          select: { name: true, niche: true, commentTone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('[GET /api/reputation/posts]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
