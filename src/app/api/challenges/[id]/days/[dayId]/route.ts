import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ChallengeDayStatus } from '@/generated/prisma/client'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; dayId: string } },
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

    const day = await prisma.challengeDay.findUnique({ where: { id: params.dayId } })
    if (!day || day.challengeId !== params.id) {
      return NextResponse.json({ error: 'Day not found' }, { status: 404 })
    }

    const body = await request.json()
    const { topic, contentDraft, status, publishedAt } = body

    const validStatuses: ChallengeDayStatus[] = ['PENDING', 'DRAFTED', 'PUBLISHED', 'SKIPPED']

    const updated = await prisma.challengeDay.update({
      where: { id: params.dayId },
      data: {
        ...(topic !== undefined ? { topic } : {}),
        ...(contentDraft !== undefined ? { contentDraft } : {}),
        ...(status !== undefined && validStatuses.includes(status) ? { status } : {}),
        ...(publishedAt !== undefined ? { publishedAt: publishedAt ? new Date(publishedAt) : null } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/challenges/[id]/days/[dayId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
