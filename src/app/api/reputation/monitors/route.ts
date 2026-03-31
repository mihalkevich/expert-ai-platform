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

    const monitors = await prisma.topicMonitor.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { monitoredPosts: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(monitors)
  } catch (error) {
    console.error('[GET /api/reputation/monitors]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, keywords, niche, commentTone, isActive } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required' }, { status: 422 })
    }
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'keywords must be a non-empty array' }, { status: 422 })
    }

    const monitor = await prisma.topicMonitor.create({
      data: {
        userId: session.user.id,
        name,
        keywords,
        niche: niche ?? null,
        commentTone: commentTone ?? 'helpful',
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(monitor, { status: 201 })
  } catch (error) {
    console.error('[POST /api/reputation/monitors]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
