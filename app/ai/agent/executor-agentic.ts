/**
 * TRUE AGENTIC EXECUTOR
 * LLM makes ALL decisions about tool calling autonomously
 */

import { streamText } from 'ai'
import { agentModel } from './groq-client'
import { AGENTIC_TOOLS } from './tools-agentic'
import AGENT_SYSTEM_PROMPT_OPTIMIZED from './system_prompt_optimized'
import { saveConversation } from '@/lib/db/conversationService'
import { updateUserBehavior, logAgentAction } from '../tools/logger'
import { executeProactiveEngineForUser, getProactiveEventsForUser } from '../proactive'
import { getCachedProactiveData, setCachedProactiveData } from './proactive-cache'

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

    // Step 2: Build conversation context with proactive information
    const messages = buildMessages(
      userMessage,
      userId,
      conversationHistory,
      pendingEvents,
      proactiveResult
    )

    console.log('🧠 [AGENTIC] Calling Groq GPT-OSS-120B with tool support...')
    console.log('🔧 [AGENTIC] Available tools:', Object.keys(AGENTIC_TOOLS).length)

    // Step 3: LET THE LLM DECIDE - Stream with tool support
    const result = streamText({
      model: agentModel, // openai/gpt-oss-120b
      messages: messages as any,
      tools: AGENTIC_TOOLS, // 🎯 LLM can now autonomously call tools!
      maxSteps: 10, // Allow multi-step tool chaining
      temperature: 0.3, // Lower temp for more reliable tool calling

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
          tool_results: toolResults?.map(tr => ({ success: tr.result?.success || false }))
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
  proactiveResult: any
): any[] {
  // Start with optimized system prompt (70% smaller!)
  let systemPrompt = AGENT_SYSTEM_PROMPT_OPTIMIZED

  // Add proactive context if available
  if (pendingEvents.length > 0) {
    systemPrompt += '\n\n## 🔔 أحداث استباقية معلقة (مهمة!):\n'
    systemPrompt += 'هناك تنبيهات للمستخدم. اذكرها في ردك إذا كانت ذات صلة:\n'
    pendingEvents.forEach((event, i) => {
      systemPrompt += `${i + 1}. ${event.event_type}: ${event.suggested_action}\n`
    })
  }

  // Add prediction context if available
  if (proactiveResult?.predictions?.size > 0) {
    const prediction = proactiveResult.predictions.get(userId)
    if (prediction && prediction.confidence > 0.6) {
      systemPrompt += `\n\n## 🎯 توقع احتياجات (ثقة ${(prediction.confidence * 100).toFixed(0)}%):\n`
      systemPrompt += `التوقع: ${prediction.predicted_need}\n`
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
