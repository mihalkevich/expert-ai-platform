import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AvatarKnowledgeType } from '@/generated/prisma/client'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const avatar = await prisma.aiAvatar.findUnique({ where: { id: params.id } })
    if (!avatar) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
    }
    if (avatar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const knowledge = await prisma.avatarKnowledge.findMany({
      where: { avatarId: params.id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(knowledge)
  } catch (error) {
    console.error('[GET /api/avatar/[id]/knowledge]', error)
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

    const avatar = await prisma.aiAvatar.findUnique({ where: { id: params.id } })
    if (!avatar) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
    }
    if (avatar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, title, content, isActive } = body as {
      type?: string
      title?: string
      content?: string
      isActive?: boolean
    }

    if (!type || !Object.values(AvatarKnowledgeType).includes(type as AvatarKnowledgeType)) {
      return NextResponse.json(
        { error: `type must be one of: ${Object.values(AvatarKnowledgeType).join(', ')}` },
        { status: 422 },
      )
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'content is required' }, { status: 422 })
    }

    const item = await prisma.avatarKnowledge.create({
      data: {
        avatarId: params.id,
        type: type as AvatarKnowledgeType,
        title: title ?? null,
        content: content.trim(),
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('[POST /api/avatar/[id]/knowledge]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
