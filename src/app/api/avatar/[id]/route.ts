import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const avatar = await prisma.aiAvatar.findUnique({
      where: { id: params.id },
      include: {
        knowledge: {
          orderBy: { createdAt: 'asc' },
        },
        conversations: {
          orderBy: { startedAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
    }

    if (avatar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(avatar)
  } catch (error) {
    console.error('[GET /api/avatar/[id]]', error)
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

    const avatar = await prisma.aiAvatar.findUnique({ where: { id: params.id } })

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
    }

    if (avatar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, greeting, boundaries, isActive, avatarUrl } = body as {
      name?: string
      greeting?: string
      boundaries?: string
      isActive?: boolean
      avatarUrl?: string
    }

    const updated = await prisma.aiAvatar.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(greeting !== undefined && { greeting }),
        ...(boundaries !== undefined && { boundaries }),
        ...(isActive !== undefined && { isActive }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/avatar/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
