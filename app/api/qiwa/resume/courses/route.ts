import { NextRequest, NextResponse } from 'next/server'
import * as resumeService from '@/services/qiwa/resumeService'
import { ApiResponse } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const resume_id = searchParams.get('resume_id')

    if (!resume_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'resume_id is required'
      }, { status: 400 })
    }

    const courses = await resumeService.getCourses(resume_id)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: courses
    })
  } catch (error: any) {
    console.error('GET /api/qiwa/resume/courses error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resume_id, course_name, provider, date_completed, certificate_url } = body

    if (!resume_id || !course_name || !provider || !date_completed) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'resume_id, course_name, provider, and date_completed are required'
      }, { status: 400 })
    }

    const result = await resumeService.addCourse(resume_id, {
      course_name,
      provider,
      date_completed,
      certificate_url
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: 'Course added successfully'
    })
  } catch (error: any) {
    console.error('POST /api/qiwa/resume/courses error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const course_id = searchParams.get('course_id')

    if (!course_id) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'course_id is required'
      }, { status: 400 })
    }

    const result = await resumeService.deleteCourse(course_id)

    if (!result) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to delete course'
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error: any) {
    console.error('DELETE /api/qiwa/resume/courses error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}
