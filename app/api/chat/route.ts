// Enhanced AI Agent Chat API with Tool Execution

import { NextRequest, NextResponse } from 'next/server'
import { isValidUUID } from '@/lib/db/db'
import { executeAgent } from '@/app/ai/agent'
import { saveConversation } from '@/lib/db/conversationService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, user_id } = body

    // Extract latest message and history for compatibility with executor
    const lastMessage = messages[messages.length - 1]

    // Handle UIMessage format from AI SDK v5 - extract text from parts array
    let message: string
    if (typeof lastMessage.content === 'string') {
      // Fallback for simple content string
      message = lastMessage.content
    } else if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
      // AI SDK v5 UIMessage format with parts
      const textPart = lastMessage.parts.find((p: any) => p.type === 'text')
      message = textPart?.text || ''
    } else {
      message = ''
    }

    const history = messages.slice(0, -1)

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      )
    }

    // Support both snake_case and camelCase for user_id
    // AI SDK v2 sends custom data in body.data
    const userId = body.data?.user_id || user_id || body.userId

    if (!userId || !isValidUUID(userId)) {
      console.error(`[Chat API] Invalid user_id: ${userId}`)
      console.error(`[Chat API] Full body:`, JSON.stringify(body, null, 2))
      return NextResponse.json(
        { error: `Invalid or missing user_id. Must be a valid UUID. Received: ${userId}` },
        { status: 400 }
      )
    }

    // 💾 Save user message to database
    await saveConversation(userId, 'user', message)

    // Execute intelligent AI agent with tools and proactive behavior
    const agentResult = await executeAgent(message, userId, history)

    if (agentResult.isStream && agentResult.response) {
      // Return UI message stream - compatible with DefaultChatTransport used by useChat
      return agentResult.response.toUIMessageStreamResponse({
        headers: {
          'X-Agent-Tools': JSON.stringify(agentResult.tools_used || []),
          'X-Agent-Proactive': JSON.stringify((agentResult as any).proactive_suggestions || [])
        }
      })
    }

    // Fallback for non-stream response (error cases)
    return NextResponse.json({
      response: agentResult.response,
      proactive_suggestions: (agentResult as any).proactive_suggestions || []
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
