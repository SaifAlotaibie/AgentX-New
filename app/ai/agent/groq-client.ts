import { createGroq } from '@ai-sdk/groq'

// Create Groq client using native Groq SDK
// Official Groq API: https://console.groq.com/docs/models
export const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || '',
})

// 🎯 GPT-OSS-120B: High-performance agentic model with tool calling
// Performance: ~500 tokens/second | 67.8% tool accuracy | 128K context
// Requires maxSteps parameter in streamText for proper text generation after tools
export const agentModel = groq('openai/gpt-oss-120b')

// ⚡ Alternative: LLAMA 3.3 70B (slower but slightly more accurate)
// export const agentModel = groq('llama-3.3-70b-versatile')  // ~300 T/s

// ⚡ Alternative: GPT-OSS-20B (2x faster, but 13% less accurate for tools)
// export const agentModel = groq('openai/gpt-oss-20b')  // 1000 T/s, 54.8% accuracy


