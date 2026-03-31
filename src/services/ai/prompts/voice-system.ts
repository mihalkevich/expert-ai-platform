export interface VoiceProfileInput {
  formalityCasual: number
  seriousFun: number
  technicalSimple: number
  conciseVerbose: number
  industry?: string | null
  targetAudience?: string | null
  customInstructions?: string | null
  sampleTexts?: string[]
}

function describeSlider(
  value: number,
  lowLabel: string,
  highLabel: string,
  midLabel?: string,
): string {
  if (value <= 15) return `very ${lowLabel}`
  if (value <= 35) return lowLabel
  if (value <= 65) return midLabel ?? `balanced between ${lowLabel} and ${highLabel}`
  if (value <= 85) return highLabel
  return `very ${highLabel}`
}

export function buildVoiceSystemPrompt(profile: VoiceProfileInput): string {
  const formality = describeSlider(
    profile.formalityCasual,
    'formal and professional',
    'casual and friendly',
    'moderately professional',
  )

  const seriousness = describeSlider(
    profile.seriousFun,
    'serious and authoritative',
    'playful and entertaining',
    'balanced in tone',
  )

  const techLevel = describeSlider(
    profile.technicalSimple,
    'highly technical and expert-level',
    'simple and accessible to a general audience',
    'moderately technical',
  )

  const verbosity = describeSlider(
    profile.conciseVerbose,
    'extremely concise and punchy',
    'detailed and elaborate',
    'moderately detailed',
  )

  const lines: string[] = [
    'You are a professional content writer helping repurpose content into platform-specific formats.',
    '',
    '## Voice & Tone Guidelines',
    `- Formality: ${formality}`,
    `- Tone: ${seriousness}`,
    `- Complexity: ${techLevel}`,
    `- Length style: ${verbosity}`,
  ]

  if (profile.industry) {
    lines.push(`- Industry context: ${profile.industry}`)
  }

  if (profile.targetAudience) {
    lines.push(`- Target audience: ${profile.targetAudience}`)
  }

  if (profile.customInstructions) {
    lines.push('', '## Additional Instructions', profile.customInstructions)
  }

  if (profile.sampleTexts && profile.sampleTexts.length > 0) {
    lines.push(
      '',
      '## Writing Style Examples',
      'Study the following examples of the desired writing style and match it closely:',
      '',
    )
    profile.sampleTexts.forEach((sample, idx) => {
      lines.push(`### Example ${idx + 1}`, sample, '')
    })
  }

  lines.push(
    '',
    'Always maintain this voice and tone consistently across all content you produce.',
  )

  return lines.join('\n')
}

export function buildGenericSystemPrompt(): string {
  return [
    'You are a professional content writer helping repurpose content into platform-specific formats.',
    '',
    'Adapt the content to suit each platform\'s best practices, audience expectations, and format requirements.',
    'Write in a clear, engaging, and professional tone.',
  ].join('\n')
}
