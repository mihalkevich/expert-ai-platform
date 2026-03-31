import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const challenge = await prisma.challenge.findUnique({ where: { id: params.id } })
    if (!challenge) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (challenge.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const items = await prisma.challengeBacklogItem.findMany({
      where: { challengeId: params.id },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('[GET /api/challenges/[id]/backlog]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const challenge = await prisma.challenge.findUnique({ where: { id: params.id } })
    if (!challenge) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (challenge.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 422 })
    }

    const maxOrder = await prisma.challengeBacklogItem.aggregate({
      where: { challengeId: params.id },
      _max: { order: true },
    })

    const item = await prisma.challengeBacklogItem.create({
      data: {
        challengeId: params.id,
        title: title.trim(),
        description: description ?? null,
        kanbanStatus: 'TODO',
        order: (maxOrder._max.order ?? 0) + 1,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[POST /api/challenges/[id]/backlog]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
