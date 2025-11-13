// Domestic Labor CRUD API

import { NextRequest, NextResponse } from 'next/server'
import { db, isValidUUID } from '@/lib/db/db'
import { createDomesticLaborRequestTool, getDomesticLaborRequestsTool } from '@/app/ai/tools'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')
    const status = searchParams.get('status') || undefined

    if (!user_id || !isValidUUID(user_id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing user_id'
      }, { status: 400 })
    }

    const result = await getDomesticLaborRequestsTool.execute({ user_id, status })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Domestic API] GET error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, worker_name, request_type } = body

    if (!user_id || !isValidUUID(user_id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing user_id'
      }, { status: 400 })
    }

    if (!worker_name || !request_type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: worker_name, request_type'
      }, { status: 400 })
    }

    const result = await createDomesticLaborRequestTool.execute({ user_id, worker_name, request_type })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Domestic API] POST error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}
