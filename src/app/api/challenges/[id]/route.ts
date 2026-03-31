import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Platform, ChallengeStatus } from '@/generated/prisma/client'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        days: { orderBy: { dayNumber: 'asc' } },
        backlogItems: { orderBy: { order: 'asc' } },
      },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (challenge.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(challenge)
  } catch (error) {
    console.error('[GET /api/challenges/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
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
    const { title, description, status, startDate, platforms } = body

    const validPlatforms: Platform[] = ['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'NEWSLETTER', 'BLOG']
    const validStatuses: ChallengeStatus[] = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED']

    const updated = await prisma.challenge.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { name: title.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(status !== undefined && validStatuses.includes(status) ? { status } : {}),
        ...(startDate !== undefined ? { startDate: startDate ? new Date(startDate) : null } : {}),
        ...(platforms !== undefined
          ? { platforms: (platforms as string[]).filter((p) => validPlatforms.includes(p as Platform)) as Platform[] }
          : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/challenges/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
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

    await prisma.challenge.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/challenges/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
