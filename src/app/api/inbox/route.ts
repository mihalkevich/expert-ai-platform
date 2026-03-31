import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { InboxItemStatus, InboxItemType } from '@/generated/prisma/client'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const typeParam = searchParams.get('type')
    const platformParam = searchParams.get('platform')

    const validStatuses = ['NEW', 'AI_DRAFTED', 'REPLIED', 'IGNORED'] as const
    const validTypes = ['COMMENT', 'DM', 'MENTION'] as const

    const statusFilter =
      statusParam && validStatuses.includes(statusParam as InboxItemStatus)
        ? (statusParam as InboxItemStatus)
        : undefined

    const typeFilter =
      typeParam && validTypes.includes(typeParam as InboxItemType)
        ? (typeParam as InboxItemType)
        : undefined

    const items = await prisma.inboxItem.findMany({
      where: {
        userId: session.user.id,
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(platformParam && {
          socialAccount: { platform: platformParam as never },
        }),
      },
      include: {
        socialAccount: {
          select: { platform: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('[GET /api/inbox]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { ids: string[]; status: string }
    const { ids, status } = body

    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json({ error: 'ids and status are required' }, { status: 400 })
    }

    const validStatuses = ['NEW', 'AI_DRAFTED', 'REPLIED', 'IGNORED'] as const
    if (!validStatuses.includes(status as InboxItemStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await prisma.inboxItem.updateMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
      data: {
        status: status as InboxItemStatus,
        ...(status === 'REPLIED' && { repliedAt: new Date() }),
      },
    })

    return NextResponse.json({ updated: ids.length })
  } catch (error) {
    console.error('[PATCH /api/inbox]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
