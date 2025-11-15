// ML-Based Prediction Engine (Simplified)

import { db } from '@/lib/db/db'

export interface UserPrediction {
  user_id: string
  predicted_need: string
  confidence: number
  reasoning: string[]
  suggested_services: string[]
}

export async function predictUserNeeds(user_id: string): Promise<UserPrediction> {
  // Fetch user data
  const { data: behavior } = await db
    .from('user_behavior')
    .select('*')
    .eq('user_id', user_id)
    .single()

  const { data: conversations } = await db
    .from('conversations')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: contracts } = await db
    .from('employment_contracts')
    .select('*')
    .eq('user_id', user_id)

  const { data: tickets } = await db
    .from('tickets')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: appointments } = await db
    .from('labor_appointments')
    .select('*')
    .eq('user_id', user_id)

  const { data: certificates } = await db
    .from('certificates')
    .select('*')
    .eq('user_id', user_id)

  // Feature extraction
  const features = {
    total_conversations: conversations?.length || 0,
    total_tickets: tickets?.length || 0,
    open_tickets: tickets?.filter(t => t.status === 'open').length || 0,
    total_contracts: contracts?.length || 0,
    active_contracts: contracts?.filter(c => c.status === 'active').length || 0,
    total_appointments: appointments?.length || 0,
    scheduled_appointments: appointments?.filter(a => a.status === 'scheduled').length || 0,
    total_certificates: certificates?.length || 0,
    consecutive_complaints: behavior?.consecutive_complaints_count || 0,
    success_rate: behavior?.success_rate || 1.0,
    last_seen_service: behavior?.last_seen_service || 'unknown'
  }

  // Rule-based prediction logic
  let predicted_need = 'general_inquiry'
  let confidence = 0.5
  let reasoning: string[] = []
  let suggested_services: string[] = []

  // Priority 1: Urgent issues
  if (features.consecutive_complaints >= 3) {
    predicted_need = 'urgent_support_needed'
    confidence = 0.95
    reasoning.push('المستخدم يعاني من مشاكل متكررة')
    reasoning.push(`عدد الشكاوى المتتالية: ${features.consecutive_complaints}`)
    suggested_services.push('فتح تذكرة دعم عاجلة')
    suggested_services.push('التواصل مع مشرف')
  }
  // Priority 2: Contract-related needs
  else if (features.active_contracts > 0) {
    const expiringContract = contracts?.find(c => {
      if (!c.end_date || c.status !== 'active') return false
      const daysUntil = Math.ceil((new Date(c.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil <= 30 && daysUntil > 0
    })

    if (expiringContract) {
      predicted_need = 'contract_renewal'
      confidence = 0.85
      reasoning.push('لديك عقد ينتهي قريباً')
      reasoning.push(`العقد مع ${expiringContract.employer_name}`)
      suggested_services.push('تجديد العقد')
      suggested_services.push('إصدار شهادة خبرة')
    } else {
      predicted_need = 'certificate_request'
      confidence = 0.65
      reasoning.push('لديك عقد نشط')
      suggested_services.push('إصدار شهادة راتب')
      suggested_services.push('إصدار شهادة خدمة')
    }
  }
  // Priority 3: Appointment-related
  else if (features.scheduled_appointments > 0) {
    predicted_need = 'appointment_preparation'
    confidence = 0.80
    reasoning.push(`لديك ${features.scheduled_appointments} موعد قادم`)
    suggested_services.push('تجهيز المستندات المطلوبة')
    suggested_services.push('التحقق من موقع المكتب')
  }
  // Priority 4: Open tickets
  else if (features.open_tickets > 0) {
    predicted_need = 'ticket_follow_up'
    confidence = 0.75
    reasoning.push(`لديك ${features.open_tickets} تذكرة مفتوحة`)
    suggested_services.push('متابعة التذاكر')
    suggested_services.push('تحديث حالة الطلبات')
  }
  // Priority 5: Frequent service user
  else if (behavior?.last_seen_service) {
    predicted_need = `frequent_${behavior.last_seen_service}_user`
    confidence = 0.70
    reasoning.push(`آخر خدمة استخدمتها: ${behavior.last_seen_service}`)
    
    // Service-specific suggestions
    if (behavior.last_seen_service === 'certificates') {
      suggested_services.push('إصدار شهادات إضافية')
      suggested_services.push('التحقق من الشهادات السابقة')
    } else if (behavior.last_seen_service === 'contracts') {
      suggested_services.push('تحديث معلومات العقد')
      suggested_services.push('طلب تعديل شروط العقد')
    } else if (behavior.last_seen_service === 'resumes') {
      suggested_services.push('تحديث السيرة الذاتية')
      suggested_services.push('إضافة دورات تدريبية')
    }
  }
  // Priority 6: Pattern detection from conversations
  else if (conversations && conversations.length > 0) {
    const recentTopics = extractTopicsFromConversations(conversations)
    if (recentTopics.length > 0) {
      predicted_need = `interested_in_${recentTopics[0]}`
      confidence = 0.60
      reasoning.push(`المواضيع الأخيرة: ${recentTopics.join(', ')}`)
      suggested_services.push(`خدمات ${recentTopics[0]}`)
    }
  }

  // Save prediction to user_behavior
  await db
    .from('user_behavior')
    .upsert({
      user_id,
      predicted_need,
      needs_prediction: JSON.stringify({
        predicted_need,
        confidence,
        reasoning,
        suggested_services,
        timestamp: new Date().toISOString()
      }),
      updated_at: new Date().toISOString()
    })

  return {
    user_id,
    predicted_need,
    confidence,
    reasoning,
    suggested_services
  }
}

function extractTopicsFromConversations(conversations: any[]): string[] {
  const topicKeywords = {
    'عقد': 'contracts',
    'عقود': 'contracts',
    'شهادة': 'certificates',
    'شهادات': 'certificates',
    'موعد': 'appointments',
    'مواعيد': 'appointments',
    'تذكرة': 'tickets',
    'تذاكر': 'tickets',
    'سيرة': 'resumes',
    'دورة': 'courses',
    'تقييم': 'feedback'
  }

  const topicCounts: Record<string, number> = {}

  conversations.forEach(conv => {
    if (!conv.content) return
    
    Object.entries(topicKeywords).forEach(([keyword, topic]) => {
      if (conv.content.includes(keyword)) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
      }
    })
  })

  return Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic)
    .slice(0, 3)
}

