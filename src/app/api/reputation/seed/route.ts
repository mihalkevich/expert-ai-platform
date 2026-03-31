import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DEV ONLY — seeds test data for the reputation module
export async function POST(_request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const monitor = await prisma.topicMonitor.create({
      data: {
        userId: session.user.id,
        name: 'AI & SaaS Growth',
        keywords: ['AI', 'SaaS', 'growth hacking', 'content marketing'],
        niche: 'AI-powered SaaS tools',
        commentTone: 'educational',
        isActive: true,
      },
    })

    const samplePosts = [
      {
        platform: 'LINKEDIN' as const,
        authorName: 'Sarah Chen',
        postContent:
          'Just launched our new AI feature after 6 months of development. The hardest part was not the code but convincing the team it was worth the investment. Lesson: data beats opinions every time.',
        postUrl: 'https://linkedin.com/posts/sarah-chen-123',
        relevanceScore: 0.92,
        status: 'PENDING' as const,
      },
      {
        platform: 'TWITTER' as const,
        authorName: 'DevOps Dave',
        postContent:
          'Hot take: Most SaaS companies are over-engineering their AI integrations. A simple GPT wrapper with good prompts beats custom models 90% of the time.',
        postUrl: 'https://twitter.com/devopsdave/status/123456',
        relevanceScore: 0.85,
        status: 'PENDING' as const,
        aiComment:
          'Totally agree — prompting is an underrated skill. We cut our AI costs by 60% just by refining our prompts before ever touching fine-tuning.',
      },
      {
        platform: 'LINKEDIN' as const,
        authorName: 'Maria Johansson',
        postContent:
          'Content marketing in 2024 is all about consistency over perfection. Posted every day for 30 days — follower growth was 3x what I expected.',
        postUrl: 'https://linkedin.com/posts/maria-j-789',
        relevanceScore: 0.78,
        status: 'COMMENTED' as const,
        aiComment:
          'The compounding effect of consistency is real. We saw similar results — the 30-day mark is where the algorithm starts to reward you.',
        commentedAt: new Date(),
      },
      {
        platform: 'TWITTER' as const,
        authorName: 'ProdHunt Weekly',
        postContent:
          'Which AI writing tool is winning in 2024? Drop your pick in the replies. Our community survey closes Friday.',
        postUrl: 'https://twitter.com/prodhunt/status/789012',
        relevanceScore: 0.65,
        status: 'SKIPPED' as const,
      },
      {
        platform: 'LINKEDIN' as const,
        authorName: 'Alex Ivanov',
        postContent:
          'Repurposing content is not lazy — it is smart distribution. One long-form piece can yield 10 tweets, 3 carousels, and 2 newsletters. Stop starting from scratch.',
        postUrl: 'https://linkedin.com/posts/alex-ivanov-456',
        relevanceScore: 0.95,
        status: 'PENDING' as const,
      },
    ]

    await prisma.monitoredPost.createMany({
      data: samplePosts.map((p) => ({
        ...p,
        topicMonitorId: monitor.id,
      })),
    })

    return NextResponse.json({ monitorId: monitor.id, postsCreated: samplePosts.length })
  } catch (error) {
    console.error('[POST /api/reputation/seed]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
