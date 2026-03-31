import type { AIProvider } from './provider'
import { ClaudeProvider } from './claude'
import { OpenAIProvider } from './openai'

let instance: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (instance) return instance

  const providerName = process.env.AI_PROVIDER ?? 'claude'

  if (providerName === 'openai') {
    instance = new OpenAIProvider()
  } else {
    instance = new ClaudeProvider()
  }

  return instance
}
