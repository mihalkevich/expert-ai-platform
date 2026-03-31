import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const post = await prisma.monitoredPost.findUnique({
      where: { id: params.id },
      include: {
        topicMonitor: { select: { userId: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    if (post.topicMonitor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.monitoredPost.update({
      where: { id: params.id },
      data: { status: 'SKIPPED' },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[POST /api/reputation/posts/[id]/skip]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
