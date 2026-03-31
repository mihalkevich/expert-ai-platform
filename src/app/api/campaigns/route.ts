import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Platform, Prisma } from '@/generated/prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = await prisma.promoCampaign.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { posts: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(campaigns)
  } catch (error) {
    console.error('[GET /api/campaigns]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
      name: string
      description?: string
      startDate?: string
      endDate?: string
      platforms?: string[]
      budget?: number
      goals?: Record<string, unknown>
    }

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const campaign = await prisma.promoCampaign.create({
      data: {
        userId: session.user.id,
        name: body.name,
        description: body.description ?? null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        platforms: (body.platforms ?? []) as Platform[],
        budget: body.budget ?? null,
        goals: (body.goals ?? {}) as unknown as Prisma.InputJsonValue,
        status: 'DRAFT',
      },
    })

    return NextResponse.json(campaign, { status: 201 })
  } catch (error) {
    console.error('[POST /api/campaigns]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
