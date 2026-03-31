import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const editSchema = z.object({
  editedContent: z.string().min(1),
})

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const output = await prisma.output.findUnique({
      where: { id: params.id },
      include: { repurposeJob: true },
    })

    if (!output) {
      return NextResponse.json({ error: 'Output not found' }, { status: 404 })
    }

    if (output.repurposeJob.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(output)
  } catch (error) {
    console.error('[GET /api/outputs/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const output = await prisma.output.findUnique({
      where: { id: params.id },
      include: { repurposeJob: true },
    })

    if (!output) {
      return NextResponse.json({ error: 'Output not found' }, { status: 404 })
    }

    if (output.repurposeJob.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = editSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 422 },
      )
    }

    const updated = await prisma.output.update({
      where: { id: params.id },
      data: {
        editedContent: parsed.data.editedContent,
        isEdited: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/outputs/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
