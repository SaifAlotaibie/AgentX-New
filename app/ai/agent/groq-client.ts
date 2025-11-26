import { createGroq } from '@ai-sdk/groq'

// Create Groq client using native Groq SDK
// Official Groq API: https://console.groq.com/docs/models
export const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY || '',
})

// 🎯 GPT-OSS-120B: Best for agentic tasks & tool calling
// Performance: 500 tokens/second (67.8% tool-use accuracy)
// Superior for: Complex reasoning, natural responses, reliable tool calling
// Model ID: https://console.groq.com/docs/model/openai/gpt-oss-120b
export const agentModel = groq('openai/gpt-oss-120b')

// ⚡ Alternative: GPT-OSS-20B (2x faster, but 13% less accurate for tools)
// export const agentModel = groq('openai/gpt-oss-20b')  // 1000 T/s, 54.8% accuracy


