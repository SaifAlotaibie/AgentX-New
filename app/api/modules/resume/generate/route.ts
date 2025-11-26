/**
 * Resume Generation API Endpoint
 * POST /api/modules/resume/generate
 * 
 * Generates an ATS-friendly PDF resume from user profile data
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  aggregateResumeData,
  hasMinimumResumeData,
  formatResumeForATS,
  generateResumePDF,
  logResumeGeneration,
  validateATSCompliance,
  htmlToDataUrl
} from '@/app/modules/resume/services'
import { GenerateResumeRequest, GenerateResumeResponse, ResumeTemplateStyle } from '@/app/modules/resume/types'
import { db } from '@/lib/db/db'

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResumeResponse>> {
  console.log('📄 Resume generation request received')

  try {
    // Parse request body
    const body: GenerateResumeRequest = await request.json()
    const { userId, templateStyle = 'modern', includePhoto = false } = body

    // Validate userId
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, { status: 400 })
    }

    console.log('📊 Aggregating data for user:', userId)

    // Step 1: Aggregate all user data
    const aggregatedData = await aggregateResumeData(userId)

    // Step 2: Check if we have minimum required data
    const { valid, missing } = hasMinimumResumeData(aggregatedData)
    if (!valid) {
      return NextResponse.json({
        success: false,
        error: `بيانات غير كافية لإنشاء السيرة الذاتية. البيانات المفقودة: ${missing.join('، ')}`
      }, { status: 400 })
    }

    console.log('🤖 Formatting with AI...')

    // Step 3: Format data with AI for ATS optimization
    const formattedData = await formatResumeForATS(aggregatedData, 'ar')

    // Step 4: Validate ATS compliance
    const atsReport = validateATSCompliance(formattedData)
    console.log('📊 ATS Score:', atsReport.score)

    // Step 5: Generate PDF HTML
    const { html, fileName } = await generateResumePDF(
      formattedData,
      templateStyle as ResumeTemplateStyle,
      'ar'
    )

    // Step 6: Convert to data URL for download
    const dataUrl = htmlToDataUrl(html)

    // Step 7: Log the action
    await logResumeGeneration(userId, templateStyle as ResumeTemplateStyle)

    // Log to agent_actions_log
    await db.from('agent_actions_log').insert({
      user_id: userId,
      action_type: 'resume_pdf_generated',
      input_json: { templateStyle, includePhoto },
      output_json: {
        fileName,
        atsScore: atsReport.score,
        generatedAt: new Date().toISOString()
      },
      success: true,
      created_at: new Date().toISOString()
    })

    console.log('✅ Resume generated successfully:', fileName)

    return NextResponse.json({
      success: true,
      pdfUrl: dataUrl,
      fileName,
      generatedAt: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Resume generation failed:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'فشل إنشاء السيرة الذاتية'
    }, { status: 500 })
  }
}


