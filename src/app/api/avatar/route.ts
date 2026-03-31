import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const avatar = await prisma.aiAvatar.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(avatar)
  } catch (error) {
    console.error('[GET /api/avatar]', error)
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
    const { name, greeting, boundaries, isActive, avatarUrl } = body as {
      name?: string
      greeting?: string
      boundaries?: string
      isActive?: boolean
      avatarUrl?: string
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 422 })
    }

    const avatar = await prisma.aiAvatar.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        greeting: greeting ?? null,
        boundaries: boundaries ?? null,
        isActive: isActive ?? false,
        avatarUrl: avatarUrl ?? null,
      },
    })

    return NextResponse.json(avatar, { status: 201 })
  } catch (error) {
    console.error('[POST /api/avatar]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
