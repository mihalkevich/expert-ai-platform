import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { voiceProfileCreateSchema } from '@/validators/voice'
import { PLAN_LIMITS } from '@/lib/constants'

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const voices = await prisma.voiceProfile.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(voices)
  } catch (error) {
    console.error('[GET /api/voice]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plan = (session.user.planStatus ?? 'FREE') as import('@/lib/constants').PlanName
    const voiceLimit = PLAN_LIMITS[plan].voiceProfiles

    // Only PRO+ plans can create voice profiles (FREE = 0)
    if (voiceLimit === 0) {
      return NextResponse.json(
        { error: 'Voice profiles require a PRO plan or higher.' },
        { status: 403 },
      )
    }

    // Check count limit (skip if unlimited)
    if (voiceLimit !== -1) {
      const count = await prisma.voiceProfile.count({
        where: { userId: session.user.id },
      })
      if (count >= voiceLimit) {
        return NextResponse.json(
          { error: `Voice profile limit reached (${voiceLimit} for your plan).` },
          { status: 403 },
        )
      }
    }

    const body = await request.json()
    const parsed = voiceProfileCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 422 },
      )
    }

    const {
      name,
      samples,
      formalityCasual,
      seriousFun,
      technicalSimple,
      conciseVerbose,
      industry,
      targetAudience,
      customInstructions,
    } = parsed.data

    const voice = await prisma.voiceProfile.create({
      data: {
        userId: session.user.id,
        name,
        sampleTexts: samples ?? [],
        ...(formalityCasual !== undefined && { formalityCasual }),
        ...(seriousFun !== undefined && { seriousFun }),
        ...(technicalSimple !== undefined && { technicalSimple }),
        ...(conciseVerbose !== undefined && { conciseVerbose }),
        ...(industry !== undefined && { industry }),
        ...(targetAudience !== undefined && { targetAudience }),
        ...(customInstructions !== undefined && { customInstructions }),
      },
    })

    return NextResponse.json(voice, { status: 201 })
  } catch (error) {
    console.error('[POST /api/voice]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
