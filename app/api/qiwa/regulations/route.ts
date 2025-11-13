import { NextRequest, NextResponse } from 'next/server'
import * as regulationsService from '@/services/qiwa/regulationsService'
import { ApiResponse } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let regulations

    if (search) {
      regulations = await regulationsService.searchRegulations(search)
    } else if (category) {
      regulations = await regulationsService.getRegulationsByCategory(category)
    } else {
      regulations = await regulationsService.getRegulations()
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: regulations
    })
  } catch (error: any) {
    console.error('GET /api/qiwa/regulations error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}


