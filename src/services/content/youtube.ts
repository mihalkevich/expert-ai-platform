import { YoutubeTranscript } from 'youtube-transcript'

export interface YouTubeExtractedContent {
  title: string
  transcript: string
}

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  // https://www.youtube.com/shorts/VIDEO_ID
  // https://m.youtube.com/watch?v=VIDEO_ID
  try {
    const parsed = new URL(url)

    if (
      parsed.hostname === 'youtu.be' ||
      parsed.hostname === 'www.youtu.be'
    ) {
      return parsed.pathname.slice(1).split('?')[0] || null
    }

    if (
      parsed.hostname.endsWith('youtube.com') ||
      parsed.hostname.endsWith('youtube-nocookie.com')
    ) {
      const vParam = parsed.searchParams.get('v')
      if (vParam) return vParam

      const pathParts = parsed.pathname.split('/').filter(Boolean)
      if (
        pathParts[0] === 'embed' ||
        pathParts[0] === 'shorts' ||
        pathParts[0] === 'v'
      ) {
        return pathParts[1] ?? null
      }
    }
  } catch {
    // Not a valid URL — treat the input as a raw video ID
  }

  // Fallback: if it looks like a raw video ID (11 alphanumeric chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url
  }

  return null
}

export async function extractYouTubeTranscript(
  url: string,
): Promise<YouTubeExtractedContent> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error(`Could not extract video ID from URL: ${url}`)
  }

  let segments: { text: string }[]
  try {
    segments = await YoutubeTranscript.fetchTranscript(videoId)
  } catch (error) {
    console.error('[youtube] fetchTranscript error:', error)
    throw new Error(
      `Failed to fetch YouTube transcript: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  const transcript = segments
    .map((s) => s.text.trim())
    .filter(Boolean)
    .join(' ')

  return {
    title: `YouTube Video (${videoId})`,
    transcript,
  }
}
