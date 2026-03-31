import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AvatarKnowledgeType } from '@/generated/prisma/client'

async function resolveItem(avatarId: string, itemId: string, userId: string) {
  const avatar = await prisma.aiAvatar.findUnique({ where: { id: avatarId } })
  if (!avatar) return { error: 'Avatar not found', status: 404 }
  if (avatar.userId !== userId) return { error: 'Forbidden', status: 403 }

  const item = await prisma.avatarKnowledge.findUnique({ where: { id: itemId } })
  if (!item || item.avatarId !== avatarId) return { error: 'Knowledge item not found', status: 404 }

  return { item }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; itemId: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolved = await resolveItem(params.id, params.itemId, session.user.id)
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    const body = await request.json()
    const { type, title, content, isActive } = body as {
      type?: string
      title?: string
      content?: string
      isActive?: boolean
    }

    if (type !== undefined && !Object.values(AvatarKnowledgeType).includes(type as AvatarKnowledgeType)) {
      return NextResponse.json(
        { error: `type must be one of: ${Object.values(AvatarKnowledgeType).join(', ')}` },
        { status: 422 },
      )
    }

    const updated = await prisma.avatarKnowledge.update({
      where: { id: params.itemId },
      data: {
        ...(type !== undefined && { type: type as AvatarKnowledgeType }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/avatar/[id]/knowledge/[itemId]]', error)
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

    const resolved = await resolveItem(params.id, params.itemId, session.user.id)
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }

    await prisma.avatarKnowledge.delete({ where: { id: params.itemId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/avatar/[id]/knowledge/[itemId]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
