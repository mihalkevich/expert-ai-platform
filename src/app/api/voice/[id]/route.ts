import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { voiceProfileUpdateSchema } from '@/validators/voice'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const voice = await prisma.voiceProfile.findUnique({
      where: { id: params.id },
    })

    if (!voice) {
      return NextResponse.json({ error: 'Voice profile not found' }, { status: 404 })
    }

    if (voice.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(voice)
  } catch (error) {
    console.error('[GET /api/voice/[id]]', error)
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

    const voice = await prisma.voiceProfile.findUnique({
      where: { id: params.id },
    })

    if (!voice) {
      return NextResponse.json({ error: 'Voice profile not found' }, { status: 404 })
    }

    if (voice.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = voiceProfileUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 422 },
      )
    }

    const updated = await prisma.voiceProfile.update({
      where: { id: params.id },
      data: parsed.data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[PUT /api/voice/[id]]', error)
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

    const voice = await prisma.voiceProfile.findUnique({
      where: { id: params.id },
    })

    if (!voice) {
      return NextResponse.json({ error: 'Voice profile not found' }, { status: 404 })
    }

    if (voice.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.voiceProfile.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DELETE /api/voice/[id]]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
