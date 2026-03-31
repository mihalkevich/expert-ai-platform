import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAIProvider } from '@/services/ai/factory'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const item = await prisma.inboxItem.findUnique({
      where: { id: params.id },
    })

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (item.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const voiceProfile = await prisma.voiceProfile.findFirst({
      where: { userId: session.user.id },
    })

    const voiceContext = voiceProfile
      ? `Voice profile: ${voiceProfile.name}. Industry: ${voiceProfile.industry ?? 'general'}. Target audience: ${voiceProfile.targetAudience ?? 'general'}. Custom instructions: ${voiceProfile.customInstructions ?? 'none'}.`
      : ''

    const ai = getAIProvider()
    const result = await ai.generateContent({
      systemPrompt: `Generate a helpful, authentic reply in the user's voice. ${voiceContext}`,
      userPrompt: `${item.type} from ${item.authorName ?? item.authorHandle ?? 'someone'}:\n\n${item.content}`,
      maxTokens: 300,
    })

    const updated = await prisma.inboxItem.update({
      where: { id: params.id },
      data: {
        aiDraftReply: result.content,
        status: 'AI_DRAFTED',
      },
    })

    return NextResponse.json({ draft: updated.aiDraftReply })
  } catch (error) {
    console.error('[POST /api/inbox/[id]/draft]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
