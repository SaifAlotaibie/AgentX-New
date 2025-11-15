import { getProactiveEventsForUser, executeProactiveEngineForUser } from '../proactive'
import { db } from '@/lib/db/db'

/**
 * Generate personalized welcome message based on user behavior
 */
export async function generateWelcomeMessage(userId: string, userName?: string): Promise<string> {
  try {
    // 1. Get pending proactive events
    const pendingEvents = await getProactiveEventsForUser(userId, 3)
    
    // 2. Get user behavior
    const { data: behavior } = await db
      .from('user_behavior')
      .select('*')
      .eq('user_id', userId)
      .single()

    // 3. Run prediction engine
    const proactiveResult = await executeProactiveEngineForUser(userId)
    const prediction = proactiveResult.predictions.get(userId)

    // 4. Build personalized welcome message
    const greeting = userName ? `مرحباً ${userName}!` : 'مرحباً بك!'

    // If there are urgent proactive events
    if (pendingEvents.length > 0) {
      const urgentEvent = pendingEvents[0]
      return `${greeting} 👋\n\n🔔 **تنبيه مهم:**\n${urgentEvent.suggested_action}\n\nكيف يمكنني مساعدتك اليوم؟`
    }

    // If there's a high-confidence prediction
    if (prediction && prediction.confidence > 0.7) {
      const suggestions = {
        'update_resume': 'لاحظت أنك تعمل على تحديث سيرتك الذاتية. هل ترغب في إكمالها الآن؟',
        'renew_contract': 'يبدو أن عقدك الوظيفي يحتاج لتجديد. هل تريد أن أساعدك؟',
        'book_appointment': 'هل تحتاج لحجز موعد في مكتب العمل؟',
        'issue_certificate': 'هل ترغب في إصدار شهادة جديدة؟',
      }

      const suggestion = suggestions[prediction.predicted_need as keyof typeof suggestions]
      
      if (suggestion) {
        return `${greeting} 👋\n\n${suggestion}\n\nأو كيف يمكنني مساعدتك اليوم؟`
      }
    }

    // If user had recent incomplete action
    if (behavior?.last_message && behavior.intent) {
      const lastActionTime = new Date(behavior.updated_at || '')
      const hoursSinceLastAction = (Date.now() - lastActionTime.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastAction < 48) {
        const intentMessages = {
          'update_resume': 'أهلاً مجدداً! آخر مرة كنت تعمل على تحديث السيرة الذاتية. هل تريد المتابعة؟',
          'create_ticket': 'مرحباً! لاحظت أن لديك تذكرة مفتوحة. هل تريد متابعتها؟',
          'book_appointment': 'أهلاً! هل أكملت حجز موعدك؟ أو تحتاج مساعدة إضافية؟',
        }

        const message = intentMessages[behavior.intent as keyof typeof intentMessages]
        if (message) {
          return `${greeting} 👋\n\n${message}`
        }
      }
    }

    // Default welcome message with available services
    return `${greeting} 👋

أنا المساعد الذكي لمنصة قوى، هنا لمساعدتك في جميع خدماتك.

📋 يمكنني مساعدتك في:
• إصدار الشهادات فوراً 📄
• حجز المواعيد 📅
• إدارة العقود 💼
• فتح ومتابعة التذاكر 🎫
• تحديث السيرة الذاتية 📝

كيف يمكنني مساعدتك اليوم؟`

  } catch (error) {
    console.error('Error generating welcome message:', error)
    
    // Fallback message
    return `مرحباً بك في المساعد الذكي! 👋

أنا هنا لمساعدتك في جميع خدمات منصة قوى.
كيف يمكنني مساعدتك اليوم؟`
  }
}

