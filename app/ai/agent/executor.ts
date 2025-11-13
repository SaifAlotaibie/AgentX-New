import { ALL_TOOLS, ToolName } from '../tools'
import AGENT_SYSTEM_PROMPT from './system_prompt'
import { logAgentAction } from '../tools/logger'

interface AgentMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AgentResponse {
  response: string
  tools_used?: string[]
  reasoning?: string
  proactive_suggestions?: any[]
}

/**
 * AI Agent Executor
 * Handles tool selection, execution, and response generation
 */
export async function executeAgent(
  userMessage: string,
  userId: string,
  conversationHistory: AgentMessage[] = []
): Promise<AgentResponse> {
  try {
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

        console.log(`✅ ${toolName} result:`, result)
      } catch (error: any) {
        console.error(`Error executing tool ${toolName}:`, error)
        toolResults.push({
          tool: toolName,
          result: { success: false, error: error.message }
        })
      }
    }

    // Step 3: Generate agent response based on tool results
    const response = generateAgentResponse(userMessage, intent, toolResults, conversationHistory)

    return {
      response,
      tools_used: toolsUsed,
      reasoning: `Intent: ${intent}، Tools: ${toolsUsed.join('، ')}`,
      proactive_suggestions: []
    }
  } catch (error: any) {
    console.error('Error in executeAgent:', error)
    return {
      response: 'عذراً، حدث خطأ أثناء معالجة طلبك. الرجاء المحاولة مرة أخرى.',
      tools_used: [],
    }
  }
}

/**
 * Detect user intent from message
 */
function detectIntent(message: string): string {
  const msg = message.toLowerCase()

  // Resume intents
  if (msg.includes('سيرة') || msg.includes('سيرتي') || msg.includes('cv')) {
    if (msg.includes('سوي') || msg.includes('انشئ') || msg.includes('اعمل')) return 'create_resume'
    if (msg.includes('حدث') || msg.includes('عدل') || msg.includes('غير')) return 'update_resume'
    if (msg.includes('دورة') || msg.includes('كورس')) return 'add_course'
    return 'view_resume'
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

  // Domestic labor intents
  if (msg.includes('عمالة منزلية') || msg.includes('خادمة') || msg.includes('سائق')) {
    return 'domestic_labor'
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
      tools.push('getResumeTool') // Always check existing first
      tools.push('createResumeTool')
      break
    
    case 'update_resume':
      tools.push('getResumeTool') // Always get current data first
      tools.push('updateResumeTool')
      break
    
    case 'add_course':
      tools.push('getResumeTool')
      tools.push('addCourseToResumeTool')
      break
    
    case 'view_resume':
      tools.push('getResumeTool')
      break
    
    case 'salary_certificate':
    case 'service_certificate':
    case 'labor_license':
      tools.push('createCertificateTool')
      break
    
    case 'view_certificates':
      tools.push('getCertificatesTool')
      break
    
    case 'book_appointment':
      tools.push('scheduleAppointmentTool')
      break
    
    case 'cancel_appointment':
      tools.push('cancelAppointmentTool')
      break
    
    case 'view_appointments':
      tools.push('getAppointmentsTool')
      break
    
    case 'create_ticket':
      tools.push('createTicketTool')
      break
    
    case 'close_ticket':
      tools.push('closeTicketTool')
      break
    
    case 'check_ticket':
      tools.push('checkTicketStatusTool')
      break
    
    case 'renew_contract':
      tools.push('checkContractExpiryTool')
      tools.push('renewContractTool')
      break
    
    case 'update_contract':
      tools.push('updateContractTool')
      break
    
    case 'domestic_labor':
      tools.push('createDomesticLaborRequestTool')
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
      // Extract resume fields
      if (message.includes('مهندس')) params.job_title = 'مهندس برمجيات'
      if (message.includes('محاسب')) params.job_title = 'محاسب'
      if (message.includes('مدير')) params.job_title = 'مدير'
      // More intelligent extraction can be added here
      break

    case 'createCertificateTool':
      // Determine certificate type
      if (message.includes('راتب')) params.type = 'salary_definition'
      else if (message.includes('خبرة') || message.includes('خدمة')) params.type = 'service_certificate'
      else if (message.includes('ترخيص')) params.type = 'labor_license'
      else params.type = 'salary_definition' // default
      break

    case 'createTicketTool':
      params.title = 'طلب من المساعد الذكي'
      params.category = 'general'
      params.description = message
      break

    // Add more parameter extraction logic as needed
  }

  return params
}

/**
 * Generate agent response based on tool results
 */
function generateAgentResponse(
  userMessage: string,
  intent: string,
  toolResults: any[],
  history: AgentMessage[]
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
          if (result.data === null) {
            response += 'لا توجد سيرة ذاتية في النظام حالياً. هل تريد إنشاء سيرة جديدة؟\n\n'
          } else {
            const resume = result.data.resume
            response += `📄 **سيرتك الذاتية الحالية:**\n\n`
            response += `المسمى الوظيفي: ${resume.job_title || 'غير محدد'}\n`
            response += `النبذة التعريفية: ${resume.summary || 'غير محدد'}\n`
            response += `سنوات الخبرة: ${resume.experience_years || 0}\n`
            response += `المهارات: ${resume.skills?.length > 0 ? resume.skills.join('، ') : 'لا توجد'}\n`
            if (result.data.courses?.length > 0) {
              response += `\nالدورات التدريبية (${result.data.courses.length}):\n`
              result.data.courses.slice(0, 3).forEach((course: any) => {
                response += `  • ${course.course_name} - ${course.institution}\n`
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
  response += 'هل تحتاج مساعدة في شيء آخر؟'

  return response.trim()
}
