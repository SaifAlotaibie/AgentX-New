import { generateText, streamText } from 'ai'
import { agentModel } from './groq-client'
import { ALL_TOOLS, ToolName } from '../tools'
import AGENT_SYSTEM_PROMPT from './system_prompt'
import { logAgentAction, updateUserBehavior } from '../tools/logger'
import { executeProactiveEngineForUser, getProactiveEventsForUser } from '../proactive'

interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AgentResponse {
  response: string | any // Allow stream object
  tools_used?: string[]
  reasoning?: string
  proactive_suggestions?: any[]
  isStream?: boolean
}

/**
 * AI Agent Executor with Real OpenAI Integration
 * Handles tool selection, execution, and intelligent response generation
 */
export async function executeAgent(
  userMessage: string,
  userId: string,
  conversationHistory: AgentMessage[] = []
): Promise<AgentResponse> {
  try {
    console.log('🤖 Agent received message:', userMessage)
    console.log('👤 User ID:', userId)

    // Step 0: PROACTIVE ENGINE - Check for proactive events and predictions
    console.log('🔮 Running Proactive Engine...')
    const proactiveResult = await executeProactiveEngineForUser(userId)
    const pendingEvents = await getProactiveEventsForUser(userId, 3)

    console.log(`🎯 Proactive: ${pendingEvents.length} pending events, ${proactiveResult.predictions.size} predictions`)

    // Step 1: Detect intent and select appropriate tools
    const intent = detectIntent(userMessage)
    const selectedTools = selectTools(intent, userMessage)

    console.log('🎯 Intent detected:', intent)
    console.log('🔧 Tools selected:', selectedTools)

    // Step 2: Execute tools if needed
    const toolResults: any[] = []
    const toolsUsed: string[] = []

    for (const toolName of selectedTools) {
      try {
        const tool = ALL_TOOLS[toolName]
        if (!tool) {
          console.warn(`Tool ${toolName} not found`)
          continue
        }

        // Extract parameters from user message based on tool
        const params = extractToolParameters(toolName, userMessage, userId)

        console.log(`⚙️ Executing ${toolName} with params:`, params)

        const result = await tool.execute(params)
        toolResults.push({ tool: toolName, result })
        toolsUsed.push(toolName)

        console.log(`✅ ${toolName} result:`, result.success ? 'SUCCESS' : 'FAILED')
      } catch (error: any) {
        console.error(`Error executing tool ${toolName}:`, error)
        toolResults.push({
          tool: toolName,
          result: { success: false, error: error.message }
        })
      }
    }

    // Step 3: Use OpenAI/Groq to generate intelligent response with proactive context
    // We now return the stream directly
    const stream = await streamIntelligentResponse(
      userMessage,
      intent,
      toolResults,
      conversationHistory,
      userId,
      pendingEvents,
      proactiveResult,
      toolsUsed
    )

    return {
      response: stream,
      isStream: true,
      tools_used: toolsUsed,
      proactive_suggestions: pendingEvents.map(e => ({
        type: e.event_type,
        message: e.suggested_action,
        id: e.id
      }))
    }

  } catch (error: any) {
    console.error('❌ Error in executeAgent:', error)
    // Fallback to rule-based response if error occurs
    const fallbackResponse = generateFallbackResponse(userMessage, 'general_inquiry', [])
    return {
      response: fallbackResponse,
      isStream: false,
      tools_used: [],
    }
  }
}

/**
 * Generate intelligent response using AI SDK Streaming
 */
async function streamIntelligentResponse(
  userMessage: string,
  intent: string,
  toolResults: any[],
  history: AgentMessage[],
  userId: string,
  pendingEvents: any[] = [],
  proactiveResult: any = null,
  toolsUsed: string[] = []
): Promise<any> {
  try {
    // Build context from tool results - HIDE TOOL NAMES from user
    let toolContext = '\n\n# ⚠️ CRITICAL INSTRUCTION: NEVER mention tool names to the user!\n'
    toolContext += '# Present results naturally like a real government employee.\n'

    // Add proactive context if available
    if (pendingEvents.length > 0) {
      toolContext += '\n\n## 🔔 أحداث استباقية مهمة (عالج بذكاء):\n'
      toolContext += 'هناك تنبيهات مهمة للمستخدم. استخدمها لتقديم قيمة استباقية:\n'
      pendingEvents.forEach((event, i) => {
        toolContext += `${i + 1}. **${event.event_type}**: ${event.suggested_action}\n`
        toolContext += `   - متى: ${new Date(event.detected_at).toLocaleDateString('ar-SA')}\n`
      })
      toolContext += '\n⚠️ اذكر هذه التنبيهات بطريقة طبيعية ومفيدة!\n'
    }

    // Add prediction context if available
    if (proactiveResult?.predictions?.size > 0) {
      const prediction = proactiveResult.predictions.get(userId)
      if (prediction && prediction.confidence > 0.6) {
        toolContext += `\n\n## 🎯 توقع احتياجات المستخدم (استخدم بذكاء):\n`
        toolContext += `- التوقع: ${prediction.predicted_need}\n`
        toolContext += `- الثقة: ${(prediction.confidence * 100).toFixed(0)}%\n`
        toolContext += `- الأسباب: ${prediction.reasoning}\n`
        toolContext += '\n⚠️ استخدم هذا لتقديم اقتراحات استباقية!\n'
      }
    }

    if (toolResults.length > 0) {
      toolContext += '\n## نتائج العمليات (استخدم داخلياً فقط - لا تذكر أسماء الأدوات):\n'
      for (const { tool, result } of toolResults) {
        if (result.success) {
          toolContext += `\n✅ العملية نجحت\n`
          if (result.data) {
            toolContext += `البيانات المتوفرة: ${JSON.stringify(result.data, null, 2)}\n`
          }
          if (result.message) {
            toolContext += `الرسالة: ${result.message}\n`
          }
        } else {
          toolContext += `\n❌ العملية فشلت\n`
          toolContext += `الخطأ: ${result.error || 'خطأ غير معروف'}\n`
        }
      }

      toolContext += '\n⚠️ تذكير: اعرض هذه النتائج بطريقة طبيعية بدون ذكر:\n'
      toolContext += '- أسماء الأدوات (getResumeTool، updateResumeTool، إلخ)\n'
      toolContext += '- العمليات التقنية (استعلامات قاعدة البيانات، API calls)\n'
      toolContext += '- التفاصيل الداخلية للنظام\n'
      toolContext += 'تحدث كموظف حكومي حقيقي يساعد مواطن.\n'
    }

    // Build conversation history
    const messages: any[] = [
      {
        role: 'system',
        content: AGENT_SYSTEM_PROMPT + toolContext
      }
    ]

    // Helper to extract text content from UIMessage format
    const extractMessageContent = (msg: any): string => {
      if (typeof msg.content === 'string') {
        return msg.content
      } else if (msg.parts && Array.isArray(msg.parts)) {
        const textPart = msg.parts.find((p: any) => p.type === 'text')
        return textPart?.text || ''
      }
      return ''
    }

    // Add conversation history (last 5 messages)
    const recentHistory = history.slice(-5)
    for (const msg of recentHistory) {
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

    console.log('🧠 Calling Groq (openai/gpt-oss-120b) with', messages.length, 'messages')

    // Call Groq via AI SDK with Streaming
    const result = streamText({
      model: agentModel, // gpt-oss-120b
      messages: messages as any,
      temperature: 0.5,
      async onFinish({ text }) {
        console.log('✅ Stream finished, saving to DB...')

        // Update user behavior
        await updateUserBehavior(userId, {
          last_message: userMessage,
          intent: intent,
          predicted_need: proactiveResult?.predictions?.get(userId)?.predicted_need || null
        })

        // Log agent action
        await logAgentAction(userId, 'chat_response', {
          message: userMessage,
          intent,
          tools_used: toolsUsed,
          proactive_events: pendingEvents.length
        }, {
          response: text,
          tools_executed: toolResults.length
        })
      }
    })

    return result
  } catch (error: any) {
    console.error('❌ Error calling Groq:', error)
    throw error
  }
}

/**
 * Fallback response if OpenAI fails
 */
function generateFallbackResponse(
  userMessage: string,
  intent: string,
  toolResults: any[]
): string {
  // If no tools were executed
  if (toolResults.length === 0) {
    return 'مرحباً! أنا المساعد الذكي لمنصة قوى. كيف يمكنني مساعدتك اليوم؟\n\nيمكنني مساعدتك في:\n• إدارة سيرتك الذاتية\n• إصدار الشهادات\n• حجز المواعيد\n• إدارة العقود\n• فتح التذاكر\n• خدمات العمالة المنزلية'
  }

  // Generate response based on tool results
  let response = ''

  for (const { tool, result } of toolResults) {
    if (result.success) {
      // Success responses
      switch (tool) {
        case 'getResumeTool':
          if (result.data === null || !result.data.resume) {
            response += 'لا توجد سيرة ذاتية في النظام حالياً. هل تريد إنشاء سيرة جديدة؟\n\n'
          } else {
            const resume = result.data.resume
            response += `📄 **سيرتك الذاتية الحالية:**\n\n`
            response += `المسمى الوظيفي: ${resume.job_title || 'غير محدد'}\n`
            response += `النبذة التعريفية: ${resume.summary || 'غير محدد'}\n`
            response += `سنوات الخبرة: ${resume.experience_years || 0}\n`
            if (resume.skills && resume.skills.length > 0) {
              response += `المهارات: ${resume.skills.join('، ')}\n`
            }
            if (result.data.courses && result.data.courses.length > 0) {
              response += `\nالدورات التدريبية (${result.data.courses.length}):\n`
              result.data.courses.slice(0, 3).forEach((course: any) => {
                response += `  • ${course.course_name} - ${course.provider}\n`
              })
            }
            response += '\n'
          }
          break

        case 'createResumeTool':
          response += '✅ تم إنشاء سيرتك الذاتية بنجاح!\nوتم فتح تذكرة متابعة لك.\n\n'
          break

        case 'updateResumeTool':
          response += '✅ تم تحديث سيرتك الذاتية بنجاح!\nوتم فتح تذكرة متابعة لك.\n\n'
          break

        case 'addCourseToResumeTool':
          response += '✅ تم إضافة الدورة التدريبية لسيرتك الذاتية بنجاح!\nوتم فتح تذكرة متابعة لك.\n\n'
          break

        case 'createCertificateTool':
          response += '✅ تم إصدار الشهادة بنجاح!\nوتم فتح تذكرة متابعة لك.\n\nيمكنك تنزيل الشهادة من صفحة الشهادات.\n\n'
          break

        case 'scheduleAppointmentTool':
          response += '✅ تم حجز موعدك بنجاح!\nوتم فتح تذكرة متابعة لك.\n\nسنرسل لك تذكير قبل الموعد.\n\n'
          break

        case 'createTicketTool':
          response += '✅ تم فتح تذكرة دعم بنجاح!\nرقم التذكرة: #' + (result.data?.ticket_number || 'جديد') + '\n\nسيتم متابعتها قريباً.\n\n'
          break

        case 'renewContractTool':
          response += '✅ تم تجديد عقدك بنجاح!\nوتم فتح تذكرة متابعة لك.\n\n'
          break

        case 'createDomesticLaborRequestTool':
          response += '✅ تم إنشاء طلب العمالة المنزلية بنجاح!\nوتم فتح تذكرة متابعة لك.\n\nسيتم مراجعة طلبك قريباً.\n\n'
          break

        default:
          response += result.message ? result.message + '\n\n' : ''
      }
    } else {
      // Error responses
      response += `⚠️ ${result.error || 'حدث خطأ في تنفيذ العملية'}\n\n`
    }
  }

  // Add helpful closing
  if (response.trim().length > 0) {
    response += 'هل تحتاج مساعدة في شيء آخر؟'
  } else {
    response = 'تم تنفيذ طلبك. هل تحتاج مساعدة في شيء آخر؟'
  }

  return response.trim()
}

/**
 * Detect user intent from message
 */
function detectIntent(message: string): string {
  const msg = message.toLowerCase()

  // Resume intents - Enhanced detection
  if (msg.includes('سيرة') || msg.includes('سيرتي') || msg.includes('cv') || msg.includes('resume')) {
    if (msg.includes('سو ') || msg.includes('سوي') || msg.includes('انشئ') || msg.includes('انشي') || msg.includes('اعمل') || msg.includes('اسوي') || msg.includes('ابي سيرة') || msg.includes('create') || msg.includes('اضف سيرة')) return 'create_resume'
    if (msg.includes('حدث') || msg.includes('عدل') || msg.includes('غير') || msg.includes('اخلي') || msg.includes('خلي') || msg.includes('خل') || msg.includes('update') || msg.includes('change')) return 'update_resume'
    if (msg.includes('دورة') || msg.includes('كورس') || msg.includes('course')) return 'add_course'
    return 'view_resume'
  }

  // Direct resume field updates (without mentioning "سيرة")
  // Experience years
  if (msg.includes('سنوات') && msg.includes('خبر')) {
    if (msg.includes('حدث') || msg.includes('عدل') || msg.includes('غير') || msg.includes('اخلي') || msg.includes('خلي') || msg.includes('خل') || msg.includes('سوي') || msg.includes('ابي')) {
      return 'update_resume'
    }
    return 'view_resume'
  }

  // Job title updates - ENHANCED
  if (msg.includes('مسمى') || msg.includes('وظيف') || msg.includes('منصب') || msg.includes('job title') || msg.includes('position')) {
    if (msg.includes('حدث') || msg.includes('عدل') || msg.includes('غير') || msg.includes('اخلي') || msg.includes('خلي') || msg.includes('خل') || msg.includes('سوي') || msg.includes('update') || msg.includes('change') || msg.includes('make')) {
      return 'update_resume'
    }
  }

  // Education updates
  if (msg.includes('مؤهل') || msg.includes('تعليم') || msg.includes('دراس') || msg.includes('education') || msg.includes('degree')) {
    if (msg.includes('حدث') || msg.includes('عدل') || msg.includes('غير') || msg.includes('اخلي') || msg.includes('خلي') || msg.includes('خل') || msg.includes('update') || msg.includes('change')) {
      return 'update_resume'
    }
  }

  // Skills updates
  if (msg.includes('مهار') || msg.includes('قدر') || msg.includes('skill')) {
    if (msg.includes('حدث') || msg.includes('عدل') || msg.includes('غير') || msg.includes('اخلي') || msg.includes('خلي') || msg.includes('خل') || msg.includes('اضف') || msg.includes('ضيف') || msg.includes('update') || msg.includes('add')) {
      return 'update_resume'
    }
  }

  // Summary updates
  if (msg.includes('ملخص') || msg.includes('نبذة') || msg.includes('مخلص') || msg.includes('summary') || msg.includes('bio')) {
    if (msg.includes('حدث') || msg.includes('عدل') || msg.includes('غير') || msg.includes('اخلي') || msg.includes('خلي') || msg.includes('خل') || msg.includes('update') || msg.includes('change')) {
      return 'update_resume'
    }
  }

  // Certificate intents
  if (msg.includes('شهادة')) {
    if (msg.includes('راتب') || msg.includes('تعريف')) return 'salary_certificate'
    if (msg.includes('خبرة') || msg.includes('خدمة')) return 'service_certificate'
    if (msg.includes('ترخيص')) return 'labor_license'
    return 'view_certificates'
  }

  // Appointment intents
  if (msg.includes('موعد')) {
    if (msg.includes('احجز') || msg.includes('اسجل') || msg.includes('ابي')) return 'book_appointment'
    if (msg.includes('الغي') || msg.includes('احذف')) return 'cancel_appointment'
    return 'view_appointments'
  }

  // Ticket intents
  if (msg.includes('تذكرة') || msg.includes('شكوى') || msg.includes('مشكلة')) {
    if (msg.includes('افتح') || msg.includes('سوي')) return 'create_ticket'
    if (msg.includes('اقفل') || msg.includes('الغي')) return 'close_ticket'
    return 'check_ticket'
  }

  // Contract intents
  if (msg.includes('عقد')) {
    if (msg.includes('جدد') || msg.includes('مدد')) return 'renew_contract'
    if (msg.includes('حدث') || msg.includes('عدل')) return 'update_contract'
    return 'view_contracts'
  }

  // Regulations intents
  if (msg.includes('لائحة') || msg.includes('نظام') || msg.includes('قانون') || msg.includes('حق')) {
    return 'regulations'
  }

  return 'general_inquiry'
}

/**
 * Select appropriate tools based on intent
 */
function selectTools(intent: string, message: string): ToolName[] {
  const tools: ToolName[] = []

  switch (intent) {
    case 'create_resume':
      // For create, we let updateResumeTool handle it (auto-creates if doesn't exist)
      tools.push('updateResumeTool')
      break

    case 'update_resume':
      tools.push('getResumeTool') // Get current data first
      tools.push('updateResumeTool') // Then update immediately
      break

    case 'add_course':
      tools.push('getResumeTool')
      // Add course requires resume ID and course details
      break

    case 'view_resume':
      tools.push('getResumeTool')
      break

    case 'salary_certificate':
    case 'service_certificate':
    case 'labor_license':
      // Certificate generation requires user confirmation first
      // tools.push('createCertificateTool')
      break

    case 'view_certificates':
      tools.push('getCertificatesTool')
      break

    case 'book_appointment':
      // Booking requires date/time/location - needs conversation
      break

    case 'view_appointments':
      tools.push('getAppointmentsTool')
      break

    case 'create_ticket':
      // Ticket creation needs details
      break

    case 'check_ticket':
      tools.push('checkTicketStatusTool')
      break

    case 'view_contracts':
      tools.push('getContractsTool')
      break
  }

  return tools
}

/**
 * Extract tool parameters from user message
 */
function extractToolParameters(toolName: ToolName, message: string, userId: string): any {
  const params: any = { user_id: userId }

  switch (toolName) {
    case 'createResumeTool':
    case 'updateResumeTool':
      // Extract parameters from message - ENHANCED FOR ALL FIELDS
      const msg = message.toLowerCase()

      // Extract experience years
      const yearsMatch = message.match(/(\d+)\s*(سنة|سنوات|عام|أعوام|سنه)/i)
      if (yearsMatch) {
        params.experience_years = parseInt(yearsMatch[1])
        console.log('✅ Extracted experience_years:', params.experience_years)
      }

      // Extract job title - SUPER ENHANCED
      if (msg.includes('مسمى') || msg.includes('وظيفة') || msg.includes('منصب') || msg.includes('وظيف') || msg.includes('job title') || msg.includes('position')) {
        // Pattern 1: "المسمى الوظيفي: X" or "وظيفة: X"
        let titleMatch = message.match(/(?:مسمى|وظيفة|منصب|وظيفي|job title|position)[:\s]+([\s\S]+?)(?:\n|$)/i)

        // Pattern 2: "خل/اخلي المسمى الوظيفي X"
        if (!titleMatch) {
          titleMatch = message.match(/(?:خل|خلي|اخلي|غير|عدل|حدث|make|change|update)\s+(?:المسمى\s+الوظيفي|الوظيفة|المنصب|وظيفتي|my\s+job\s+title|my\s+position)\s+([\s\S]+?)(?:\n|$)/i)
        }

        // Pattern 3: "وظيفتي X" or "اشتغل X"
        if (!titleMatch) {
          titleMatch = message.match(/(?:وظيفتي|اشتغل|اعمل|I\s+am\s+a|I\s+work\s+as)\s+([\s\S]+?)(?:\n|$)/i)
        }

        if (titleMatch) {
          params.job_title = titleMatch[1].trim()
          console.log('✅ Extracted job_title:', params.job_title)
        }
      }

      // Extract education - SUPER ENHANCED
      if (msg.includes('مؤهل') || msg.includes('شهادة') || msg.includes('تعليم') || msg.includes('طالب') || msg.includes('دراس') || msg.includes('خريج') || msg.includes('education') || msg.includes('degree') || msg.includes('graduate')) {
        // Pattern 1: "مؤهل: X" or "تعليم: X"
        let eduMatch = message.match(/(?:مؤهل|شهادة|تعليم|تعليمي|دراستي|education|degree)[:\s]+([\s\S]+?)(?:\n|$)/i)

        // Pattern 2: "طالب X" or "خريج X"
        if (!eduMatch) {
          eduMatch = message.match(/(?:طالب|خريج|graduate|student)\s+([\s\S]+?)(?:\s+مهتم|\s+في|\s+interested|\n|$)/i)
        }

        // Pattern 3: "خل/اخلي المؤهل X"
        if (!eduMatch) {
          eduMatch = message.match(/(?:خل|خلي|اخلي|غير|make|change)\s+(?:المؤهل|التعليم|الشهادة|my\s+education)\s+([\s\S]+?)(?:\n|$)/i)
        }

        if (eduMatch) {
          params.education = eduMatch[1].trim()
          console.log('✅ Extracted education:', params.education)
        }
      }

      // Extract summary - SUPER ENHANCED
      if (msg.includes('ملخص') || msg.includes('نبذة') || msg.includes('مخلص') || msg.includes('نبذه') || msg.includes('summary') || msg.includes('bio') || msg.includes('about')) {
        // Pattern 1: After "ملخص سيرتي:" or "summary:"
        let summaryMatch = message.match(/(?:ملخص|نبذة|مخلص|نبذه|summary|bio|about)[:\s]+([\s\S]+?)(?:\n|$)/i)

        // Pattern 2: After "اني" or "انا" or "I am"
        if (!summaryMatch && (msg.includes('اني') || msg.includes('انا') || msg.includes('i am') || msg.includes("i'm"))) {
          summaryMatch = message.match(/(?:اني|انا|I\s+am|I'm)\s+([\s\S]+?)(?:\n|$)/i)
        }

        // Pattern 3: "خل/اخلي الملخص X"
        if (!summaryMatch) {
          summaryMatch = message.match(/(?:خل|خلي|اخلي|make|change)\s+(?:الملخص|النبذة|my\s+summary|my\s+bio)\s+([\s\S]+?)(?:\n|$)/i)
        }

        if (summaryMatch) {
          params.summary = summaryMatch[1].trim()
          console.log('✅ Extracted summary:', params.summary)
        }
      }

      // Extract skills - SUPER ENHANCED
      if (msg.includes('مهار') || msg.includes('قدر') || msg.includes('skill')) {
        // Pattern 1: "مهارات: X, Y, Z" or "skills: X, Y, Z"
        let skillsMatch = message.match(/(?:مهارات|مهاراتي|قدراتي|skills|my\s+skills)[:\s]+([\s\S]+?)(?:\n|$)/i)

        // Pattern 2: "خل/اخلي مهاراتي X"
        if (!skillsMatch) {
          skillsMatch = message.match(/(?:خل|خلي|اخلي|غير|add|change)\s+(?:مهاراتي|المهارات|my\s+skills)\s+([\s\S]+?)(?:\n|$)/i)
        }

        if (skillsMatch) {
          // Split by common separators (Arabic comma, English comma, dash, newline, "and", "و")
          const skillsText = skillsMatch[1].trim()
          params.skills = skillsText.split(/[،,\-\n]|and|و/).map(s => s.trim()).filter(s => s.length > 0)
          console.log('✅ Extracted skills:', params.skills)
        }
      }
      break

    case 'createCertificateTool':
      // Determine certificate type with enhanced detection
      const msgLower = message.toLowerCase()
      if (msgLower.includes('راتب') || msgLower.includes('تعريف')) {
        params.type = 'salary_definition'
        console.log('✅ Extracted certificate type: salary_definition')
      } else if (msgLower.includes('خبرة') || msgLower.includes('خدمة')) {
        params.type = 'service_certificate'
        console.log('✅ Extracted certificate type: service_certificate')
      } else if (msgLower.includes('ترخيص') || msgLower.includes('عمل')) {
        params.type = 'labor_license'
        console.log('✅ Extracted certificate type: labor_license')
      } else {
        params.type = 'salary_definition' // default
      }
      break

    case 'createTicketTool':
      // Extract ticket details intelligently
      const ticketMsg = message.toLowerCase()

      // Extract title from message
      const titleMatch = message.match(/(?:مشكلة|شكوى|طلب)[:\s]+([\s\S]+?)(?:\.|،|\n|$)/i)
      params.title = titleMatch ? titleMatch[1].trim() : message.substring(0, 100)

      // Determine category
      if (ticketMsg.includes('سيرة') || ticketMsg.includes('ملف')) {
        params.category = 'resume_issue'
      } else if (ticketMsg.includes('شهادة')) {
        params.category = 'certificate_issue'
      } else if (ticketMsg.includes('عقد')) {
        params.category = 'contract_issue'
      } else if (ticketMsg.includes('موعد')) {
        params.category = 'appointment_issue'
      } else if (ticketMsg.includes('تقني') || ticketMsg.includes('خطأ')) {
        params.category = 'technical'
      } else {
        params.category = 'general'
      }

      params.description = message
      console.log('✅ Extracted ticket - Title:', params.title, 'Category:', params.category)
      break

    case 'scheduleAppointmentTool':
      // Extract appointment details
      const apptMsg = message.toLowerCase()

      // Extract office location
      const locationMatch = message.match(/(?:في|مكتب|فرع)[:\s]+([\s\S]+?)(?:\s+يوم|\s+تاريخ|،|\n|$)/i)
      if (locationMatch) {
        params.office_location = locationMatch[1].trim()
        console.log('✅ Extracted office_location:', params.office_location)
      } else {
        params.office_location = 'الفرع الرئيسي' // default
      }

      // Extract date - look for date patterns
      const dateMatch = message.match(/(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/i) ||
        message.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i)
      if (dateMatch) {
        params.date = dateMatch[1].replace(/\//g, '-')
        console.log('✅ Extracted date:', params.date)
      } else {
        // Default to tomorrow
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        params.date = tomorrow.toISOString().split('T')[0]
      }

      // Extract time
      const timeMatch = message.match(/(\d{1,2}:\d{2})/i) ||
        message.match(/الساعة\s+(\d{1,2})/i)
      if (timeMatch) {
        params.time = timeMatch[1].includes(':') ? timeMatch[1] : `${timeMatch[1]}:00`
        console.log('✅ Extracted time:', params.time)
      } else {
        params.time = '10:00 AM' // default
      }
      break

    case 'renewContractTool':
    case 'updateContractTool':
      // Extract contract details
      const contractMsg = message.toLowerCase()

      // Extract duration for renewal
      if (contractMsg.includes('سنة') || contractMsg.includes('شهر')) {
        const durationMatch = message.match(/(\d+)\s*(سنة|سنوات|شهر|أشهر)/i)
        if (durationMatch) {
          params.duration = parseInt(durationMatch[1])
          params.duration_unit = durationMatch[2].includes('سنة') ? 'years' : 'months'
          console.log('✅ Extracted duration:', params.duration, params.duration_unit)
        }
      }

      // Extract salary if mentioned
      const salaryMatch = message.match(/(\d+(?:,\d+)?)\s*(?:ريال|ر\.س|SAR)/i)
      if (salaryMatch) {
        params.salary = parseFloat(salaryMatch[1].replace(',', ''))
        console.log('✅ Extracted salary:', params.salary)
      }
      break

    // Most tools just need user_id which is already added
  }

  return params
}
