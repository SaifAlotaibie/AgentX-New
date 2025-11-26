/**
 * TRUE AGENTIC EXECUTOR
 * LLM makes ALL decisions about tool calling autonomously
 */

import { streamText, stepCountIs } from 'ai'
import { agentModel } from './groq-client'
import { AGENTIC_TOOLS } from './tools-agentic'
import AGENT_SYSTEM_PROMPT from './system_prompt'
import { saveConversation } from '@/lib/db/conversationService'
import { updateUserBehavior, logAgentAction } from '../tools/logger'
import { executeProactiveEngineForUser, getProactiveEventsForUser } from '../proactive'
import { getCachedProactiveData, setCachedProactiveData } from './proactive-cache'
import { db } from '@/lib/db/db'

interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AgentResponse {
  response: any
  isStream: boolean
  tools_used?: string[]
}

/**
 * 🔑 Wrap tools to inject userId automatically
 * LLM doesn't need to provide user_id - we inject it from backend context
 */
function wrapToolsWithUserId(tools: any, userId: string) {
  const wrappedTools: any = {}

  for (const [toolName, toolDef] of Object.entries(tools)) {
    const originalExecute = (toolDef as any).execute

    wrappedTools[toolName] = {
      ...(toolDef as any),
      execute: async (params: any) => {
        // Auto-inject user_id if the tool needs it but LLM didn't provide it
        const finalParams = { ...params }

        // If this tool needs user_id and it's missing/undefined or dummy, inject it
        if (!finalParams.user_id || finalParams.user_id === 'undefined' || finalParams.user_id === '00000000-0000-0000-0000-000000000000') {
          finalParams.user_id = userId
        }

        console.log(`🔧 [AUTO-INJECT] ${toolName} with user_id:`, userId)
        return await originalExecute(finalParams)
      }
    }
  }

  return wrappedTools
}

/**
 * TRUE AGENTIC AGENT EXECUTOR
 * - LLM decides which tools to call
 * - LLM determines parameters
 * - LLM chains multiple tools autonomously
 */
export async function executeAgenticAgent(
  userMessage: string,
  userId: string,
  conversationHistory: AgentMessage[] = []
): Promise<AgentResponse> {
  try {
    console.log('🤖 [AGENTIC] Received message:', userMessage)
    console.log('👤 [AGENTIC] User ID:', userId)

    // Step 1: PROACTIVE ENGINE - Get events and predictions (with caching!)
    let proactiveResult: any
    let pendingEvents: any[]

    const cached = getCachedProactiveData(userId)
    if (cached) {
      // Use cached data (saves 2-5 seconds!)
      pendingEvents = cached.events
      proactiveResult = cached.predictions
      console.log(`⚡ [CACHE HIT] Using cached proactive data`)
    } else {
      // Run fresh proactive engine
      console.log('🔮 [AGENTIC] Running Proactive Engine...')
      proactiveResult = await executeProactiveEngineForUser(userId)
      pendingEvents = await getProactiveEventsForUser(userId, 3)

      // Cache for 5 minutes
      setCachedProactiveData(userId, pendingEvents, proactiveResult)
    }

    console.log(`🎯 [AGENTIC] Proactive: ${pendingEvents.length} events, ${proactiveResult.predictions?.size || 0} predictions`)

    // Step 2: Get user profile for personalized greetings
    const { data: userProfile } = await db
      .from('user_profile')
      .select('full_name')
      .eq('user_id', userId)
      .single()

    // Step 3: Build conversation context with proactive information
    const messages = buildMessages(
      userMessage,
      userId,
      conversationHistory,
      pendingEvents,
      proactiveResult,
      userProfile?.full_name || null
    )

    console.log('🧠 [AGENTIC] Calling Groq GPT-OSS-120B with tool support...')
    console.log('🔧 [AGENTIC] Available tools:', Object.keys(AGENTIC_TOOLS).length)

    // 🔑 Wrap tools to auto-inject user_id
    const toolsWithUserId = wrapToolsWithUserId(AGENTIC_TOOLS, userId)

    // Step 3: LET THE LLM DECIDE - Stream with tool support
    const result = streamText({
      model: agentModel, // openai/gpt-oss-120b
      messages: messages as any,
      tools: toolsWithUserId, // 🎯 Tools with auto-injected user_id!
      temperature: 0.3, // Lower temp for more reliable tool calling
      stopWhen: stepCountIs(5), // 🔑 CRITICAL FIX: Allows model to continue after tools and generate text response
      // Default is stepCountIs(1) which stops immediately after tool execution WITHOUT text generation!

      // Callback when each step finishes
      onStepFinish: async (step) => {
        if (step.toolCalls && step.toolCalls.length > 0) {
          console.log('🔧 [AGENTIC] LLM called tools:',
            step.toolCalls.map(tc => tc.toolName).join(', '))
        }
      },

      // Callback when complete
      async onFinish({ text, toolCalls, toolResults }) {
        console.log('✅ [AGENTIC] Stream finished')
        console.log('📝 [DEBUG] Response text:', text ? `"${text}"` : 'EMPTY')
        console.log('📝 [DEBUG] Text length:', text?.length || 0)

        // 🔥 DEBUG: If tools were called but no text was generated
        if (toolCalls && toolCalls.length > 0 && (!text || text.trim().length === 0)) {
          console.error('⚠️ [WARNING] Tools were called but NO text response was generated!')
          console.error('⚠️ This usually means stopWhen is set to stepCountIs(1) (default behavior)')
          console.error('⚠️ Tool results:', JSON.stringify(toolResults?.slice(0, 2), null, 2))
        }

        const toolsUsed = toolCalls?.map(tc => tc.toolName) || []
        console.log('🔧 [AGENTIC] Total tools used:', toolsUsed.length, toolsUsed)

        // 🔥 PERFORMANCE: Fire-and-forget DB writes (don't block response)
        const intent = detectIntentFromToolCalls(toolCalls)

        // Save conversation (non-blocking)
        saveConversation(userId, 'user', userMessage).catch(err =>
          console.error('Error saving user message:', err))
        saveConversation(userId, 'assistant', text).catch(err =>
          console.error('Error saving assistant message:', err))

        // Update user behavior (non-blocking)
        updateUserBehavior(userId, {
          last_message: userMessage,
          intent: intent,
          predicted_need: proactiveResult?.predictions?.get(userId)?.predicted_need || null
        }).catch(err => console.error('Error updating user behavior:', err))

        // Log agent action (non-blocking)
        logAgentAction(userId, 'agentic_chat', {
          message: userMessage,
          intent,
          tools_called: toolsUsed,
          proactive_events: pendingEvents.length
        }, {
          response: text,
          tool_count: toolCalls?.length || 0,
          tool_results: toolResults?.map(tr => ({ success: (tr as any)?.success || false }))
        }).catch(err => console.error('Error logging agent action:', err))

        console.log('💾 [AGENTIC] DB writes queued (non-blocking)')
      }
    })

    return {
      response: result,
      isStream: true,
      tools_used: []
    }

  } catch (error: any) {
    console.error('❌ [AGENTIC] Error:', error)
    throw error
  }
}

/**
 * Build messages array with proactive context
 */
function buildMessages(
  userMessage: string,
  userId: string,
  history: AgentMessage[],
  pendingEvents: any[],
  proactiveResult: any,
  userName: string | null
): any[] {
  // Start with hybrid system prompt (balanced: comprehensive yet efficient)
  let systemPrompt = AGENT_SYSTEM_PROMPT

  // Add user name context if available
  if (userName) {
    systemPrompt += `\n\n**معلومات المستخدم**: الاسم: ${userName}\n`
  }

  // Note: user_id is automatically injected by the wrapper function
  // LLM doesn't need to worry about it!

  // Helper to get friendly Arabic labels for technical keys (used by both events and predictions)
  const getArabicLabel = (key: string): string => {
    const staticLabels: Record<string, string> = {
      // Events
      'contract_expiring_soon': 'تنبيه: قرب انتهاء العقد',
      'upcoming_appointment': 'تذكير: موعد قادم',
      'ticket_follow_up_needed': 'متابعة: تذكرة مفتوحة',
      'user_dissatisfaction_detected': 'تنبيه: انخفاض مستوى الرضا',
      'incomplete_resume_detected': 'تنبيه: السيرة الذاتية غير مكتملة',

      // Predictions
      'urgent_support_needed': 'دعم عاجل مطلوب',
      'contract_renewal': 'تجديد عقد',
      'certificate_request': 'طلب شهادة',
      'appointment_preparation': 'تجهيز لموعد',
      'ticket_follow_up': 'متابعة تذاكر',
      'general_inquiry': 'استفسار عام'
    }

    if (staticLabels[key]) return staticLabels[key]

    // Dynamic Predictions
    if (key.startsWith('frequent_')) {
      if (key.includes('certificates')) return 'مستخدم نشط للشهادات'
      if (key.includes('contracts')) return 'مستخدم نشط للعقود'
      if (key.includes('resumes')) return 'مستخدم نشط للسير الذاتية'
    }

    if (key.startsWith('interested_in_')) {
      if (key.includes('contracts')) return 'مهتم بالعقود'
      if (key.includes('certificates')) return 'مهتم بالشهادات'
      if (key.includes('appointments')) return 'مهتم بالمواعيد'
      if (key.includes('tickets')) return 'مهتم بالتذاكر'
      if (key.includes('resumes')) return 'مهتم بالسير الذاتية'
      if (key.includes('courses')) return 'مهتم بالدورات'
      if (key.includes('feedback')) return 'مهتم بالتقييم'
    }

    return key // Fallback
  }

  // Add proactive context if available
  if (pendingEvents.length > 0) {
    systemPrompt += '\n\n## 🔔 أحداث استباقية تحتاج انتباهك:\n'
    systemPrompt += '**الأحداث المعلقة:**\n'

    // Deduplicate events by type (avoid showing "السيرة الذاتية غير مكتملة" 3 times)
    const uniqueEvents = new Map<string, any>()
    pendingEvents.forEach(event => {
      if (!uniqueEvents.has(event.event_type)) {
        uniqueEvents.set(event.event_type, event)
      }
    })

    let eventIndex = 1
    uniqueEvents.forEach(event => {
      const label = getArabicLabel(event.event_type)
      systemPrompt += `${eventIndex}. ${label}: ${event.suggested_action}\n`
    })
    systemPrompt += '\n⚠️ لا تتجاهل هذه الأحداث - اذكرها دائماً في ردك بطريقة ودية.\n'
    systemPrompt += `
# 🎭 أسلوب الحديث
- تحدث بلهجة سعودية بيضاء (رسمية لكن ودودة).
- كن مختصراً جداً. لا تكتب فقرات طويلة.
- استخدم الإيموجي باعتدال (✅، 📄، 🔔).
- دائماً اعرض "الخطوة التالية" للمستخدم.
- **عند الترحيب**: إذا رحب بك المستخدم (مثل "مرحبا" أو "اهلا")، رد باسمه إذا كان متوفراً (مثال: "أهلاً عزام!"). هذا يعطي تجربة شخصية ودافئة.
`
  }

  // Add prediction context if available
  if (proactiveResult?.predictions?.size > 0) {
    const prediction = proactiveResult.predictions.get(userId)
    if (prediction && prediction.confidence > 0.6) {
      systemPrompt += `\n\n## 🎯 توقع احتياجات (ثقة ${(prediction.confidence * 100).toFixed(0)}%):\n`
      systemPrompt += `التوقع: ${getArabicLabel(prediction.predicted_need)}\n`
      systemPrompt += `السبب: ${prediction.reasoning}\n`
    }
  }

  const messages = [
    { role: 'system', content: systemPrompt }
  ]

  // Add conversation history (last 5 messages)
  for (const msg of history.slice(-5)) {
    const content = extractMessageContent(msg)
    if (content) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content
      })
    }
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage
  })

  return messages
}

/**
 * Detect intent from tool calls made by LLM
 */
function detectIntentFromToolCalls(toolCalls: any[]): string {
  if (!toolCalls || toolCalls.length === 0) return 'general_inquiry'

  const toolNames = toolCalls.map(tc => tc.toolName)

  // Resume intents
  if (toolNames.includes('updateResume')) return 'update_resume'
  if (toolNames.includes('addCourse')) return 'add_course'
  if (toolNames.includes('getResume')) return 'view_resume'

  // Certificate intents
  if (toolNames.includes('createCertificate')) return 'certificate_request'
  if (toolNames.includes('getCertificates')) return 'view_certificates'

  // Contract intents
  if (toolNames.includes('renewContract')) return 'renew_contract'
  if (toolNames.includes('updateContract')) return 'update_contract'
  if (toolNames.includes('getContracts')) return 'view_contracts'

  // Ticket intents
  if (toolNames.includes('createTicket')) return 'ticket_creation'
  if (toolNames.includes('checkTicketStatus')) return 'check_ticket'

  // Appointment intents
  if (toolNames.includes('scheduleAppointment')) return 'book_appointment'
  if (toolNames.includes('cancelAppointment')) return 'cancel_appointment'
  if (toolNames.includes('getAppointments')) return 'view_appointments'

  return 'general_inquiry'
}

/**
 * Extract text content from message (handles UI SDK format)
 */
function extractMessageContent(msg: any): string {
  if (typeof msg.content === 'string') {
    return msg.content
  } else if (msg.parts && Array.isArray(msg.parts)) {
    const textPart = msg.parts.find((p: any) => p.type === 'text')
    return textPart?.text || ''
  }
  return ''
}
