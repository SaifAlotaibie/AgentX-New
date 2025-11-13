// Proactive Events API

import { NextRequest, NextResponse } from 'next/server'
import { getProactiveEventsForUser } from '@/app/ai/proactive'
import { isValidUUID } from '@/lib/db/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')

    if (!user_id || !isValidUUID(user_id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing user_id'
      }, { status: 400 })
    }

    const events = await getProactiveEventsForUser(user_id, 5)

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length
    })
  } catch (error: any) {
    console.error('[Proactive API] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

