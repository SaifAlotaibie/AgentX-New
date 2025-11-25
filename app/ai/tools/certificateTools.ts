import { Tool, ToolResult } from './types'
import { findById, findByUser, insert } from '@/lib/db/db'
import { Certificate } from '@/lib/db/types'
import { logAgentAction, updateUserBehavior } from './logger'
import { createTicketTool } from './ticketTools'

/**
 * Get Certificates Tool
 */
export const getCertificatesTool: Tool = {
  name: 'getCertificatesTool',
  description: 'جلب جميع الشهادات الصادرة للمستخدم',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    type: 'نوع الشهادة (اختياري): salary_definition, service_certificate, labor_license',
  },
  execute: async (params: { user_id: string; type?: string }): Promise<ToolResult> => {
    try {
      const { user_id, type } = params

      let certificates = await findByUser<Certificate>('certificates', user_id)

      if (type) {
        certificates = certificates.filter((c: any) => c.certificate_type === type)
      }

      await updateUserBehavior(user_id, {
        last_seen_service: 'certificates'
      })

      return {
        success: true,
        data: certificates || [],
        message: 'تم جلب الشهادات بنجاح'
      }
    } catch (error: any) {
      console.error('Error in getCertificatesTool:', error)
      return {
        success: false,
        error: error.message || 'فشل جلب الشهادات'
      }
    }
  }
}

/**
 * Create Certificate Tool
 * Auto-creates ticket after certificate generation
 */
export const createCertificateTool: Tool = {
  name: 'createCertificateTool',
  description: 'إصدار شهادة جديدة (راتب/خبرة/ترخيص)',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    type: 'نوع الشهادة: salary_definition, service_certificate, labor_license',
    content: 'محتوى الشهادة (اختياري - يتم توليده تلقائياً)',
  },
  execute: async (params: {
    user_id: string
    type: 'salary_definition' | 'service_certificate' | 'labor_license'
    content?: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, type, content } = params

      // Validate type
      const validTypes = ['salary_definition', 'service_certificate', 'labor_license']
      if (!validTypes.includes(type)) {
        return {
          success: false,
          error: 'نوع الشهادة غير صحيح'
        }
      }

      // Generate certificate content if not provided
      let certificateContent = content
      if (!content) {
        // Fetch user profile and contract data
        const profile: any = await findById('user_profile', user_id)
        const contracts: any[] = await findByUser('employment_contracts', user_id)
        const activeContract: any = contracts?.find((c: any) => c.status === 'active')

        if (!profile) {
          return {
            success: false,
            error: 'لم يتم العثور على بيانات المستخدم'
          }
        }

        // Generate content based on type
        switch (type) {
          case 'salary_definition':
            certificateContent = `شهادة تعريف بالراتب

نشهد بأن ${profile.full_name}
رقم الهوية: ${profile.national_id || 'غير محدد'}
يعمل لدينا بوظيفة: ${activeContract?.position || profile.job_title || 'غير محدد'}
براتب شهري قدره: ${activeContract?.salary || 'غير محدد'} ريال سعودي

صدرت هذه الشهادة بناءً على طلب المعني، ودون أدنى مسؤولية على الوزارة.

التاريخ: ${new Date().toLocaleDateString('ar-SA')}`
            break

          case 'service_certificate':
            const startDate = activeContract?.start_date ? new Date(activeContract.start_date).toLocaleDateString('ar-SA') : 'غير محدد'
            certificateContent = `شهادة خبرة

نشهد بأن ${profile.full_name}
رقم الهوية: ${profile.national_id || 'غير محدد'}
يعمل/عمل لدينا في الوظائف التالية:
- ${activeContract?.position || profile.job_title || 'غير محدد'}

تاريخ بداية العمل: ${startDate}

صدرت هذه الشهادة بناءً على طلب المعني.

التاريخ: ${new Date().toLocaleDateString('ar-SA')}`
            break

          case 'labor_license':
            certificateContent = `ترخيص الاستشارات العمالية

اسم المرخص له: ${profile.full_name}
رقم الهوية: ${profile.national_id || 'غير محدد'}

يُصرح للمذكور أعلاه بممارسة نشاط الاستشارات العمالية وفقاً للأنظمة واللوائح المعمول بها في المملكة العربية السعودية.

رقم الترخيص: ${Date.now()}-LC
تاريخ الإصدار: ${new Date().toLocaleDateString('ar-SA')}
تاريخ الانتهاء: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA')}`
            break
        }
      }

      // Create certificate
      const certificateData = {
        user_id,
        certificate_type: type,
        content: certificateContent,
        status: 'valid',
        issue_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      const result: any = await insert('certificates', certificateData)

      // Log action
      await logAgentAction(user_id, 'create_certificate', params, result)

      // Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'certificates'
      })

      // Auto-create ticket (MANDATORY)
      const typeNames: Record<string, string> = {
        salary_definition: 'شهادة تعريف بالراتب',
        service_certificate: 'شهادة خبرة',
        labor_license: 'ترخيص استشارات عمالية'
      }

      await createTicketTool.execute({
        user_id,
        title: `إصدار ${typeNames[type]} عبر المساعد الذكي`,
        category: 'agent_action',
        description: `تم إصدار ${typeNames[type]} بنجاح`
      })

      return {
        success: true,
        data: result.data,
        message: `تم إصدار ${typeNames[type]} بنجاح وفتح تذكرة متابعة`
      }
    } catch (error: any) {
      console.error('Error in createCertificateTool:', error)
      return {
        success: false,
        error: error.message || 'فشل إصدار الشهادة'
      }
    }
  }
}
