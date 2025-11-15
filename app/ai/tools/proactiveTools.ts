import { Tool, ToolResult } from './types'
import { db, findByUser, insert, update } from '@/lib/db/db'

/**
 * Get Proactive Events for User
 */
export const getProactiveEventsTool: Tool = {
  name: 'getProactiveEventsTool',
  description: 'جلب الأحداث الاستباقية للمستخدم',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    acted_only: 'عرض الأحداث المُنفذة فقط (اختياري)',
  },
  execute: async (params: { user_id: string; acted_only?: boolean }): Promise<ToolResult> => {
    try {
      const { user_id, acted_only } = params

      let query = db
        .from('proactive_events')
        .select('*')
        .eq('user_id', user_id)
        .order('detected_at', { ascending: false })

      if (acted_only !== undefined) {
        query = query.eq('acted', acted_only)
      }

      const { data: events, error } = await query

      if (error) throw error

      if (!events || events.length === 0) {
        return {
          success: true,
          data: [],
          message: 'لا توجد أحداث استباقية'
        }
      }

      return {
        success: true,
        data: events,
        message: `لديك ${events.length} حدث استباقي`
      }
    } catch (error: any) {
      console.error('Error in getProactiveEventsTool:', error)
      return {
        success: false,
        error: error.message || 'فشل جلب الأحداث'
      }
    }
  }
}

/**
 * Mark Proactive Event as Acted
 */
export const markEventActedTool: Tool = {
  name: 'markEventActedTool',
  description: 'تحديد حدث استباقي كمُنفذ',
  parameters: {
    event_id: 'معرف الحدث (UUID)',
  },
  execute: async (params: { event_id: string }): Promise<ToolResult> => {
    try {
      const { event_id } = params

      const { data, error } = await db
        .from('proactive_events')
        .update({
          acted: true,
          action_at: new Date().toISOString()
        })
        .eq('id', event_id)
        .select()

      if (error) throw error

      return {
        success: true,
        data: data?.[0],
        message: 'تم تحديث الحدث بنجاح'
      }
    } catch (error: any) {
      console.error('Error in markEventActedTool:', error)
      return {
        success: false,
        error: error.message || 'فشل تحديث الحدث'
      }
    }
  }
}

/**
 * Create Proactive Event
 */
export const createProactiveEventTool: Tool = {
  name: 'createProactiveEventTool',
  description: 'إنشاء حدث استباقي جديد',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    event_type: 'نوع الحدث',
    suggested_action: 'الإجراء المقترح',
    metadata: 'بيانات إضافية (اختياري)',
  },
  execute: async (params: {
    user_id: string
    event_type: string
    suggested_action: string
    metadata?: any
  }): Promise<ToolResult> => {
    try {
      const { user_id, event_type, suggested_action, metadata } = params

      const eventData = {
        user_id,
        event_type,
        suggested_action,
        metadata: metadata || {},
        acted: false,
        detected_at: new Date().toISOString()
      }

      const result: any = await insert('proactive_events', eventData)

      return {
        success: true,
        data: result.data,
        message: 'تم إنشاء الحدث الاستباقي بنجاح'
      }
    } catch (error: any) {
      console.error('Error in createProactiveEventTool:', error)
      return {
        success: false,
        error: error.message || 'فشل إنشاء الحدث'
      }
    }
  }
}

