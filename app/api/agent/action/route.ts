import { NextRequest, NextResponse } from 'next/server'
import { executeAgentAction, getAvailableActions } from '@/services/agent/agentActions'
import { ApiResponse, AgentActionPayload } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    const actions = await getAvailableActions()

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        available_actions: actions,
        description: 'Available actions that the AI agent can execute'
      }
    })
  } catch (error: any) {
    console.error('GET /api/agent/action error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...payload } = body

    if (!action) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'action is required'
      }, { status: 400 })
    }

    const result = await executeAgentAction(action, payload as AgentActionPayload)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: `Action '${action}' executed successfully`
    })
  } catch (error: any) {
    console.error('POST /api/agent/action error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Failed to execute action'
    }, { status: 500 })
  }
}

