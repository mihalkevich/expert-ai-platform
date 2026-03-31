import { load } from 'cheerio'

export interface ExtractedContent {
  title: string
  content: string
}

export async function extractFromUrl(url: string): Promise<ExtractedContent> {
  let html: string

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ContentRepurposer/1.0; +https://contentrepurposer.com)',
      },
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    html = await response.text()
  } catch (error) {
    console.error('[extractor] fetch error:', error)
    throw new Error(
      `Failed to fetch URL: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  const $ = load(html)

  // Remove noise elements
  $(
    'script, style, nav, header, footer, aside, [role="navigation"], .ad, .advertisement, .sidebar, .comments',
  ).remove()

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('title').text() ||
    $('h1').first().text() ||
    ''

  // Prefer semantic content containers
  const content =
    $('article').text() ||
    $('main').text() ||
    $('[role="main"]').text() ||
    $('.post-content, .entry-content, .article-body, .content').first().text() ||
    $('body').text()

  return {
    title: title.trim(),
    content: content.trim(),
  }
}
