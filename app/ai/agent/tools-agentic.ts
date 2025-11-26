/**
 * AI SDK Tool Definitions for Agentic Behavior
 * These wrap existing tools with Zod schemas for LLM-driven tool calling
 */

import { tool } from 'ai'
import { z } from 'zod'
import { ALL_TOOLS } from '../tools'

/**
 * 🔑 Helper for user_id preprocessing
 * Handles: undefined, null, empty string, and the STRING "undefined"
 */
const DUMMY_UUID = '00000000-0000-0000-0000-000000000000'
const preprocessUserId = (val: any) => {
  // Return dummy UUID if val is:
  // - undefined, null, empty string, OR
  // - the STRING "undefined"
  if (!val || val === 'undefined') {
    return DUMMY_UUID
  }
  return val
}

/**
 * USER PROFILE TOOLS
 */

export const getUserProfile = tool({
  description: `Get user's profile information including full_name, phone, email, nationality, job_title, etc.
  Use this when user asks about their name, contact info, or personal details.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid())
  }),
  execute: async ({ user_id }) => {
    console.log('🔧 [LLM CALL] getUserProfile:', user_id)
    const result = await ALL_TOOLS.getUserProfileTool.execute({ user_id })
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

/**
 * RESUME TOOLS
 */

export const getResume = tool({
  description: `Get user's resume data including job_title, experience_years, education, summary, and skills array.
  Use this FIRST before any resume operations to see current data.
  Returns resume object with courses array.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()).describe('UUID of the user')
  }),
  execute: async ({ user_id }) => {
    console.log('🔧 [LLM CALL] getResume:', user_id)
    const result = await ALL_TOOLS.getResumeTool.execute({ user_id })
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const createResume = tool({
  description: `Create new resume for user. Use this when user has no resume yet.
  Required: job_title
  Optional: experience_years, education, summary, skills array`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    job_title: z.string().min(2).describe('Job title in Arabic (required)'),
    experience_years: z.number().int().min(0).max(50).optional().describe('Years of experience'),
    education: z.string().optional().describe('Education level in Arabic'),
    summary: z.string().optional().describe('Professional summary in Arabic'),
    skills: z.array(z.string()).optional().describe('Array of skills in Arabic')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] createResume:', params.job_title)
    const result = await ALL_TOOLS.createResumeTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const updateResume = tool({
  description: `Update user's resume fields. Extract the requested changes from the user's message in Arabic.
  
  EXAMPLES OF PARAMETER EXTRACTION:
  - User says "غير المسمى الوظيفي الى مهندس برمجيات" → job_title: "مهندس برمجيات"
  - User says "حدث سنوات الخبرة الى 5" → experience_years: 5
  - User says "المؤهل بكالوريوس علوم الحاسب" → education: "بكالوريوس علوم الحاسب"
  
  Supported fields (ALL OPTIONAL - only include fields user wants to change):
  - job_title: Job title in Arabic (e.g. "مهندس برمجيات", "مهندس ذكاء اصطناعي")
  - experience_years: Number of years (e.g. 0, 1, 5, 10)
  - education: Education level in Arabic (e.g. "بكالوريوس", "بكالوريوس علوم الحاسب")
  - summary: Professional summary in Arabic
  - skills: Array of skills in Arabic (e.g. ["JavaScript", "Python", "التعلم الآلي"])

IMPORTANT: ALWAYS call getResume first to see current values before updating.
This automatically creates a tracking ticket.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    job_title: z.string().min(2).nullable().optional().describe('المسمى الوظيفي بالعربي - Job title in Arabic (e.g. "مهندس ذكاء اصطناعي")'),
    experience_years: z.number().int().min(0).max(50).nullable().optional().describe('عدد سنوات الخبرة - Years of experience as a number'),
    education: z.string().nullable().optional().describe('المؤهل العلمي بالعربي - Education level in Arabic (e.g. "بكالوريوس علوم الحاسب")'),
    summary: z.string().nullable().optional().describe('الملخص المهني بالعربي - Professional summary in Arabic'),
    skills: z.array(z.string()).nullable().optional().describe('المهارات كمصفوفة بالعربي - Array of skills in Arabic')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] updateResume:', params)
    const result = await ALL_TOOLS.updateResumeTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

// WORKAROUND: Tool that accepts raw Arabic instruction text and parses it programmatically
export const updateResumeFromText = tool({
  description: `تحديث السيرة الذاتية من نص عربي. استخدم هذه الأداة عندما يطلب المستخدم تحديث سيرته.
  
  أمثلة:
  - "غير المسمى الوظيفي الى مهندس ذكاء اصطناعي"
  - "حدث الخبرة الى 5 سنوات والمؤهل الى بكالوريوس"
  - "اضف مهارة Python و JavaScript"
  
  فقط مرر نص المستخدم كما هو، وسيتم تحليله تلقائياً.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    instruction: z.string().min(3).describe('نص التحديث بالعربي - Raw Arabic instruction text from user')
  }),
  execute: async ({ user_id, instruction }: { user_id: string; instruction: string }) => {
    console.log('🔧 [LLM CALL] updateResumeFromText:', instruction)

    // Parse Arabic instruction to extract parameters
    const updates: any = {}

    // Extract job_title
    const jobTitleMatch = instruction.match(/(?:المسمى الوظيفي|الوظيفة|المسمى)(?:\s+(?:الى|إلى|:))?\s+(.+?)(?:\s+و|\s+،|$)/i)
    if (jobTitleMatch) {
      updates.job_title = jobTitleMatch[1].trim()
    }

    // Extract experience_years
    const expMatch = instruction.match(/(?:الخبرة|سنوات الخبرة|خبرة)(?:\s+(?:الى|إلى|:))?\s+(\d+)/i)
    if (expMatch) {
      updates.experience_years = parseInt(expMatch[1])
    }

    // Extract education
    const eduMatch = instruction.match(/(?:المؤهل|التعليم|الدراسة)(?:\s+(?:الى|إلى|:))?\s+(.+?)(?:\s+و|\s+،|$)/i)
    if (eduMatch) {
      updates.education = eduMatch[1].trim()
    }

    console.log('📝 Parsed updates:', updates)

    const result = await ALL_TOOLS.updateResumeTool.execute({
      user_id,
      ...updates
    })

    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const addCourse = tool({
  description: `Add training course to user's resume.
  Creates course record linked to resume.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    course_name: z.string().min(3).describe('Course name in Arabic'),
    provider: z.string().min(2).describe('Course provider/institution in Arabic'),
    completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
      .describe('Completion date in YYYY-MM-DD format (optional)')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] addCourse:', params.course_name)
    const result = await ALL_TOOLS.addCourseToResumeTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

/**
 * CERTIFICATE TOOLS
 */

export const createCertificate = tool({
  description: `Generate official certificate for user.
  Types:
  - salary_definition: Salary certificate (شهادة تعريف براتب)
  - service_certificate: Service certificate (شهادة خدمة)
  - labor_license: Labor license (ترخيص عمل)

  Automatically creates tracking ticket.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    type: z.enum(['salary_definition', 'service_certificate', 'labor_license'])
      .describe('Type of certificate to generate')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] createCertificate:', params.type)
    const result = await ALL_TOOLS.createCertificateTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const getCertificates = tool({
  description: 'Get all certificates issued for user. Returns array of certificates with type, issue date, and content.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid())
  }),
  execute: async ({ user_id }) => {
    console.log('🔧 [LLM CALL] getCertificates:', user_id)
    const result = await ALL_TOOLS.getCertificatesTool.execute({ user_id })
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

/**
 * CONTRACT TOOLS
 */

export const getContracts = tool({
  description: `Get user's employment contracts with details:
  - employer_name: Company name
  - position: Job position
  - salary: Monthly salary
  - start_date: Contract start date (YYYY-MM-DD)
  - end_date: Contract end date (YYYY-MM-DD)
  - status: active/expired/renewed`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid())
  }),
  execute: async ({ user_id }) => {
    console.log('🔧 [LLM CALL] getContracts:', user_id)
    const result = await ALL_TOOLS.getContractsTool.execute({ user_id })
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const checkContractExpiry = tool({
  description: 'Check if user contract is expiring soon (within 30 days). Returns expiry status and days remaining.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid())
  }),
  execute: async ({ user_id }) => {
    console.log('🔧 [LLM CALL] checkContractExpiry:', user_id)
    const result = await ALL_TOOLS.checkContractExpiryTool.execute({ user_id })
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const renewContract = tool({
  description: `Renew employment contract by extending end date.
  Use this when user explicitly asks for renewal OR when contract is expiring soon.

  IMPORTANT: Check contract end_date first with getContracts or checkContractExpiry.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    contract_id: z.string().uuid().optional().describe('Contract ID (optional, uses most recent if not provided)'),
    duration: z.number().int().positive().optional().default(1)
      .describe('Duration to extend (default 1)'),
    duration_unit: z.enum(['years', 'months']).optional().default('years')
      .describe('Duration unit: years or months')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] renewContract:', params)
    const result = await ALL_TOOLS.renewContractTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const updateContract = tool({
  description: `Update contract details like salary or position.
  Can update: salary, position, employer_name.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    contract_id: z.string().uuid().optional(),
    salary: z.number().positive().optional().describe('New salary amount'),
    position: z.string().optional().describe('New position/job title'),
    employer_name: z.string().optional().describe('New employer name')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] updateContract:', params)
    const result = await ALL_TOOLS.updateContractTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

/**
 * TICKET TOOLS
 */

export const createTicket = tool({
  description: `Create support ticket for tracking actions or issues.
  Categories:
  - agent_action: For agent-initiated actions
  - resume_issue: Resume-related problems
  - certificate_issue: Certificate problems
  - contract_issue: Contract problems
  - appointment_issue: Appointment problems
  - technical: Technical errors
  - general: General inquiries`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    title: z.string().min(5).describe('Ticket title in Arabic'),
    description: z.string().min(10).describe('Detailed description in Arabic'),
    category: z.enum([
      'agent_action',
      'resume_issue',
      'certificate_issue',
      'contract_issue',
      'appointment_issue',
      'technical',
      'general'
    ]).describe('Ticket category')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] createTicket:', params.title)
    const result = await ALL_TOOLS.createTicketTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const checkTicketStatus = tool({
  description: 'Check status of user tickets. Returns all tickets if ticket_id not provided.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    ticket_id: z.string().uuid().optional().describe('Specific ticket ID (optional)')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] checkTicketStatus')
    const result = await ALL_TOOLS.checkTicketStatusTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const closeTicket = tool({
  description: 'Close a support ticket. Only use when issue is fully resolved.',
  parameters: z.object({
    ticket_id: z.string().uuid().describe('Ticket ID to close'),
    resolution: z.string().optional().describe('Resolution notes in Arabic')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] closeTicket:', params.ticket_id)
    const result = await ALL_TOOLS.closeTicketTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

/**
 * APPOINTMENT TOOLS
 */

export const getAppointments = tool({
  description: 'Get user appointments at labor offices. Returns upcoming and past appointments.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid())
  }),
  execute: async ({ user_id }) => {
    console.log('🔧 [LLM CALL] getAppointments:', user_id)
    const result = await ALL_TOOLS.getAppointmentsTool.execute({ user_id })
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const scheduleAppointment = tool({
  description: `Schedule appointment at labor office.
  Requires date (YYYY-MM-DD), time (HH:MM), and office location.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date in YYYY-MM-DD format'),
    time: z.string().regex(/^\d{2}:\d{2}$/).describe('Time in HH:MM format (24-hour)'),
    office_location: z.string().min(3).describe('Office location in Arabic')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] scheduleAppointment:', params.date)
    const result = await ALL_TOOLS.scheduleAppointmentTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const cancelAppointment = tool({
  description: 'Cancel an appointment. Requires appointment ID.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    appointment_id: z.string().uuid().describe('Appointment ID to cancel')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] cancelAppointment:', params.appointment_id)
    const result = await ALL_TOOLS.cancelAppointmentTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

/**
 * PROACTIVE TOOLS
 */

export const getProactiveEvents = tool({
  description: `Get pending proactive events for user (contract expiry warnings, open tickets, incomplete profiles, etc).
  These are system-detected events that require user attention.`,
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    limit: z.number().int().positive().optional().default(5).describe('Maximum number of events to return')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] getProactiveEvents:', params.user_id)
    const result = await ALL_TOOLS.getProactiveEventsTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const markEventActed = tool({
  description: 'Mark proactive event as acted upon after handling it. Use this after addressing a proactive event.',
  parameters: z.object({
    event_id: z.string().uuid().describe('Proactive event ID'),
    action_taken: z.string().optional().describe('Description of action taken in Arabic')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] markEventActed:', params.event_id)
    const result = await ALL_TOOLS.markEventActedTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const createProactiveEvent = tool({
  description: 'Create new proactive event for user. Use when detecting issues or upcoming deadlines.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    event_type: z.string().describe('Type of event (e.g. contract_expiring, incomplete_profile)'),
    suggested_action: z.string().describe('Suggested action for user in Arabic'),
    metadata: z.record(z.any()).optional().describe('Additional event metadata')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] createProactiveEvent:', params.event_type)
    const result = await ALL_TOOLS.createProactiveEventTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

/**
 * PREDICTION & FEEDBACK TOOLS
 */

export const predictUserNeed = tool({
  description: 'Analyze user behavior to predict their next need based on historical patterns.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid())
  }),
  execute: async ({ user_id }) => {
    console.log('🔧 [LLM CALL] predictUserNeed:', user_id)
    const result = await ALL_TOOLS.predictUserNeedTool.execute({ user_id })
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const recordFeedback = tool({
  description: 'Record user feedback/rating for agent interaction.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    rating: z.number().int().min(1).max(5).describe('Rating from 1-5'),
    feedback_text: z.string().optional().describe('Optional feedback text in Arabic'),
    interaction_type: z.string().describe('Type of interaction being rated')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] recordFeedback:', params.rating)
    const result = await ALL_TOOLS.recordFeedbackTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const getFeedback = tool({
  description: 'Get user feedback history. Returns past ratings and feedback.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    limit: z.number().int().positive().optional().default(10)
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] getFeedback:', params.user_id)
    const result = await ALL_TOOLS.getFeedbackTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

export const analyzeSentiment = tool({
  description: 'Analyze sentiment of user message to gauge satisfaction/emotion.',
  parameters: z.object({
    user_id: z.preprocess(preprocessUserId, z.string().uuid()),
    message: z.string().describe('User message to analyze')
  }),
  execute: async (params) => {
    console.log('🔧 [LLM CALL] analyzeSentiment')
    const result = await ALL_TOOLS.analyzeSentimentTool.execute(params)
    console.log('📊 [RESULT]', result.success ? '✅' : '❌')
    return result
  }
})

/**
 * ALL TOOLS REGISTRY FOR AI SDK
 */
export const AGENTIC_TOOLS = {
  // User Profile tools (1)
  getUserProfile,

  // Resume tools (5)
  getResume,
  createResume,
  updateResume,
  updateResumeFromText,
  addCourse,

  // Certificate tools (2)
  createCertificate,
  getCertificates,

  // Contract tools (4)
  getContracts,
  checkContractExpiry,
  renewContract,
  updateContract,

  // Ticket tools (3)
  createTicket,
  checkTicketStatus,
  closeTicket,

  // Appointment tools (3)
  getAppointments,
  scheduleAppointment,
  cancelAppointment,

  // Proactive tools (3)
  getProactiveEvents,
  markEventActed,
  createProactiveEvent,

  // Prediction & feedback tools (4)
  predictUserNeed,
  recordFeedback,
  getFeedback,
  analyzeSentiment,
}

console.log(`✅ Loaded ${Object.keys(AGENTIC_TOOLS).length} agentic tools for LLM`)
