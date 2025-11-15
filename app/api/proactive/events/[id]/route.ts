import { NextRequest, NextResponse } from 'next/server'
import { markProactiveEventActed } from '@/app/ai/proactive'

/**
 * PATCH /api/proactive/events/:id
 * Mark a proactive event as acted upon
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { acted, action_taken } = body
    const params = await context.params
    const eventId = params.id

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const success = await markProactiveEventActed(eventId, action_taken || 'user_action')

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event marked as acted'
    })
  } catch (error: any) {
    console.error('Error updating proactive event:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update event' },
      { status: 500 }
    )
  }
}

