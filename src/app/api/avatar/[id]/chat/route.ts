import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAIProvider } from '@/services/ai/factory'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

function buildSystemPrompt(
  avatarName: string,
  greeting: string | null,
  boundaries: string | null,
  knowledge: Array<{ type: string; title: string | null; content: string }>,
): string {
  const lines: string[] = [
    `You are ${avatarName}, an AI avatar assistant.`,
  ]

  if (greeting) {
    lines.push(`Your greeting style: ${greeting}`)
  }

  if (boundaries) {
    lines.push(`Boundaries and constraints: ${boundaries}`)
  }

  if (knowledge.length > 0) {
    lines.push('\n## Knowledge Base\n')
    for (const item of knowledge) {
      const label = item.title ? `[${item.type}] ${item.title}` : `[${item.type}]`
      lines.push(`${label}:\n${item.content}\n`)
    }
  }

  lines.push('\nAnswer questions helpfully based on your knowledge base. Stay in character.')

  return lines.join('\n')
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const avatar = await prisma.aiAvatar.findUnique({
      where: { id: params.id },
      include: {
        knowledge: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!avatar) {
      return NextResponse.json({ error: 'Avatar not found' }, { status: 404 })
    }

    if (avatar.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { message, conversationId, visitorName } = body as {
      message?: string
      conversationId?: string
      visitorName?: string
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'message is required' }, { status: 422 })
    }

    const systemPrompt = buildSystemPrompt(
      avatar.name,
      avatar.greeting,
      avatar.boundaries,
      avatar.knowledge,
    )

    const aiProvider = getAIProvider()
    const result = await aiProvider.generateContent({
      systemPrompt,
      userPrompt: message.trim(),
      maxTokens: 512,
    })

    const reply = result.content

    // Load or create conversation
    let conversation = conversationId
      ? await prisma.avatarConversation.findUnique({ where: { id: conversationId } })
      : null

    const newMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    }
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    }

    if (conversation) {
      const existing = (conversation.messages as unknown) as ChatMessage[]
      const updatedMessages = ([...existing, newMessage, assistantMessage] as unknown) as import('@/generated/prisma/client').Prisma.InputJsonValue
      await prisma.avatarConversation.update({
        where: { id: conversation.id },
        data: {
          messages: updatedMessages,
        },
      })
    } else {
      const initMessages = ([newMessage, assistantMessage] as unknown) as import('@/generated/prisma/client').Prisma.InputJsonValue
      conversation = await prisma.avatarConversation.create({
        data: {
          avatarId: params.id,
          visitorName: visitorName ?? null,
          messages: initMessages,
        },
      })
    }

    return NextResponse.json({ reply, conversationId: conversation.id })
  } catch (error) {
    console.error('[POST /api/avatar/[id]/chat]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
