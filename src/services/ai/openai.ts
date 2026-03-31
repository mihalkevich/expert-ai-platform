import type { AIProvider, GenerateRequest, GenerateResponse } from './provider'

export class OpenAIProvider implements AIProvider {
  async generateContent(_request: GenerateRequest): Promise<GenerateResponse> {
    throw new Error('OpenAI not configured')
  }
}
