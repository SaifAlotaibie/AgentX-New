/**
 * Verification script for Groq GPT-OSS-120B configuration
 * Run: npx tsx scripts/verify-groq-model.ts
 */

import { agentModel, groq } from '../app/ai/agent/groq-client'

async function verifyGroqConfiguration() {
  console.log('🔍 Verifying Groq GPT-OSS-120B Configuration...\n')

  // Check 1: Environment variable
  console.log('✅ Step 1: Checking environment variables')
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('❌ ERROR: GROQ_API_KEY not found in environment variables')
    console.log('   Add to .env.local: GROQ_API_KEY=your_key_here')
    process.exit(1)
  }
  console.log('   ✓ GROQ_API_KEY found:', apiKey.substring(0, 10) + '...\n')

  // Check 2: Model configuration
  console.log('✅ Step 2: Checking model configuration')
  console.log('   Model object:', agentModel)
  console.log('   Model ID should be: openai/gpt-oss-120b\n')

  // Check 3: Test API call
  console.log('✅ Step 3: Testing API connection')
  try {
    const { generateText } = await import('ai')

    console.log('   Sending test request to Groq...')
    const result = await generateText({
      model: agentModel,
      prompt: 'Say "Hello from GPT-OSS-120B" in one sentence.',
      maxTokens: 50,
    })

    console.log('   ✓ API call successful!')
    console.log('   Response:', result.text)
    console.log('   Usage:', result.usage)
    console.log('\n🎉 All checks passed! GPT-OSS-120B is configured correctly.')

  } catch (error: any) {
    console.error('❌ ERROR: API call failed')
    console.error('   Error message:', error.message)

    if (error.message?.includes('401')) {
      console.error('   → Invalid API key. Check your GROQ_API_KEY')
    } else if (error.message?.includes('model')) {
      console.error('   → Model not found. Verify model ID is correct')
    } else {
      console.error('   → Full error:', error)
    }

    process.exit(1)
  }
}

// Run verification
verifyGroqConfiguration().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
