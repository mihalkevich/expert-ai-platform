export function buildLinkedInPrompt(
  sourceContent: string,
  voiceProfile?: string,
): string {
  const voiceSection = voiceProfile
    ? `\n## Voice Profile\n${voiceProfile}\n`
    : ''

  return `${voiceSection}
## Task
Transform the following source content into a compelling LinkedIn post.

## LinkedIn Post Requirements
- **Hook**: Open with a powerful, attention-grabbing first line that stops the scroll
- **Structure**: Use a storytelling or insight-driven structure that delivers clear value
- **Length**: Aim for ~1300 characters (LinkedIn sweet spot); never exceed 3000 characters
- **Tone**: Professional yet human; position the author as a thought leader
- **Format**: Use short paragraphs and line breaks for readability; avoid walls of text
- **Hashtags**: End with 3-5 highly relevant hashtags on their own line
- **CTA**: Close with a clear call to action (question, invitation to comment, or next step)
- **No images required**: Write as a text-only post that stands on its own

## Source Content
${sourceContent}

## Output
Write only the LinkedIn post text, ready to publish. Do not include any explanation or preamble.`
}
