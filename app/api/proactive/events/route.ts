import { NextRequest, NextResponse } from 'next/server'
import { getProactiveEventsForUser } from '@/app/ai/proactive'

/**
 * GET /api/proactive/events
 * Fetch pending proactive events for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'user_id is required' },
        { status: 400 }
      )
    }

    const events = await getProactiveEventsForUser(user_id, 5)

    return NextResponse.json({
      success: true,
      events,
      count: events.length
    })
  } catch (error: any) {
    console.error('Error fetching proactive events:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch proactive events' },
      { status: 500 }
    )
  }
}

