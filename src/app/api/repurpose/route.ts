import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { repurposeCreateSchema } from '@/validators/repurpose'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PLAN_LIMITS } from '@/lib/constants'
import { checkUsageLimit, incrementUsage } from '@/services/billing/usage'
import { repurposeQueue } from '@/services/queue/repurpose.queue'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = repurposeCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 422 },
      )
    }

    const plan = (session.user.planStatus ?? 'FREE') as import('@/lib/constants').PlanName
    const canRepurpose = await checkUsageLimit(session.user.id, plan)
    if (!canRepurpose) {
      return NextResponse.json(
        { error: 'Monthly usage limit reached. Please upgrade your plan.' },
        { status: 403 },
      )
    }

    const data = parsed.data

    // Map contentType/sourceUrl to the appropriate InputType + fields
    const inputType = data.sourceUrl
      ? data.sourceUrl.includes('youtube') || data.sourceUrl.includes('youtu.be')
        ? ('YOUTUBE_URL' as const)
        : ('BLOG_URL' as const)
      : ('RAW_TEXT' as const)

    const job = await prisma.repurposeJob.create({
      data: {
        userId: session.user.id,
        voiceProfileId: data.voiceProfileId ?? null,
        inputType,
        inputContent: data.rawContent ?? null,
        inputUrl: data.sourceUrl ?? null,
        targetPlatforms: data.targetPlatforms,
        status: 'PENDING',
      },
    })

    await incrementUsage(session.user.id)

    await repurposeQueue.add('repurpose', { repurposeJobId: job.id })

    return NextResponse.json({ jobId: job.id, status: 'PENDING' }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/repurpose]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
