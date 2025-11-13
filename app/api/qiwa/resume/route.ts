import { NextRequest, NextResponse } from 'next/server'
import * as resumeService from '@/services/qiwa/resumeService'
import { ApiResponse } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'user_id is required'
      }, { status: 400 })
    }

    const result = await resumeService.getResumeWithCourses(user_id)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result
    })
  } catch (error: any) {
    console.error('GET /api/qiwa/resume error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, ...resumeData } = body

    if (!user_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'user_id is required'
      }, { status: 400 })
    }

    const result = await resumeService.updateResume(user_id, resumeData)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: 'Resume updated successfully'
    })
  } catch (error: any) {
    console.error('POST /api/qiwa/resume error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}


