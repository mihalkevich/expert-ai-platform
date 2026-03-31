import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DEV ONLY — seeds test data for the inbox module
export async function POST(_request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sampleItems = [
      {
        type: 'COMMENT' as const,
        status: 'NEW' as const,
        authorName: 'Sarah Chen',
        authorHandle: '@sarahchen',
        content: 'This is such a great post! I love how you broke down the content repurposing strategy. Can you share more about how you handle the LinkedIn format specifically?',
        sentiment: 'positive',
        priority: 2,
      },
      {
        type: 'DM' as const,
        status: 'NEW' as const,
        authorName: 'Marcus Johnson',
        authorHandle: '@marcusj',
        content: 'Hey! I saw your post about AI content tools. I run a similar SaaS and would love to explore potential partnership opportunities. Would you be open to a quick call?',
        sentiment: 'positive',
        priority: 3,
      },
      {
        type: 'MENTION' as const,
        status: 'AI_DRAFTED' as const,
        authorName: 'TechNews Daily',
        authorHandle: '@technewsdaily',
        content: 'Just featured @yourapp in our list of top AI productivity tools for 2024. Congrats on the product launch!',
        sentiment: 'positive',
        priority: 1,
        aiDraftReply: 'Thank you so much for featuring us in your list! We\'re thrilled to be recognized among the top AI productivity tools. Feel free to reach out if you\'d like to do a deeper dive into what we\'re building.',
      },
      {
        type: 'COMMENT' as const,
        status: 'NEW' as const,
        authorName: 'Alex Rodriguez',
        authorHandle: '@alexr',
        content: 'I tried using AI for content repurposing but the quality was terrible. How do you make sure the output is actually good and not just generic garbage?',
        sentiment: 'negative',
        priority: 2,
      },
      {
        type: 'COMMENT' as const,
        status: 'REPLIED' as const,
        authorName: 'Emma Williams',
        authorHandle: '@emmaw',
        content: 'This workflow saved me so much time this week. Posted 5 pieces of content from just one interview recording!',
        sentiment: 'positive',
        priority: 1,
        repliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        type: 'DM' as const,
        status: 'IGNORED' as const,
        authorName: 'Promo Bot',
        authorHandle: '@promobot123',
        content: 'Hi! Check out our amazing crypto investment opportunity. 300% returns guaranteed! Click here: [suspicious link]',
        sentiment: 'neutral',
        priority: 0,
      },
      {
        type: 'MENTION' as const,
        status: 'NEW' as const,
        authorName: 'DevMarketer',
        authorHandle: '@devmarketer',
        content: 'Using @yourapp to repurpose my YouTube videos into LinkedIn posts. The time savings are insane — what used to take 2 hours now takes 10 minutes.',
        sentiment: 'positive',
        priority: 2,
      },
      {
        type: 'COMMENT' as const,
        status: 'NEW' as const,
        authorName: 'Lisa Park',
        authorHandle: '@lisapark',
        content: 'Question: Does this work for technical content too? I write mostly about cloud architecture and I\'m worried the AI won\'t understand the nuances.',
        sentiment: 'neutral',
        priority: 1,
      },
      {
        type: 'DM' as const,
        status: 'AI_DRAFTED' as const,
        authorName: 'James O\'Brien',
        authorHandle: '@jamesobrien',
        content: 'I\'ve been following your content for a while and I think there\'s a great opportunity to collaborate on a webinar about content strategy. Would you be interested?',
        sentiment: 'positive',
        priority: 3,
        aiDraftReply: 'Hi James! Thanks for reaching out — a webinar collaboration sounds interesting! Could you tell me more about your audience size and the specific angle you have in mind? Happy to explore this further.',
      },
      {
        type: 'COMMENT' as const,
        status: 'NEW' as const,
        authorName: 'Ryan Mitchell',
        authorHandle: '@ryanm',
        content: 'Honest question: isn\'t using AI to repurpose content kind of cheating? Feels like you\'re not being authentic with your audience.',
        sentiment: 'negative',
        priority: 2,
      },
    ]

    await prisma.inboxItem.createMany({
      data: sampleItems.map((item) => ({
        ...item,
        userId: session.user.id,
      })),
    })

    return NextResponse.json({ created: sampleItems.length })
  } catch (error) {
    console.error('[POST /api/inbox/seed]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
