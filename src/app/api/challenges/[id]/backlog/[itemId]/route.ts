import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } },
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

    const item = await prisma.challengeBacklogItem.findUnique({ where: { id: params.itemId } })
    if (!item || item.challengeId !== params.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, kanbanStatus, order } = body

    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE']

    const updated = await prisma.challengeBacklogItem.update({
      where: { id: params.itemId },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(kanbanStatus !== undefined && validStatuses.includes(kanbanStatus) ? { kanbanStatus } : {}),
        ...(order !== undefined ? { order } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/challenges/[id]/backlog/[itemId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string; itemId: string } },
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

    const item = await prisma.challengeBacklogItem.findUnique({ where: { id: params.itemId } })
    if (!item || item.challengeId !== params.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await prisma.challengeBacklogItem.delete({ where: { id: params.itemId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/challenges/[id]/backlog/[itemId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
