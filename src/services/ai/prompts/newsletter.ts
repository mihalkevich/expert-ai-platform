export function buildNewsletterPrompt(sourceContent: string): string {
  return `## Task
Transform the following source content into a newsletter section suitable for email delivery.

## Newsletter Requirements
- **Subject line**: Start with a suggested subject line on its own line, prefixed with "Subject: "
- **Tone**: Personal and conversational — write as if talking to a trusted friend or colleague
- **Structure**: Use clearly labeled sections with short, descriptive headers (e.g., "## What I Learned This Week")
- **Length**: 300–600 words; substantial enough to be valuable, short enough to read in 2–3 minutes
- **Deliverability**: Avoid spam trigger words (free, guaranteed, limited time, act now, etc.); no all-caps; minimal exclamation marks
- **Format**: Plain prose with occasional bullet points; avoid heavy markdown — it may not render in all email clients
- **Personalization**: Use "you" and "I" to create connection; share a perspective or opinion
- **CTA**: End with one clear next step for the reader

## Source Content
${sourceContent}

## Output
Write only the newsletter content (subject line + body), ready to paste into an email editor. Do not include any explanation or preamble.`
}
