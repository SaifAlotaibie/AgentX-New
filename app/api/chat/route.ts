// Enhanced AI Agent Chat API with Tool Execution

import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/db/db'
import { executeAgent } from '@/app/ai/agent/executor'

export async function POST(request: NextRequest) {
  try {
    const { message, user_id, history = [] } = await request.json()

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    if (!user_id || !isValidUUID(user_id)) {
      return NextResponse.json(
        { error: 'Invalid or missing user_id. Must be a valid UUID.' },
        { status: 400 }
      )
    }

    // Execute intelligent AI agent with tools and proactive behavior
    const agentResponse = await executeAgent(message, user_id, history)

    return NextResponse.json({
      response: agentResponse.response,
      tools_used: agentResponse.tools_used,
      proactive_suggestions: agentResponse.proactive_suggestions,
      reasoning: agentResponse.reasoning
    })
  } catch (error: any) {
    console.error('[Chat API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        response: 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.'
      },
      { status: 500 }
    )
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'online',
    version: '2.0',
    features: [
      'Tool Execution',
      'Proactive Behavior',
      'Multi-step Reasoning',
      'Learning Loop',
      'Context Awareness'
    ]
  })
}
