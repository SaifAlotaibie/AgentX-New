// Export all tools
export * from './types'
export * from './logger'

// Ticket Tools
export * from './ticketTools'

// Contract Tools
export * from './contractTools'

// Certificate Tools
export * from './certificateTools'

// Appointment Tools
export * from './appointmentTools'

// Domestic Labor Tools
export * from './domesticTools'

// Resume Tools
export * from './resumeTools'

// Prediction Tools
export * from './predictionTools'

// All available tools registry
import {  createTicketTool, closeTicketTool, checkTicketStatusTool } from './ticketTools'
import { renewContractTool, updateContractTool, checkContractExpiryTool } from './contractTools'
import { createCertificateTool, getCertificatesTool } from './certificateTools'
import { scheduleAppointmentTool, cancelAppointmentTool, getAppointmentsTool } from './appointmentTools'
import { createDomesticLaborRequestTool, getDomesticLaborRequestsTool } from './domesticTools'
import { createResumeTool, updateResumeTool, addCourseToResumeTool, getResumeTool } from './resumeTools'
import { predictUserNeedTool, recordFeedbackTool } from './predictionTools'

export const ALL_TOOLS = {
  // Ticket Tools
  createTicketTool,
  closeTicketTool,
  checkTicketStatusTool,
  
  // Contract Tools
  renewContractTool,
  updateContractTool,
  checkContractExpiryTool,
  
  // Certificate Tools
  createCertificateTool,
  getCertificatesTool,
  
  // Appointment Tools
  scheduleAppointmentTool,
  cancelAppointmentTool,
  getAppointmentsTool,
  
  // Domestic Labor Tools
  createDomesticLaborRequestTool,
  getDomesticLaborRequestsTool,
  
  // Resume Tools
  createResumeTool,
  updateResumeTool,
  addCourseToResumeTool,
  getResumeTool,
  
  // Prediction Tools
  predictUserNeedTool,
  recordFeedbackTool,
}

export type ToolName = keyof typeof ALL_TOOLS
