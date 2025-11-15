import { Tool, ToolResult } from './types'
import { db, findById, update, insert } from '@/lib/db/db'
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
 * Stores feedback in agent_feedback table
 */
export const recordFeedbackTool: Tool = {
  name: 'recordFeedbackTool',
  description: 'تسجيل تقييم وملاحظات المستخدم',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    rating: 'التقييم (1-5)',
    feedback_text: 'نص التقييم (اختياري)',
    conversation_id: 'معرف المحادثة (UUID - اختياري)',
  },
  execute: async (params: {
    user_id: string
    rating: number
    feedback_text?: string
    conversation_id?: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, rating, feedback_text, conversation_id } = params

      // Validate rating
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: 'التقييم يجب أن يكون بين 1 و 5'
        }
      }

      // Determine sentiment based on rating
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
      if (rating >= 4) sentiment = 'positive'
      else if (rating <= 2) sentiment = 'negative'

      // Insert into agent_feedback table
      const feedbackData = {
        user_id,
        conversation_id: conversation_id || null,
        rating,
        feedback_text: feedback_text || null,
        sentiment,
        created_at: new Date().toISOString()
      }

      const result: any = await insert('agent_feedback', feedbackData)

      // Update user behavior to reflect feedback was given
      await updateUserBehavior(user_id, {
        last_message: `تقييم: ${rating}/5`
      })

      return {
        success: true,
        data: result.data,
        message: `شكراً لتقييمك! تم تسجيل تقييمك (${rating}/5) بنجاح`
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
