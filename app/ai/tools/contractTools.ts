import { Tool, ToolResult } from './types'
import { findByUser, findById, update } from '@/lib/db/db'
import { EmploymentContract } from '@/lib/db/types'
import { logAgentAction, updateUserBehavior } from './logger'
import { createTicketTool } from './ticketTools'
import * as contractsService from '@/services/qiwa/contractsService'

/**
 * Get Contracts Tool
 * View all user contracts with details
 */
export const getContractsTool: Tool = {
  name: 'getContractsTool',
  description: 'عرض جميع عقود المستخدم مع التفاصيل',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
  },
  execute: async (params: { user_id: string }): Promise<ToolResult> => {
    try {
      const { user_id } = params

      const contracts = await contractsService.getContracts(user_id)
      
      if (!contracts || contracts.length === 0) {
        return {
          success: true,
          data: { contracts: [], count: 0 },
          message: 'لا توجد عقود مسجلة'
        }
      }

      await updateUserBehavior(user_id, {
        last_seen_service: 'contracts',
      })

      return {
        success: true,
        data: { contracts, count: contracts.length },
        message: `تم العثور على ${contracts.length} عقد`
      }
    } catch (error: any) {
      console.error('Error in getContractsTool:', error)
      return {
        success: false,
        error: error.message || 'فشل جلب العقود'
      }
    }
  }
}

/**
 * Check Contract Expiry Tool
 */
export const checkContractExpiryTool: Tool = {
  name: 'checkContractExpiryTool',
  description: 'فحص العقود المنتهية أو القريبة من الانتهاء',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    days_threshold: 'عدد الأيام للتحذير (افتراضي: 30 يوم)',
  },
  execute: async (params: { user_id: string; days_threshold?: number }): Promise<ToolResult> => {
    try {
      const { user_id, days_threshold = 30 } = params

      const contracts = await findByUser<EmploymentContract>('employment_contracts', user_id)
      
      if (!contracts || contracts.length === 0) {
        return {
          success: true,
          data: { expiring: [], expired: [] },
          message: 'لا توجد عقود للمستخدم'
        }
      }

      const now = new Date()
      const thresholdDate = new Date(now.getTime() + days_threshold * 24 * 60 * 60 * 1000)

      const expiring: EmploymentContract[] = []
      const expired: EmploymentContract[] = []

      for (const contract of contracts) {
        if (contract.end_date && (contract as any).status === 'active') {
          const endDate = new Date(contract.end_date)
          
          if (endDate < now) {
            expired.push(contract)
          } else if (endDate <= thresholdDate) {
            expiring.push(contract)
          }
        }
      }

      await updateUserBehavior(user_id, {
        last_seen_service: 'contracts',
      })

      return {
        success: true,
        data: { expiring, expired },
        message: `تم فحص العقود: ${expired.length} منتهي، ${expiring.length} قريب من الانتهاء`
      }
    } catch (error: any) {
      console.error('Error in checkContractExpiryTool:', error)
      return {
        success: false,
        error: error.message || 'فشل فحص العقود'
      }
    }
  }
}

/**
 * Renew Contract Tool
 * Auto-creates ticket after renewal
 */
export const renewContractTool: Tool = {
  name: 'renewContractTool',
  description: 'تجديد عقد عمل',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    contract_id: 'معرف العقد (UUID)',
    new_end_date: 'تاريخ الانتهاء الجديد (YYYY-MM-DD)',
    new_salary: 'الراتب الجديد (اختياري)',
  },
  execute: async (params: {
    user_id: string
    contract_id: string
    new_end_date: string
    new_salary?: number
  }): Promise<ToolResult> => {
    try {
      const { user_id, contract_id, new_end_date, new_salary } = params

      // Check if contract exists
      const contract = await findById<EmploymentContract>('employment_contracts', contract_id)
      
      if (!contract) {
        return {
          success: false,
          error: 'العقد غير موجود'
        }
      }

      if (contract.user_id !== user_id) {
        return {
          success: false,
          error: 'ليس لديك صلاحية لتجديد هذا العقد'
        }
      }

      // Validate new end date
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(new_end_date)) {
        return {
          success: false,
          error: 'تنسيق التاريخ غير صحيح. يجب أن يكون YYYY-MM-DD'
        }
      }

      const newDate = new Date(new_end_date)
      const today = new Date()
      
      if (newDate <= today) {
        return {
          success: false,
          error: 'تاريخ الانتهاء الجديد يجب أن يكون في المستقبل'
        }
      }

      // Update contract
      const updates: any = {
        end_date: new_end_date,
        status: 'active'
      }

      if (new_salary) {
        updates.salary = new_salary
      }

      const result: any = await update('employment_contracts', { id: contract_id }, updates)

      // Log action
      await logAgentAction(user_id, 'renew_contract', params, result)

      // Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'contracts'
      })

      // Auto-create ticket (MANDATORY)
      await createTicketTool.execute({
        user_id,
        title: 'تجديد عقد عمل عبر المساعد الذكي',
        category: 'agent_action',
        description: `تم تجديد عقد ${contract.position} حتى تاريخ ${new_end_date}${new_salary ? ` براتب جديد: ${new_salary} ريال` : ''}`
      })

      return {
        success: true,
        data: result.data,
        message: 'تم تجديد العقد بنجاح وفتح تذكرة متابعة'
      }
    } catch (error: any) {
      console.error('Error in renewContractTool:', error)
      return {
        success: false,
        error: error.message || 'فشل تجديد العقد'
      }
    }
  }
}

/**
 * Update Contract Tool
 * Auto-creates ticket after update
 */
export const updateContractTool: Tool = {
  name: 'updateContractTool',
  description: 'تحديث بيانات عقد عمل',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    contract_id: 'معرف العقد (UUID)',
    position: 'المسمى الوظيفي (اختياري)',
    salary: 'الراتب (اختياري)',
    end_date: 'تاريخ الانتهاء (اختياري)',
  },
  execute: async (params: {
    user_id: string
    contract_id: string
    position?: string
    salary?: number
    end_date?: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, contract_id, ...updates } = params

      // Check if contract exists
      const contract = await findById<EmploymentContract>('employment_contracts', contract_id)
      
      if (!contract) {
        return {
          success: false,
          error: 'العقد غير موجود'
        }
      }

      if (contract.user_id !== user_id) {
        return {
          success: false,
          error: 'ليس لديك صلاحية لتحديث هذا العقد'
        }
      }

      // Filter out undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      )

      if (Object.keys(cleanUpdates).length === 0) {
        return {
          success: false,
          error: 'لم يتم تقديم أي تحديثات'
        }
      }

      // Update contract
      const result: any = await update('employment_contracts', { id: contract_id }, cleanUpdates)

      // Log action
      await logAgentAction(user_id, 'update_contract', params, result)

      // Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'contracts'
      })

      // Auto-create ticket (MANDATORY)
      const updatedFields = Object.keys(cleanUpdates).join('، ')
      await createTicketTool.execute({
        user_id,
        title: 'تحديث عقد عمل عبر المساعد الذكي',
        category: 'agent_action',
        description: `تم تحديث الحقول التالية في عقد ${contract.position}: ${updatedFields}`
      })

      return {
        success: true,
        data: result.data,
        message: 'تم تحديث العقد بنجاح وفتح تذكرة متابعة'
      }
    } catch (error: any) {
      console.error('Error in updateContractTool:', error)
      return {
        success: false,
        error: error.message || 'فشل تحديث العقد'
      }
    }
  }
}
