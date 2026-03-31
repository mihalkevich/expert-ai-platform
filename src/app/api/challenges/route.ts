import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Platform, ChallengeStatus } from '@/generated/prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const challenges = await prisma.challenge.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { days: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(challenges)
  } catch (error) {
    console.error('[GET /api/challenges]', error)
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
    const { title, description, duration, platforms } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'title is required' }, { status: 422 })
    }
    if (![7, 14, 30].includes(duration)) {
      return NextResponse.json({ error: 'duration must be 7, 14, or 30' }, { status: 422 })
    }
    const validPlatforms: Platform[] = ['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'NEWSLETTER', 'BLOG']
    const platformList: Platform[] = (platforms ?? []).filter((p: string) =>
      validPlatforms.includes(p as Platform),
    )

    const challenge = await prisma.challenge.create({
      data: {
        userId: session.user.id,
        name: title.trim(),
        description: description ?? null,
        duration,
        status: ChallengeStatus.DRAFT,
        platforms: platformList,
      },
    })

    return NextResponse.json(challenge, { status: 201 })
  } catch (error) {
    console.error('[POST /api/challenges]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
