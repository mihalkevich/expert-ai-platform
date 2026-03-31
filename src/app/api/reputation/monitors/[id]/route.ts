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

    const monitor = await prisma.topicMonitor.findUnique({
      where: { id: params.id },
      include: {
        monitoredPosts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }
    if (monitor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(monitor)
  } catch (error) {
    console.error('[GET /api/reputation/monitors/[id]]', error)
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

    const monitor = await prisma.topicMonitor.findUnique({
      where: { id: params.id },
    })

    if (!monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }
    if (monitor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { isActive, keywords, niche, commentTone, name } = body

    const updated = await prisma.topicMonitor.update({
      where: { id: params.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(keywords !== undefined && { keywords }),
        ...(niche !== undefined && { niche }),
        ...(commentTone !== undefined && { commentTone }),
        ...(name !== undefined && { name }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/reputation/monitors/[id]]', error)
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

    const monitor = await prisma.topicMonitor.findUnique({
      where: { id: params.id },
    })

    if (!monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }
    if (monitor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.topicMonitor.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/reputation/monitors/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
