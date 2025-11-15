import { NextRequest, NextResponse } from 'next/server'
import { generateWelcomeMessage } from '@/app/ai/agent/welcome_message'
import { isValidUUID } from '@/lib/db/db'

/**
 * GET /api/welcome
 * Generate personalized welcome message based on user behavior and proactive events
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')
    const user_name = searchParams.get('user_name')

    if (!user_id || !isValidUUID(user_id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing user_id' },
        { status: 400 }
      )
    }

    const welcomeMessage = await generateWelcomeMessage(user_id, user_name || undefined)

    return NextResponse.json({
      success: true,
      message: welcomeMessage
    })
  } catch (error: any) {
    console.error('Error generating welcome message:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate welcome message',
        // Fallback message
        message: 'مرحباً بك في المساعد الذكي! 👋\n\nكيف يمكنني مساعدتك اليوم؟'
      },
      { status: 500 }
    )
  }
}

