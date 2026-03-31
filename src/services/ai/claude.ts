import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, GenerateRequest, GenerateResponse } from './provider'

export class ClaudeProvider implements AIProvider {
  private client: Anthropic

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    this.client = new Anthropic({ apiKey })
  }

  async generateContent(request: GenerateRequest): Promise<GenerateResponse> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens ?? 2048,
        temperature: request.temperature ?? 0.7,
        system: request.systemPrompt,
        messages: [{ role: 'user', content: request.userPrompt }],
      })

      const content =
        response.content
          .filter((block) => block.type === 'text')
          .map((block) => (block as { type: 'text'; text: string }).text)
          .join('') ?? ''

      const tokensUsed =
        (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0)

      return {
        content,
        tokensUsed,
        finishReason: response.stop_reason ?? 'end_turn',
      }
    } catch (error) {
      console.error('[ClaudeProvider] generateContent error:', error)
      throw error
    }
  }
}
