/**
 * Resume Upload API Endpoint
 * POST /api/modules/resume/upload
 * 
 * Uploads and parses a resume file, extracts data and proposes profile updates
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  parseResumeFile,
  sanitizeResumeText,
  detectFileType,
  mergeResumeData,
  getExistingProfile,
  getExistingResume,
  summarizeChanges
} from '@/app/modules/resume/services'
import { UploadResumeResult } from '@/app/modules/resume/types'
import { db } from '@/lib/db/db'

// Temporary storage for pending changes (in production, use Redis or DB)
const temporaryChanges = new Map<string, any>()

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `resume_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResumeResult>> {
  console.log('📤 Resume upload request received')

  try {
    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string
    const textContent = formData.get('textContent') as string | null

    // Validate request
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, { status: 400 })
    }

    let resumeText: string

    // Option 1: Text content provided directly
    if (textContent) {
      console.log('📝 Using provided text content')
      resumeText = sanitizeResumeText(textContent)
    }
    // Option 2: File uploaded
    else if (file) {
      console.log('📄 Processing uploaded file:', file.name)

      // Validate file type
      const fileType = detectFileType(file.name, file.type)
      if (fileType === 'unknown') {
        return NextResponse.json({
          success: false,
          error: 'نوع الملف غير مدعوم. يرجى رفع ملف PDF أو DOCX'
        }, { status: 400 })
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({
          success: false,
          error: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت'
        }, { status: 400 })
      }

      // Read file content
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Parse PDF/DOCX using appropriate libraries
      if (fileType === 'pdf') {
        try {
          // Use custom PDF parser that handles Next.js compatibility
          const { parsePDF } = await import('@/lib/pdf-parser')
          resumeText = await parsePDF(buffer)
          console.log('📄 PDF text extracted:', resumeText.length, 'characters')
        } catch (pdfError: any) {
          console.error('PDF parsing error:', pdfError.message)
          return NextResponse.json({
            success: false,
            error: 'فشل قراءة ملف PDF. تأكد من أن الملف ليس محمياً بكلمة مرور'
          }, { status: 400 })
        }
      } else if (fileType === 'docx') {
        try {
          // Dynamic import mammoth
          const mammoth = await import('mammoth')
          const result = await mammoth.extractRawText({ buffer })
          resumeText = result.value
          console.log('📄 DOCX text extracted:', resumeText.length, 'characters')
        } catch (docxError: any) {
          console.error('DOCX parsing error:', docxError.message)
          return NextResponse.json({
            success: false,
            error: 'فشل قراءة ملف DOCX. تأكد من أن الملف غير تالف'
          }, { status: 400 })
        }
      } else {
        // Plain text
        try {
          resumeText = buffer.toString('utf-8')
        } catch {
          resumeText = buffer.toString('latin1')
        }
      }

      resumeText = sanitizeResumeText(resumeText)
    }
    else {
      return NextResponse.json({
        success: false,
        error: 'يجب رفع ملف أو تقديم محتوى نصي'
      }, { status: 400 })
    }

    // Check if we have any content
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: 'لم يتم العثور على محتوى كافٍ في الملف. تأكد من أن الملف يحتوي على نص قابل للقراءة'
      }, { status: 400 })
    }

    console.log('🤖 Parsing resume with AI...')

    // Step 1: Parse resume with AI
    const extractedData = await parseResumeFile(resumeText, 'text')

    // Step 2: Get existing profile and resume
    const [existingProfile, existingResume] = await Promise.all([
      getExistingProfile(userId),
      getExistingResume(userId)
    ])

    // Step 3: Merge data
    const proposedChanges = mergeResumeData(
      extractedData,
      existingProfile,
      existingResume
    )

    // Step 4: Generate session ID and store temporarily
    const sessionId = generateSessionId()
    temporaryChanges.set(sessionId, {
      userId,
      proposedChanges,
      extractedData,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    })

    // Clean up old sessions (simple cleanup)
    cleanupExpiredSessions()

    // Step 5: Log the action
    await db.from('agent_actions_log').insert({
      user_id: userId,
      action_type: 'resume_upload_parsed',
      input_json: {
        fileName: file?.name || 'text_input',
        fileSize: file?.size || resumeText.length
      },
      output_json: {
        sessionId,
        summary: summarizeChanges(proposedChanges)
      },
      success: true,
      created_at: new Date().toISOString()
    })

    const summary = summarizeChanges(proposedChanges)
    console.log('✅ Resume parsed successfully:', summary)

    return NextResponse.json({
      success: true,
      sessionId,
      proposedChanges,
      extractedData,
      message: summary
    })

  } catch (error: any) {
    console.error('❌ Resume upload failed:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'فشل معالجة السيرة الذاتية'
    }, { status: 500 })
  }
}

/**
 * GET endpoint to retrieve pending changes
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({
      success: false,
      error: 'معرف الجلسة مطلوب'
    }, { status: 400 })
  }

  const session = temporaryChanges.get(sessionId)

  if (!session) {
    return NextResponse.json({
      success: false,
      error: 'الجلسة غير موجودة أو انتهت صلاحيتها'
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    ...session
  })
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions(): void {
  const now = new Date()
  for (const [sessionId, session] of temporaryChanges.entries()) {
    if (new Date(session.expiresAt) < now) {
      temporaryChanges.delete(sessionId)
    }
  }
}

/**
 * Export for confirm-update route to access
 */
export function getTemporarySession(sessionId: string): any {
  return temporaryChanges.get(sessionId)
}

export function deleteTemporarySession(sessionId: string): void {
  temporaryChanges.delete(sessionId)
}

