export interface GenerateRequest {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
}

export interface GenerateResponse {
  content: string
  tokensUsed: number
  finishReason: string
}

export interface AIProvider {
  generateContent(request: GenerateRequest): Promise<GenerateResponse>
}
