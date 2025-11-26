/**
 * Generate Resume PDF Tool
 * Agent tool for generating ATS-friendly PDF resumes
 */

import { Tool, ToolResult } from '@/app/ai/tools/types'
import { logAgentAction, updateUserBehavior } from '@/app/ai/tools/logger'
import { createTicketTool } from '@/app/ai/tools/ticketTools'
import {
  aggregateResumeData,
  hasMinimumResumeData,
  formatResumeForATS,
  generateResumePDF,
  validateATSCompliance,
  htmlToDataUrl
} from '../services'
import { ResumeTemplateStyle } from '../types'

/**
 * Agent tool for generating ATS-friendly PDF resumes
 * 
 * User can say:
 * - "أنشئ لي سيرة ذاتية"
 * - "Create me a resume/CV"
 * - "أريد تحميل سيرتي الذاتية"
 */
export const generateResumePDFTool: Tool = {
  name: 'generateResumePDFTool',
  description: `إنشاء سيرة ذاتية احترافية بصيغة PDF متوافقة مع أنظمة تتبع المتقدمين (ATS).
  يجمع جميع بيانات المستخدم (الملف الشخصي، الخبرات، المهارات، الشهادات) وينشئ ملف PDF جاهز للتحميل.
  استخدم هذه الأداة عندما يطلب المستخدم إنشاء أو تحميل سيرته الذاتية.`,

  parameters: {
    user_id: 'معرف المستخدم (UUID) - مطلوب',
    template_style: 'نمط القالب: modern (حديث)، classic (كلاسيكي)، minimal (بسيط) - اختياري، الافتراضي: modern',
  },

  execute: async (params: {
    user_id: string
    template_style?: ResumeTemplateStyle
  }): Promise<ToolResult> => {
    console.log('🤖 generateResumePDFTool - Starting execution')

    try {
      const { user_id, template_style = 'modern' } = params

      // Validate user_id
      if (!user_id) {
        return {
          success: false,
          error: 'معرف المستخدم مطلوب'
        }
      }

      console.log('📊 Aggregating data for user:', user_id)

      // Step 1: Aggregate all user data
      const aggregatedData = await aggregateResumeData(user_id)

      // Step 2: Check if we have minimum required data
      const { valid, missing } = hasMinimumResumeData(aggregatedData)
      if (!valid) {
        return {
          success: false,
          error: `بيانات غير كافية لإنشاء السيرة الذاتية. يرجى إكمال البيانات التالية أولاً: ${missing.join('، ')}`
        }
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
        template_style,
        'ar'
      )

      // Step 6: Convert to data URL
      const dataUrl = htmlToDataUrl(html)

      // Step 7: Log the action
      await logAgentAction(user_id, 'generate_resume_pdf', params, {
        success: true,
        fileName,
        atsScore: atsReport.score
      })

      // Step 8: Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'resume'
      })

      // Step 9: Create follow-up ticket
      await createTicketTool.execute({
        user_id,
        title: 'إنشاء سيرة ذاتية PDF عبر المساعد الذكي',
        category: 'agent_action',
        description: `تم إنشاء سيرة ذاتية بصيغة PDF. النمط: ${template_style}، درجة ATS: ${atsReport.score}%`
      })

      console.log('✅ Resume PDF generated successfully')

      return {
        success: true,
        data: {
          pdfUrl: dataUrl,
          fileName,
          atsScore: atsReport.score,
          atsIssues: atsReport.issues,
          atsWarnings: atsReport.warnings
        },
        message: `تم إنشاء سيرتك الذاتية بنجاح! ✅

📄 اسم الملف: ${fileName}
📊 درجة التوافق مع أنظمة ATS: ${atsReport.score}%

${atsReport.warnings.length > 0 ? `⚠️ تنبيهات:\n${atsReport.warnings.map(w => `• ${w}`).join('\n')}` : ''}

يمكنك تحميل الملف الآن من الرابط المرفق.`
      }

    } catch (error: any) {
      console.error('❌ generateResumePDFTool failed:', error)

      return {
        success: false,
        error: error.message || 'فشل إنشاء السيرة الذاتية'
      }
    }
  }
}


