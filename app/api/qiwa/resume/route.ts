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

    console.log('📨 POST /api/qiwa/resume - user_id:', user_id)
    console.log('📋 Resume data:', JSON.stringify(resumeData, null, 2))

    if (!user_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'user_id is required'
      }, { status: 400 })
    }

    const result = await resumeService.updateResume(user_id, resumeData)

    if (!result) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'فشل حفظ السيرة الذاتية. الرجاء المحاولة مرة أخرى.'
      }, { status: 500 })
    }

    console.log('✅ Resume saved successfully')
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: 'Resume saved successfully'
    })
  } catch (error: any) {
    console.error('❌ POST /api/qiwa/resume error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'حدث خطأ في الخادم'
    }, { status: 500 })
  }
}


