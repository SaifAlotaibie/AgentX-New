import { createOpenAI } from '@ai-sdk/openai'

// Create Groq client using OpenAI-compatible SDK
// This allows us to use gpt-oss-120b hosted in Saudi Arabia
export const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
})

// Export the specific model we want to use - OpenAI GPT-OSS 120B
export const agentModel = groq('openai/gpt-oss-120b')
