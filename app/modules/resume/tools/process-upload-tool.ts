/**
 * Process Uploaded Resume Tool
 * Agent tool for processing uploaded resume files and extracting profile data
 */

import { Tool, ToolResult } from '@/app/ai/tools/types'
import { logAgentAction, updateUserBehavior } from '@/app/ai/tools/logger'
import { createTicketTool } from '@/app/ai/tools/ticketTools'
import {
  parseResumeFile,
  sanitizeResumeText,
  mergeResumeData,
  getExistingProfile,
  getExistingResume,
  applyConfirmedChanges,
  summarizeChanges
} from '../services'

/**
 * Agent tool for processing uploaded resume content
 * 
 * User can say:
 * - "هذي سيرتي الذاتية" + paste content
 * - "حدث بياناتي من هذي السيرة"
 * - "Update my profile from this resume"
 */
export const processUploadedResumeTool: Tool = {
  name: 'processUploadedResumeTool',
  description: `معالجة محتوى السيرة الذاتية المرفوعة واستخراج البيانات لتحديث الملف الشخصي.
  يحلل النص المقدم ويستخرج: الاسم، البريد، الهاتف، المهارات، الخبرات، التعليم، الدورات.
  ثم يقترح تحديثات على الملف الشخصي بناءً على البيانات المستخرجة.
  استخدم هذه الأداة عندما يقدم المستخدم محتوى سيرته الذاتية للمعالجة.`,
  
  parameters: {
    user_id: 'معرف المستخدم (UUID) - مطلوب',
    resume_text: 'نص السيرة الذاتية المراد تحليلها - مطلوب',
    auto_apply: 'تطبيق التغييرات تلقائياً بدون تأكيد (true/false) - اختياري، الافتراضي: true',
  },

  execute: async (params: {
    user_id: string
    resume_text: string
    auto_apply?: boolean
  }): Promise<ToolResult> => {
    console.log('🤖 processUploadedResumeTool - Starting execution')
    
    try {
      const { user_id, resume_text, auto_apply = true } = params

      // Validate parameters
      if (!user_id) {
        return {
          success: false,
          error: 'معرف المستخدم مطلوب'
        }
      }

      if (!resume_text || resume_text.trim().length < 50) {
        return {
          success: false,
          error: 'محتوى السيرة الذاتية قصير جداً. يرجى تقديم المزيد من المعلومات'
        }
      }

      console.log('📄 Sanitizing and parsing resume...')

      // Step 1: Sanitize the text
      const sanitizedText = sanitizeResumeText(resume_text)

      // Step 2: Parse resume with AI
      const extractedData = await parseResumeFile(sanitizedText, 'text')

      console.log('📊 Extracted data:', {
        hasName: !!extractedData.personalInfo.fullName,
        skillsCount: extractedData.skills.length,
        experienceCount: extractedData.experience.length,
        coursesCount: extractedData.courses.length
      })

      // Step 3: Get existing profile and resume
      const [existingProfile, existingResume] = await Promise.all([
        getExistingProfile(user_id),
        getExistingResume(user_id)
      ])

      // Step 4: Merge data
      const proposedChanges = mergeResumeData(
        extractedData,
        existingProfile,
        existingResume
      )

      const summary = summarizeChanges(proposedChanges)
      console.log('🔀 Merge summary:', summary)

      // Check if there are any changes
      const hasChanges = 
        Object.keys(proposedChanges.profile).length > 0 ||
        Object.keys(proposedChanges.resume).length > 0 ||
        proposedChanges.newExperiences.length > 0 ||
        proposedChanges.newCourses.length > 0

      if (!hasChanges) {
        return {
          success: true,
          data: { extractedData, proposedChanges },
          message: 'تم تحليل السيرة الذاتية بنجاح، ولكن لم يتم العثور على بيانات جديدة لإضافتها. ملفك الشخصي محدث بالفعل! ✅'
        }
      }

      // Step 5: Apply changes if auto_apply is true
      let applyResult = null
      if (auto_apply) {
        console.log('💾 Auto-applying changes...')
        applyResult = await applyConfirmedChanges(user_id, proposedChanges)
      }

      // Step 6: Log the action
      await logAgentAction(user_id, 'process_uploaded_resume', {
        textLength: resume_text.length,
        auto_apply
      }, {
        success: true,
        extractedData,
        proposedChanges,
        applied: auto_apply
      })

      // Step 7: Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'resume'
      })

      // Step 8: Create ticket
      await createTicketTool.execute({
        user_id,
        title: 'تحديث الملف الشخصي من سيرة ذاتية مرفوعة',
        category: 'agent_action',
        description: auto_apply 
          ? `تم تحديث الملف الشخصي تلقائياً. ${summary}`
          : `تم تحليل السيرة الذاتية. ${summary}`
      })

      console.log('✅ Resume processing completed')

      // Build response message
      let message = `تم تحليل السيرة الذاتية بنجاح! ✅\n\n`
      message += `📊 ${summary}\n\n`

      if (extractedData.personalInfo.fullName) {
        message += `👤 الاسم: ${extractedData.personalInfo.fullName}\n`
      }
      if (extractedData.skills.length > 0) {
        message += `💡 المهارات: ${extractedData.skills.slice(0, 5).join('، ')}${extractedData.skills.length > 5 ? '...' : ''}\n`
      }
      if (extractedData.experienceYears > 0) {
        message += `📅 سنوات الخبرة: ${extractedData.experienceYears}\n`
      }
      if (extractedData.experience.length > 0) {
        message += `💼 عدد الخبرات: ${extractedData.experience.length}\n`
      }

      if (auto_apply && applyResult?.success) {
        message += `\n✅ تم تحديث ملفك الشخصي تلقائياً!`
        if (applyResult.updatedFields) {
          const fields = []
          if (applyResult.updatedFields.profile > 0) fields.push(`${applyResult.updatedFields.profile} حقل شخصي`)
          if (applyResult.updatedFields.resume > 0) fields.push(`${applyResult.updatedFields.resume} حقل في السيرة`)
          if (applyResult.updatedFields.contracts > 0) fields.push(`${applyResult.updatedFields.contracts} خبرة عمل`)
          if (applyResult.updatedFields.courses > 0) fields.push(`${applyResult.updatedFields.courses} دورة تدريبية`)
          if (fields.length > 0) {
            message += ` (${fields.join('، ')})`
          }
        }
      } else if (!auto_apply) {
        message += `\n⏳ التغييرات في انتظار تأكيدك.`
      }

      return {
        success: true,
        data: {
          extractedData,
          proposedChanges,
          applied: auto_apply && applyResult?.success,
          updatedFields: applyResult?.updatedFields
        },
        message
      }

    } catch (error: any) {
      console.error('❌ processUploadedResumeTool failed:', error)
      
      return {
        success: false,
        error: error.message || 'فشل معالجة السيرة الذاتية'
      }
    }
  }
}


