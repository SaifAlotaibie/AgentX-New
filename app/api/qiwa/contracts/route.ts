import { NextRequest, NextResponse } from 'next/server'
import * as contractsService from '@/services/qiwa/contractsService'
import { ApiResponse } from '@/lib/db/types'
import { isValidUUID } from '@/lib/db/db'

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

    if (!isValidUUID(user_id)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid user_id format. Must be a valid UUID v4.'
      }, { status: 400 })
    }

    const contracts = await contractsService.getContracts(user_id)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: contracts
    })
  } catch (error: any) {
    console.error('GET /api/qiwa/contracts error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, contract_id } = body

    if (action === 'end') {
      if (!contract_id) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'contract_id is required'
        }, { status: 400 })
      }

      const result = await contractsService.endContract(contract_id)

      return NextResponse.json<ApiResponse>({
        success: true,
        data: result,
        message: 'Contract ended successfully'
      })
    }

    if (action === 'create') {
      const { user_id, employer_name, position, salary, start_date, end_date, contract_type, status } = body

      console.log('📥 Received contract creation request:', { user_id, employer_name, position, salary, start_date, end_date, contract_type, status })

      if (!user_id || !employer_name || !position || !salary || !start_date || !contract_type) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Missing required fields'
        }, { status: 400 })
      }

      if (!isValidUUID(user_id)) {
        return NextResponse.json<ApiResponse>({
          success: false,
          error: 'Invalid user_id format. Must be a valid UUID v4.'
        }, { status: 400 })
      }

      try {
        const result = await contractsService.createContract({
          user_id,
          employer_name,
          position,
          salary,
          start_date,
          end_date,
          contract_type,
          status
        })

        console.log('✅ Contract created successfully:', result)

        return NextResponse.json<ApiResponse>({
          success: true,
          data: result,
          message: 'Contract created successfully'
        })
      } catch (createError: any) {
        console.error('❌ Error creating contract:', createError)
        return NextResponse.json<ApiResponse>({
          success: false,
          error: createError.message || 'Failed to create contract'
        }, { status: 500 })
      }
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })
  } catch (error: any) {
    console.error('POST /api/qiwa/contracts error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

