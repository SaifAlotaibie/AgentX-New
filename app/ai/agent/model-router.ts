import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'

/**
 * Smart Model Router for AgentX
 * Routes requests to optimal model based on complexity and cost
 */

// Groq client for local Saudi hosting
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY
})

export type ModelComplexity = 'simple' | 'medium' | 'complex'

/**
 * Get optimal model based on task complexity
 * 
 * Strategy:
 * - Simple: Use Groq gpt-oss-120b (local Saudi hosting, blazing fast, cheapest)
 * - Medium: Use OpenAI gpt-4o (balanced)
 * - Complex: Use Claude 3.5 Sonnet (best reasoning)
 */
export function getOptimalModel(complexity: ModelComplexity = 'medium') {
  switch (complexity) {
    case 'simple':
      // For simple tasks: Use Groq's gpt-oss-120b
      // Hosted in Dammam, Saudi Arabia
      // ~300 tokens/sec, ultra-low latency
      // Cost: ~$0.28/1M input tokens
      return groq('gpt-oss-120b')
    
    case 'complex':
      // For complex reasoning: Use Claude 3.5 Sonnet
      // Best for coding, analysis, multi-step reasoning
      // Cost: $3/1M input tokens
      return anthropic('claude-3-5-sonnet-20241022')
    
    case 'medium':
    default:
      // Default: OpenAI gpt-4o
      // Good balance of speed and intelligence
      // Cost: $2.50/1M input tokens
      return openai('gpt-4o')
  }
}

/**
 * Determine complexity based on intent
 */
export function getComplexityFromIntent(intent: string): ModelComplexity {
  // Simple intents - use fast local model
  const simpleIntents = [
    'view_resume',
    'view_certificates',
    'view_appointments',
    'view_contracts',
    'check_ticket',
    'general_inquiry'
  ]
  
  // Complex intents - use reasoning model
  const complexIntents = [
    'create_resume',
    'update_resume',
    'regulations',
    'book_appointment'
  ]
  
  if (simpleIntents.includes(intent)) {
    return 'simple'
  }
  
  if (complexIntents.includes(intent)) {
    return 'complex'
  }
  
  return 'medium'
}

/**
 * Get model name for logging
 */
export function getModelName(complexity: ModelComplexity): string {
  switch (complexity) {
    case 'simple':
      return 'gpt-oss-120b (Groq KSA)'
    case 'complex':
      return 'claude-3-5-sonnet'
    case 'medium':
    default:
      return 'gpt-4o'
  }
}
