import { Tool, ToolResult } from './types'
import { findByUser, insert } from '@/lib/db/db'
import { DomesticLaborRequest } from '@/lib/db/types'
import { logAgentAction, updateUserBehavior } from './logger'
import { createTicketTool } from './ticketTools'

/**
 * Get Domestic Labor Requests Tool
 */
export const getDomesticLaborRequestsTool: Tool = {
  name: 'getDomesticLaborRequestsTool',
  description: 'جلب جميع طلبات العمالة المنزلية للمستخدم',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    status: 'حالة الطلب (اختياري): pending, approved, rejected',
  },
  execute: async (params: { user_id: string; status?: string }): Promise<ToolResult> => {
    try {
      const { user_id, status } = params

      let requests = await findByUser<DomesticLaborRequest>('domestic_labor_requests', user_id)
      
      if (status) {
        requests = requests.filter(r => r.status === status)
      }

      await updateUserBehavior(user_id, {
        last_seen_service: 'domestic_labor',
      })

      return {
        success: true,
        data: requests || [],
        message: 'تم جلب طلبات العمالة المنزلية بنجاح'
      }
    } catch (error: any) {
      console.error('Error in getDomesticLaborRequestsTool:', error)
      return {
        success: false,
        error: error.message || 'فشل جلب طلبات العمالة المنزلية'
      }
    }
  }
}

/**
 * Create Domestic Labor Request Tool
 * Auto-creates ticket after request creation
 */
export const createDomesticLaborRequestTool: Tool = {
  name: 'createDomesticLaborRequestTool',
  description: 'إنشاء طلب استقدام عمالة منزلية جديد',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    worker_name: 'اسم العامل/العاملة',
    request_type: 'نوع الطلب (مثال: استقدام، نقل خدمات، إلخ)',
  },
  execute: async (params: {
    user_id: string
    worker_name: string
    request_type: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, worker_name, request_type } = params

      // Validate required fields
      if (!worker_name || !request_type) {
        return {
          success: false,
          error: 'اسم العامل ونوع الطلب مطلوبان'
        }
      }

      // Create request
      const requestData = {
        user_id,
        worker_name,
        request_type,
        status: 'pending',
        created_at: new Date().toISOString()
      }

      const result: any = await insert('domestic_labor_requests', requestData)

      // Log action
      await logAgentAction(user_id, 'create_domestic_labor_request', params, result)

      // Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'domestic_labor'
      })

      // Auto-create ticket (MANDATORY)
      await createTicketTool.execute({
        user_id,
        title: 'طلب عمالة منزلية عبر المساعد الذكي',
        category: 'agent_action',
        description: `تم إنشاء طلب ${request_type} للعامل/ة: ${worker_name}`
      })

      return {
        success: true,
        data: result.data,
        message: 'تم إنشاء الطلب بنجاح وفتح تذكرة متابعة'
      }
    } catch (error: any) {
      console.error('Error in createDomesticLaborRequestTool:', error)
      return {
        success: false,
        error: error.message || 'فشل إنشاء طلب العمالة المنزلية'
      }
    }
  }
}
