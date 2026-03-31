export function buildBlogPrompt(sourceContent: string): string {
  return `## Task
Transform the following source content into a full SEO-optimized blog post.

## Blog Post Requirements
- **Title**: Write a compelling, SEO-friendly title (50–60 characters, include primary keyword)
- **Meta description**: Provide a meta description (150–160 characters) on its own line prefixed with "Meta: "
- **Introduction**: Hook readers in the first paragraph; state what they will learn
- **Structure**: Use H2 headers for main sections and H3 for subsections where appropriate
- **Length**: 800–1500 words; comprehensive but focused
- **SEO**: Naturally incorporate relevant keywords; do not keyword-stuff
- **Formatting**: Use bullet points and numbered lists where appropriate to aid scannability
- **Internal linking**: At the end, include a section "## Internal Linking Suggestions" with 3–5 topic suggestions for related posts the site could link to
- **Conclusion**: Summarize key takeaways and include a CTA
- **Keyword focus**: Identify and naturally use 1 primary keyword and 2–3 secondary keywords throughout

## Source Content
${sourceContent}

## Output
Write the complete blog post in Markdown format, including title (as H1), meta description, all sections, and the internal linking suggestions. Do not include any explanation or preamble outside the post itself.`
}
