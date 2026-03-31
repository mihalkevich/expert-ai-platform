import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { InboxItemStatus } from '@/generated/prisma/client'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const item = await prisma.inboxItem.findUnique({
      where: { id: params.id },
      include: {
        socialAccount: {
          select: { platform: true, username: true },
        },
      },
    })

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('[GET /api/inbox/[id]]', error)
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

    const item = await prisma.inboxItem.findUnique({
      where: { id: params.id },
    })

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json() as {
      status?: string
      aiDraftReply?: string
      repliedAt?: string | null
    }

    const validStatuses = ['NEW', 'AI_DRAFTED', 'REPLIED', 'IGNORED'] as const

    const updated = await prisma.inboxItem.update({
      where: { id: params.id },
      data: {
        ...(body.status && validStatuses.includes(body.status as InboxItemStatus) && {
          status: body.status as InboxItemStatus,
        }),
        ...(body.aiDraftReply !== undefined && { aiDraftReply: body.aiDraftReply }),
        ...(body.status === 'REPLIED' && { repliedAt: new Date() }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/inbox/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
