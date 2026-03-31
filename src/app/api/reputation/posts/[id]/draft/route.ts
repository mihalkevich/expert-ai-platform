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

    const post = await prisma.monitoredPost.findUnique({
      where: { id: params.id },
      include: {
        topicMonitor: {
          select: { userId: true, niche: true, commentTone: true },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    if (post.topicMonitor.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const niche = post.topicMonitor.niche ?? 'your industry'
    const tone = post.topicMonitor.commentTone ?? 'helpful'
    const platform = post.platform ?? 'LINKEDIN'
    const charLimit = platform === 'TWITTER' ? 300 : 500

    const ai = getAIProvider()
    const result = await ai.generateContent({
      systemPrompt: `You are an expert in ${niche}. Generate a ${tone} expert comment that adds genuine value to this post. Be concise (max ${charLimit} chars for ${platform}). Sound authentic, not promotional.`,
      userPrompt: `Post by ${post.authorName ?? 'unknown'}:\n\n${post.postContent ?? ''}`,
      maxTokens: 200,
    })

    const updated = await prisma.monitoredPost.update({
      where: { id: params.id },
      data: {
        aiComment: result.content,
        status: 'PENDING',
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[POST /api/reputation/posts/[id]/draft]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
