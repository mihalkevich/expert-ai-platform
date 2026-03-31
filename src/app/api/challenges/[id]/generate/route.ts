import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAIProvider } from '@/services/ai/factory'
import { ChallengeStatus } from '@/generated/prisma/client'

function stripMarkdownCodeFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()
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

    const challenge = await prisma.challenge.findUnique({ where: { id: params.id } })
    if (!challenge) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (challenge.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ai = getAIProvider()
    const userPrompt = `Generate a ${challenge.duration}-day challenge plan for the topic: '${challenge.name}'. Description: '${challenge.description ?? ''}'. For each day, provide: dayNumber, topic (short title), contentDraft (2-3 sentence content idea). Return as JSON array of {dayNumber, topic, contentDraft}.`

    const result = await ai.generateContent({
      systemPrompt: 'You are a content strategy assistant. Return only valid JSON.',
      userPrompt,
      maxTokens: 4096,
    })

    const cleaned = stripMarkdownCodeFences(result.content)
    let days: Array<{ dayNumber: number; topic: string; contentDraft: string }>
    try {
      days = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    // Delete existing days and recreate
    await prisma.challengeDay.deleteMany({ where: { challengeId: params.id } })

    const created = await prisma.challengeDay.createMany({
      data: days.map((d) => ({
        challengeId: params.id,
        dayNumber: d.dayNumber,
        topic: d.topic,
        contentDraft: d.contentDraft,
      })),
    })

    // Update status to DRAFT if challenge has no status yet
    if (challenge.status === ChallengeStatus.DRAFT) {
      await prisma.challenge.update({
        where: { id: params.id },
        data: { status: ChallengeStatus.DRAFT },
      })
    }

    const generatedDays = await prisma.challengeDay.findMany({
      where: { challengeId: params.id },
      orderBy: { dayNumber: 'asc' },
    })

    return NextResponse.json({ days: generatedDays, count: created.count })
  } catch (error) {
    console.error('[POST /api/challenges/[id]/generate]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
