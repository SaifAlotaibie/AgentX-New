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

// Resume Tools
export * from './resumeTools'

// Prediction Tools
export * from './predictionTools'

// Feedback Tools
export * from './feedbackTools'

// Proactive Tools
export * from './proactiveTools'

// All available tools registry
import {  createTicketTool, closeTicketTool, checkTicketStatusTool } from './ticketTools'
import { renewContractTool, updateContractTool, checkContractExpiryTool, getContractsTool } from './contractTools'
import { createCertificateTool, getCertificatesTool } from './certificateTools'
import { scheduleAppointmentTool, cancelAppointmentTool, getAppointmentsTool } from './appointmentTools'
import { createResumeTool, updateResumeTool, addCourseToResumeTool, getResumeTool } from './resumeTools'
import { predictUserNeedTool, recordFeedbackTool } from './predictionTools'
import { getFeedbackTool, analyzeSentimentTool } from './feedbackTools'
import { getProactiveEventsTool, markEventActedTool, createProactiveEventTool } from './proactiveTools'

export const ALL_TOOLS = {
  // Ticket Tools
  createTicketTool,
  closeTicketTool,
  checkTicketStatusTool,
  
  // Contract Tools
  renewContractTool,
  updateContractTool,
  checkContractExpiryTool,
  getContractsTool,
  
  // Certificate Tools
  createCertificateTool,
  getCertificatesTool,
  
  // Appointment Tools
  scheduleAppointmentTool,
  cancelAppointmentTool,
  getAppointmentsTool,
  
  // Resume Tools
  createResumeTool,
  updateResumeTool,
  addCourseToResumeTool,
  getResumeTool,
  
  // Prediction Tools
  predictUserNeedTool,
  recordFeedbackTool,
  
  // Feedback Tools
  getFeedbackTool,
  analyzeSentimentTool,
  
  // Proactive Tools
  getProactiveEventsTool,
  markEventActedTool,
  createProactiveEventTool,
}

export type ToolName = keyof typeof ALL_TOOLS
