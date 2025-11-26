/**
 * Confirm Resume Update API Endpoint
 * POST /api/modules/resume/confirm-update
 * 
 * Confirms and applies proposed profile updates from resume parsing
 */

import { NextRequest, NextResponse } from 'next/server'
import { applyConfirmedChanges } from '@/app/modules/resume/services'
import { ConfirmUpdateResult, ProposedChanges } from '@/app/modules/resume/types'
import { db } from '@/lib/db/db'
import { getTemporarySession, deleteTemporarySession } from '../upload/route'

interface ConfirmUpdateRequest {
  sessionId: string
  userId: string
  confirmedChanges: ProposedChanges
}

export async function POST(request: NextRequest): Promise<NextResponse<ConfirmUpdateResult>> {
  console.log('✅ Confirm update request received')

  try {
    // Parse request body
    const body: ConfirmUpdateRequest = await request.json()
    const { sessionId, userId, confirmedChanges } = body

    // Validate request
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'معرف الجلسة مطلوب'
      }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, { status: 400 })
    }

    if (!confirmedChanges) {
      return NextResponse.json({
        success: false,
        error: 'التغييرات المؤكدة مطلوبة'
      }, { status: 400 })
    }

    // Verify session exists and belongs to user
    const session = getTemporarySession(sessionId)
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'الجلسة غير موجودة أو انتهت صلاحيتها. يرجى رفع السيرة الذاتية مرة أخرى'
      }, { status: 404 })
    }

    if (session.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'غير مصرح بتعديل هذه الجلسة'
      }, { status: 403 })
    }

    console.log('💾 Applying confirmed changes...')

    // Apply the confirmed changes
    const result = await applyConfirmedChanges(userId, confirmedChanges)

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'فشل تطبيق التغييرات'
      }, { status: 500 })
    }

    // Clean up the temporary session
    deleteTemporarySession(sessionId)

    // Log the action
    await db.from('agent_actions_log').insert({
      user_id: userId,
      action_type: 'resume_upload_confirmed',
      input_json: { sessionId },
      output_json: { 
        updatedFields: result.updatedFields,
        appliedAt: new Date().toISOString()
      },
      success: true,
      created_at: new Date().toISOString()
    })

    // Create a ticket for the update
    await db.from('tickets').insert({
      user_id: userId,
      title: 'تحديث الملف الشخصي من السيرة الذاتية المرفوعة',
      description: `تم تحديث: ${result.updatedFields.profile} حقل في الملف الشخصي، ${result.updatedFields.resume} حقل في السيرة الذاتية، ${result.updatedFields.contracts} خبرة عمل، ${result.updatedFields.courses} دورة تدريبية`,
      category: 'agent_action',
      status: 'open',
      created_at: new Date().toISOString()
    })

    console.log('✅ Changes applied successfully:', result.updatedFields)

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح من السيرة الذاتية المرفوعة',
      updatedFields: result.updatedFields
    })

  } catch (error: any) {
    console.error('❌ Confirm update failed:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'فشل تأكيد التحديثات'
    }, { status: 500 })
  }
}


