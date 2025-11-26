/**
 * Agent Executor Entry Point
 * Uses agentic mode (LLM-driven tool calling) by default
 */

import { executeAgent as executeRuleBased } from './executor'
import { executeAgenticAgent } from './executor-agentic'

export * from './system_prompt'

/**
 * Main agent executor with feature flag support
 *
 * USE_AGENTIC_AGENT=true (default) → LLM decides tools autonomously (GPT-20B/120B)
 * USE_AGENTIC_AGENT=false → Rule-based (legacy manual tool selection)
 */
export async function executeAgent(
  userMessage: string,
  userId: string,
  conversationHistory: any[] = []
) {
  // Default to agentic mode
  if (process.env.USE_AGENTIC_AGENT !== 'false') {
    console.log('🤖 [MODE] AGENTIC (GPT-120B @ 500 T/s - Best Quality)')
    return executeAgenticAgent(userMessage, userId, conversationHistory)
  }

  // Fallback to rule-based
  console.log('📋 [MODE] RULE-BASED (legacy)')
  return executeRuleBased(userMessage, userId, conversationHistory)
}


