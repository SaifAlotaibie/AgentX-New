import { NextRequest, NextResponse } from 'next/server'
import * as appointmentsService from '@/services/qiwa/appointmentsService'
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

    const appointments = await appointmentsService.getAppointments(user_id)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: appointments
    })
  } catch (error: any) {
    console.error('GET /api/qiwa/appointments error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, user_id, appointment_id, appointment_type, appointment_date, notes } = body

    if (action === 'cancel') {
      if (!appointment_id) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'appointment_id is required for cancel action'
        }, { status: 400 })
      }

      const result = await appointmentsService.cancelAppointment(appointment_id)

      return NextResponse.json<ApiResponse>({
        success: true,
        data: result,
        message: 'Appointment cancelled successfully'
      })
    }

    if (action === 'complete') {
      if (!appointment_id) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'appointment_id is required for complete action'
        }, { status: 400 })
      }

      const result = await appointmentsService.completeAppointment(appointment_id)

      return NextResponse.json<ApiResponse>({
        success: true,
        data: result,
        message: 'Appointment completed successfully'
      })
    }

    // Default action: book appointment
    if (!user_id || !appointment_type || !appointment_date) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'user_id, appointment_type, and appointment_date are required'
      }, { status: 400 })
    }

    const result = await appointmentsService.bookAppointment(user_id, {
      appointment_type,
      appointment_date,
      notes
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: 'Appointment booked successfully'
    })
  } catch (error: any) {
    console.error('POST /api/qiwa/appointments error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}


