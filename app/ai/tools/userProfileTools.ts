import { Tool, ToolResult } from './types'
import { db } from '@/lib/db/db'

export const getUserProfileTool: Tool = {
  name: 'getUserProfileTool',
  description: 'Get user profile information including full_name, phone, email, nationality, etc.',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
  },
  execute: async (params: { user_id: string }): Promise<ToolResult> => {
    try {
      const { user_id } = params

      const { data, error } = await db
        .from('user_profile')
        .select('*')
        .eq('user_id', user_id)
        .single()

      if (error) {
        return {
          success: false,
          error: 'فشل جلب معلومات المستخدم'
        }
      }

      if (!data) {
        return {
          success: false,
          error: 'لم يتم العثور على ملف المستخدم'
        }
      }

      return {
        success: true,
        data: data,
        message: `تم جلب معلومات المستخدم: ${data.full_name}`
      }
    } catch (error: any) {
      console.error('Error in getUserProfileTool:', error)
      return {
        success: false,
        error: error.message || 'فشل جلب معلومات المستخدم'
      }
    }
  }
}
