export function buildTwitterPrompt(sourceContent: string): string {
  return `## Task
Transform the following source content into an engaging Twitter/X thread.

## Twitter Thread Requirements
- **Length**: 5–10 tweets in the thread
- **Tweet limit**: Each tweet must be 280 characters or fewer (including the numbering)
- **Format**: Number each tweet as "1/", "2/", etc. at the start
- **Structure**:
  - Tweet 1: Hook — make it impossible not to read on
  - Tweets 2–(n-1): Core value — insights, tips, or story beats; each tweet must stand somewhat alone
  - Last tweet: CTA — follow for more, share, reply, or a resource link
- **Style**: Punchy, engaging, and shareable; use plain language; vary sentence rhythm
- **Output format**: Return a JSON array of strings where each string is one tweet

## Source Content
${sourceContent}

## Output
Return ONLY a valid JSON array of tweet strings. Example format:
["1/ Hook tweet here...", "2/ Second tweet...", "3/ Final CTA tweet."]

Do not include any explanation, markdown fences, or text outside the JSON array.`
}
