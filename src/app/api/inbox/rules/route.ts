import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Platform } from '@/generated/prisma/client'

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rules = await prisma.autoReplyRule.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error('[GET /api/inbox/rules]', error)
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
      triggerKeywords: string[]
      replyTemplate: string
      platform?: string
      tone?: string
      isActive?: boolean
    }

    if (!body.name || !body.replyTemplate) {
      return NextResponse.json({ error: 'name and replyTemplate are required' }, { status: 400 })
    }

    const validPlatforms = ['LINKEDIN', 'TWITTER', 'INSTAGRAM', 'NEWSLETTER', 'BLOG'] as const

    const rule = await prisma.autoReplyRule.create({
      data: {
        userId: session.user.id,
        name: body.name,
        triggerKeywords: body.triggerKeywords ?? [],
        replyTemplate: body.replyTemplate,
        tone: body.tone,
        isActive: body.isActive ?? true,
        ...(body.platform && validPlatforms.includes(body.platform as Platform) && {
          platform: body.platform as Platform,
        }),
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error('[POST /api/inbox/rules]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
