// Tickets CRUD API

import { NextRequest, NextResponse } from 'next/server'
import { db, isValidUUID } from '@/lib/db/db'
import { createTicketTool, closeTicketTool, checkTicketStatusTool } from '@/app/ai/tools'

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

    const result = await checkTicketStatusTool.execute({ user_id })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Tickets API] GET error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, title, category } = body

    if (!user_id || !isValidUUID(user_id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing user_id'
      }, { status: 400 })
    }

    if (!title || !category) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, category'
      }, { status: 400 })
    }

    const result = await createTicketTool.execute({ user_id, title, category })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Tickets API] POST error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, ticket_id, status } = body

    if (!user_id || !isValidUUID(user_id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing user_id'
      }, { status: 400 })
    }

    if (!ticket_id || status !== 'closed') {
      return NextResponse.json({
        success: false,
        error: 'Invalid parameters'
      }, { status: 400 })
    }

    const result = await closeTicketTool.execute({ user_id, ticket_id })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Tickets API] PUT error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

