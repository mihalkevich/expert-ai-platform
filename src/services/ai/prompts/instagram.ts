export function buildInstagramPrompt(sourceContent: string): string {
  return `## Task
Transform the following source content into an optimized Instagram caption.

## Instagram Caption Requirements
- **Hook**: Open with a visually evocative, scroll-stopping first line — this is critical on Instagram
- **Emojis**: Use emojis moderately (every 2–4 lines) to add personality without overwhelming
- **Line breaks**: Use frequent line breaks and short paragraphs for mobile readability
- **Length**: 150–400 words; engaging but not overwhelming
- **Hashtags**: End with 5–10 highly relevant hashtags on a separate line after a blank line
- **CTA**: Include a clear CTA referencing "link in bio" for further engagement
- **Tone**: Authentic, relatable, and inspiring; speak directly to the audience

## Source Content
${sourceContent}

## Output
Write only the Instagram caption text, ready to publish. Do not include any explanation or preamble.`
}
