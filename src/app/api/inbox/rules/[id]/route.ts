import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rule = await prisma.autoReplyRule.findUnique({
      where: { id: params.id },
    })

    if (!rule) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (rule.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.autoReplyRule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('[DELETE /api/inbox/rules/[id]]', error)
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

    const rule = await prisma.autoReplyRule.findUnique({
      where: { id: params.id },
    })

    if (!rule) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (rule.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json() as { isActive?: boolean }

    const updated = await prisma.autoReplyRule.update({
      where: { id: params.id },
      data: {
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PATCH /api/inbox/rules/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
