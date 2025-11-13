import { Tool, ToolResult } from './types'
import { db, findById, update } from '@/lib/db/db'
import { updateUserBehavior } from './logger'

/**
 * Predict User Need Tool
 */
export const predictUserNeedTool: Tool = {
  name: 'predictUserNeedTool',
  description: 'تنبؤ باحتياجات المستخدم بناءً على سلوكه',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
  },
  execute: async (params: { user_id: string }): Promise<ToolResult> => {
    try {
      const { user_id } = params

      // Fetch user behavior
      const behavior: any = await findById('user_behavior', user_id)
      
      if (!behavior) {
        return {
          success: true,
          data: { prediction: 'no_data' },
          message: 'لا توجد بيانات كافية للتنبؤ'
        }
      }

      // Simple prediction logic based on last_seen_service
      let prediction = 'general_inquiry'
      
      if (behavior.last_seen_service === 'contracts') {
        prediction = 'renew_contract'
      } else if (behavior.last_seen_service === 'resume') {
        prediction = 'update_resume'
      } else if (behavior.last_seen_service === 'certificates') {
        prediction = 'request_certificate'
      }

      // Update prediction in database
      await updateUserBehavior(user_id, {
        predicted_need: prediction,
        needs_prediction: prediction
      })

      return {
        success: true,
        data: { prediction },
        message: `التنبؤ: ${prediction}`
      }
    } catch (error: any) {
      console.error('Error in predictUserNeedTool:', error)
      return {
        success: false,
        error: error.message || 'فشل التنبؤ'
      }
    }
  }
}

/**
 * Record Feedback Tool
 */
export const recordFeedbackTool: Tool = {
  name: 'recordFeedbackTool',
  description: 'تسجيل تقييم المستخدم',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    feedback_score: 'التقييم (1-5)',
    feedback_comment: 'تعليق (اختياري)',
    interaction_success: 'نجاح التفاعل (true/false)',
  },
  execute: async (params: {
    user_id: string
    feedback_score: number
    feedback_comment?: string
    interaction_success: boolean
  }): Promise<ToolResult> => {
    try {
      const { user_id, feedback_score, feedback_comment, interaction_success } = params

      // Validate feedback score
      if (feedback_score < 1 || feedback_score > 5) {
        return {
          success: false,
          error: 'التقييم يجب أن يكون بين 1 و 5'
        }
      }

      // Calculate new success rate
      const behavior: any = await findById('user_behavior', user_id)
      let newSuccessRate = interaction_success ? 1.0 : 0.0
      
      if (behavior?.success_rate !== null && behavior?.success_rate !== undefined) {
        // Moving average
        newSuccessRate = (behavior.success_rate * 0.8) + (newSuccessRate * 0.2)
      }

      // Update user behavior
      await updateUserBehavior(user_id, {
        predicted_need: 'feedback_recorded'
      })

      // Update feedback fields directly
      await update('user_behavior', { user_id }, {
        feedback_score,
        feedback_comment: feedback_comment || '',
        last_rating_at: new Date().toISOString()
      })

      return {
        success: true,
        data: { feedback_score, success_rate: newSuccessRate },
        message: 'تم تسجيل التقييم بنجاح'
      }
    } catch (error: any) {
      console.error('Error in recordFeedbackTool:', error)
      return {
        success: false,
        error: error.message || 'فشل تسجيل التقييم'
      }
    }
  }
}
