import { Worker, type Job } from 'bullmq'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { getAIProvider } from '@/services/ai/factory'
import {
  buildVoiceSystemPrompt,
  buildGenericSystemPrompt,
} from '@/services/ai/prompts/voice-system'
import { buildLinkedInPrompt } from '@/services/ai/prompts/linkedin'
import { buildTwitterPrompt } from '@/services/ai/prompts/twitter'
import { buildInstagramPrompt } from '@/services/ai/prompts/instagram'
import { buildNewsletterPrompt } from '@/services/ai/prompts/newsletter'
import { buildBlogPrompt } from '@/services/ai/prompts/blog'
import { extractFromUrl } from '@/services/content/extractor'
import { extractYouTubeTranscript } from '@/services/content/youtube'
import { sanitizeContent } from '@/services/content/sanitizer'
import type { RepurposeJobData } from './repurpose.queue'

type Platform = 'LINKEDIN' | 'TWITTER' | 'INSTAGRAM' | 'NEWSLETTER' | 'BLOG'
type InputType =
  | 'RAW_TEXT'
  | 'BLOG_URL'
  | 'YOUTUBE_URL'
  | 'AUDIO_UPLOAD'
  | 'VIDEO_UPLOAD'

function buildPlatformPrompt(
  platform: Platform,
  sourceContent: string,
): string {
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
    default: {
      const _exhaustive: never = platform
      return buildLinkedInPrompt(sourceContent)
    }
  }
}

function parseTwitterOutput(raw: string): string {
  // The Twitter prompt asks for a JSON array — attempt to parse and re-serialize
  try {
    // Strip potential markdown fences
    const cleaned = raw
      .replace(/^```(?:json)?\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim()
    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) {
      return parsed.join('\n')
    }
  } catch {
    // Not parseable — return raw content
  }
  return raw
}

async function processRepurposeJob(job: Job<RepurposeJobData>): Promise<void> {
  const startedAt = Date.now()
  const { repurposeJobId } = job.data

  // 1. Load the job and voice profile from DB
  const repurposeJob = await prisma.repurposeJob.findUnique({
    where: { id: repurposeJobId },
    include: { voiceProfile: true },
  })

  if (!repurposeJob) {
    throw new Error(`RepurposeJob not found: ${repurposeJobId}`)
  }

  const inputType = repurposeJob.inputType as InputType
  const platforms = repurposeJob.targetPlatforms as Platform[]

  // 2. Extract content if needed
  let sourceContent = repurposeJob.inputContent ?? ''

  if (inputType === 'BLOG_URL' && repurposeJob.inputUrl) {
    await prisma.repurposeJob.update({
      where: { id: repurposeJobId },
      data: { status: 'EXTRACTING' },
    })

    const extracted = await extractFromUrl(repurposeJob.inputUrl)
    sourceContent = sanitizeContent(
      `${extracted.title}\n\n${extracted.content}`,
    )

    await prisma.repurposeJob.update({
      where: { id: repurposeJobId },
      data: { extractedText: sourceContent },
    })
  } else if (inputType === 'YOUTUBE_URL' && repurposeJob.inputUrl) {
    await prisma.repurposeJob.update({
      where: { id: repurposeJobId },
      data: { status: 'EXTRACTING' },
    })

    const extracted = await extractYouTubeTranscript(repurposeJob.inputUrl)
    sourceContent = sanitizeContent(
      `${extracted.title}\n\n${extracted.transcript}`,
    )

    await prisma.repurposeJob.update({
      where: { id: repurposeJobId },
      data: { extractedText: sourceContent },
    })
  } else if (repurposeJob.extractedText) {
    sourceContent = repurposeJob.extractedText
  }

  if (!sourceContent) {
    throw new Error('No source content available for processing')
  }

  // 3. Update status to GENERATING
  await prisma.repurposeJob.update({
    where: { id: repurposeJobId },
    data: { status: 'GENERATING' },
  })

  // 4. Build voice system prompt
  const systemPrompt = repurposeJob.voiceProfile
    ? buildVoiceSystemPrompt(repurposeJob.voiceProfile)
    : buildGenericSystemPrompt()

  const ai = getAIProvider()

  // 5. Generate content for each platform in parallel
  const platformResults = await Promise.allSettled(
    platforms.map(async (platform) => {
      const userPrompt = buildPlatformPrompt(platform, sourceContent)

      const response = await ai.generateContent({
        systemPrompt,
        userPrompt,
        maxTokens: 2048,
        temperature: 0.7,
      })

      let content = response.content
      if (platform === 'TWITTER') {
        content = parseTwitterOutput(content)
      }

      await prisma.output.create({
        data: {
          repurposeJobId,
          platform,
          content,
          charCount: content.length,
          metadata: {
            tokensUsed: response.tokensUsed,
            finishReason: response.finishReason,
          },
        },
      })

      return { platform, tokensUsed: response.tokensUsed }
    }),
  )

  // 6. Determine final status
  const succeeded = platformResults.filter((r) => r.status === 'fulfilled')
  const failed = platformResults.filter((r) => r.status === 'rejected')

  const totalTokens = succeeded.reduce((sum, r) => {
    if (r.status === 'fulfilled') {
      return sum + (r.value as { tokensUsed: number }).tokensUsed
    }
    return sum
  }, 0)

  const processingTimeMs = Date.now() - startedAt

  let finalStatus: 'COMPLETED' | 'PARTIALLY_FAILED' | 'FAILED'
  if (failed.length === 0) {
    finalStatus = 'COMPLETED'
  } else if (succeeded.length > 0) {
    finalStatus = 'PARTIALLY_FAILED'
  } else {
    finalStatus = 'FAILED'
  }

  const errorMessages = failed
    .map((r) => (r.status === 'rejected' ? String(r.reason) : ''))
    .filter(Boolean)

  await prisma.repurposeJob.update({
    where: { id: repurposeJobId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      errorMessage:
        errorMessages.length > 0 ? errorMessages.join('; ') : null,
    },
  })

  console.log(
    `[repurpose-worker] Job ${repurposeJobId} completed with status ${finalStatus}. ` +
      `Tokens: ${totalTokens}, Time: ${processingTimeMs}ms, ` +
      `Succeeded: ${succeeded.length}/${platforms.length}`,
  )

  if (finalStatus === 'FAILED') {
    throw new Error(
      `All platforms failed: ${errorMessages.join('; ')}`,
    )
  }
}

export function createRepurposeWorker(): Worker<RepurposeJobData> {
  const worker = new Worker<RepurposeJobData>(
    'repurpose',
    processRepurposeJob,
    {
      connection: redis,
      concurrency: 5,
    },
  )

  worker.on('completed', (job) => {
    console.log(`[repurpose-worker] Job ${job.id} completed successfully`)
  })

  worker.on('failed', (job, error) => {
    console.error(
      `[repurpose-worker] Job ${job?.id ?? 'unknown'} failed:`,
      error.message,
    )
  })

  worker.on('error', (error) => {
    console.error('[repurpose-worker] Worker error:', error)
  })

  return worker
}
