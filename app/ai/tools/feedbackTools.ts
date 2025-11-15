import { Tool, ToolResult } from './types'
import { db, findByUser, insert } from '@/lib/db/db'

/**
 * Get User Feedback History
 */
export const getFeedbackTool: Tool = {
  name: 'getFeedbackTool',
  description: 'جلب تاريخ تقييمات المستخدم',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
  },
  execute: async (params: { user_id: string }): Promise<ToolResult> => {
    try {
      const { user_id } = params

      const feedbacks: any[] = await findByUser('agent_feedback', user_id)

      if (!feedbacks || feedbacks.length === 0) {
        return {
          success: true,
          data: [],
          message: 'لا توجد تقييمات سابقة'
        }
      }

      // Calculate average rating
      const avgRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
      
      // Count sentiments
      const sentimentCounts = {
        positive: feedbacks.filter(f => f.sentiment === 'positive').length,
        neutral: feedbacks.filter(f => f.sentiment === 'neutral').length,
        negative: feedbacks.filter(f => f.sentiment === 'negative').length
      }

      return {
        success: true,
        data: {
          feedbacks,
          count: feedbacks.length,
          average_rating: avgRating.toFixed(2),
          sentiment_counts: sentimentCounts
        },
        message: `لديك ${feedbacks.length} تقييم، متوسط التقييم: ${avgRating.toFixed(1)}/5`
      }
    } catch (error: any) {
      console.error('Error in getFeedbackTool:', error)
      return {
        success: false,
        error: error.message || 'فشل جلب التقييمات'
      }
    }
  }
}

/**
 * Analyze User Sentiment
 */
export const analyzeSentimentTool: Tool = {
  name: 'analyzeSentimentTool',
  description: 'تحليل مشاعر المستخدم من تقييماته',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
  },
  execute: async (params: { user_id: string }): Promise<ToolResult> => {
    try {
      const { user_id } = params

      const { data: feedbacks } = await db
        .from('agent_feedback')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!feedbacks || feedbacks.length === 0) {
        return {
          success: true,
          data: { sentiment: 'unknown', confidence: 0 },
          message: 'لا توجد بيانات كافية للتحليل'
        }
      }

      // Recent sentiment analysis (last 10 feedbacks)
      const recentPositive = feedbacks.filter(f => f.sentiment === 'positive').length
      const recentNegative = feedbacks.filter(f => f.sentiment === 'negative').length
      const recentNeutral = feedbacks.filter(f => f.sentiment === 'neutral').length

      let overallSentiment = 'neutral'
      let confidence = 0.5

      if (recentPositive > recentNegative && recentPositive > recentNeutral) {
        overallSentiment = 'positive'
        confidence = recentPositive / feedbacks.length
      } else if (recentNegative > recentPositive) {
        overallSentiment = 'negative'
        confidence = recentNegative / feedbacks.length
      }

      return {
        success: true,
        data: {
          sentiment: overallSentiment,
          confidence: confidence.toFixed(2),
          breakdown: {
            positive: recentPositive,
            neutral: recentNeutral,
            negative: recentNegative
          }
        },
        message: `التحليل: المستخدم يبدو ${overallSentiment === 'positive' ? 'راضي' : overallSentiment === 'negative' ? 'غير راضي' : 'محايد'} (ثقة: ${(confidence * 100).toFixed(0)}%)`
      }
    } catch (error: any) {
      console.error('Error in analyzeSentimentTool:', error)
      return {
        success: false,
        error: error.message || 'فشل تحليل المشاعر'
      }
    }
  }
}

