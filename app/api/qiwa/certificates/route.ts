import { NextRequest, NextResponse } from 'next/server'
import * as certificatesService from '@/services/qiwa/certificatesService'
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

    const certificates = await certificatesService.getCertificates(user_id)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: certificates
    })
  } catch (error: any) {
    console.error('GET /api/qiwa/certificates error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, certificate_type } = body

    if (!user_id || !certificate_type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'user_id and certificate_type are required'
      }, { status: 400 })
    }

    let result

    switch (certificate_type) {
      case 'salary_definition':
        result = await certificatesService.generateSalaryDefinition(user_id)
        break
      case 'service_certificate':
        result = await certificatesService.generateServiceCertificate(user_id)
        break
      case 'labor_license':
        result = await certificatesService.generateLaborLicense(user_id)
        break
      default:
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Invalid certificate_type. Must be: salary_definition, service_certificate, or labor_license'
        }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
      message: `${certificate_type} generated successfully`
    })
  } catch (error: any) {
    console.error('POST /api/qiwa/certificates error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}


