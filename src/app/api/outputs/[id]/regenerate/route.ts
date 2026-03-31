import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkUsageLimit, incrementUsage } from '@/services/billing/usage'
import { getAIProvider } from '@/services/ai/factory'
import { buildVoiceSystemPrompt, buildGenericSystemPrompt } from '@/services/ai/prompts/voice-system'
import { buildLinkedInPrompt } from '@/services/ai/prompts/linkedin'
import { buildTwitterPrompt } from '@/services/ai/prompts/twitter'
import { buildInstagramPrompt } from '@/services/ai/prompts/instagram'
import { buildNewsletterPrompt } from '@/services/ai/prompts/newsletter'
import { buildBlogPrompt } from '@/services/ai/prompts/blog'
import type { Platform } from '@/lib/constants'

function buildPlatformPrompt(platform: Platform, sourceContent: string): string {
  switch (platform) {
    case 'LINKEDIN':
      return buildLinkedInPrompt(sourceContent)
    case 'TWITTER':
      return buildTwitterPrompt(sourceContent)
    case 'INSTAGRAM':
      return buildInstagramPrompt(sourceContent)
    case 'NEWSLETTER':
      return buildNewsletterPrompt(sourceContent)
    case 'BLOG':
      return buildBlogPrompt(sourceContent)
    default:
      return sourceContent
  }
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Load output + job + voice profile
    const output = await prisma.output.findUnique({
      where: { id: params.id },
      include: {
        repurposeJob: {
          include: { voiceProfile: true },
        },
      },
    })

    if (!output) {
      return NextResponse.json({ error: 'Output not found' }, { status: 404 })
    }

    if (output.repurposeJob.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check usage (counts as 1 repurpose credit)
    const userPlan = (session.user.planStatus ?? 'FREE') as import('@/lib/constants').PlanName
    const canRepurpose = await checkUsageLimit(session.user.id, userPlan)
    if (!canRepurpose) {
      return NextResponse.json(
        { error: 'Monthly usage limit reached. Please upgrade your plan.' },
        { status: 403 },
      )
    }

    const job = output.repurposeJob
    const sourceContent = job.extractedText ?? job.inputContent ?? ''

    const voiceProfile = job.voiceProfile
    const systemPrompt = voiceProfile
      ? buildVoiceSystemPrompt(voiceProfile)
      : buildGenericSystemPrompt()

    const userPrompt = buildPlatformPrompt(output.platform as Platform, sourceContent)

    const ai = getAIProvider()
    const result = await ai.generateContent({ systemPrompt, userPrompt })

    const updated = await prisma.output.update({
      where: { id: params.id },
      data: {
        content: result.content,
        editedContent: null,
        isEdited: false,
        charCount: result.content.length,
        version: { increment: 1 },
      },
    })

    await incrementUsage(session.user.id)

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[POST /api/outputs/[id]/regenerate]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
