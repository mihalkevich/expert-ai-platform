import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { extractFromUrl } from '@/services/content/extractor'
import { extractYouTubeTranscript } from '@/services/content/youtube'

const extractSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['blog', 'youtube']),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = extractSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 422 },
      )
    }

    const { url, type } = parsed.data

    if (type === 'youtube') {
      const extracted = await extractYouTubeTranscript(url)
      const wordCount = extracted.transcript.split(/\s+/).filter(Boolean).length
      return NextResponse.json({
        title: extracted.title,
        content: extracted.transcript,
        wordCount,
      })
    }

    // blog
    const extracted = await extractFromUrl(url)
    const wordCount = extracted.content.split(/\s+/).filter(Boolean).length
    return NextResponse.json({
      title: extracted.title,
      content: extracted.content,
      wordCount,
    })
  } catch (error) {
    console.error('[POST /api/content/extract]', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
