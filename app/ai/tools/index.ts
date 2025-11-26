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

// User Profile Tools
export * from './userProfileTools'

// All available tools registry
import {  createTicketTool, closeTicketTool, checkTicketStatusTool } from './ticketTools'
import { renewContractTool, updateContractTool, checkContractExpiryTool, getContractsTool } from './contractTools'
import { createCertificateTool, getCertificatesTool } from './certificateTools'
import { scheduleAppointmentTool, cancelAppointmentTool, getAppointmentsTool } from './appointmentTools'
import { createResumeTool, updateResumeTool, addCourseToResumeTool, getResumeTool } from './resumeTools'
import { predictUserNeedTool, recordFeedbackTool } from './predictionTools'
import { getFeedbackTool, analyzeSentimentTool } from './feedbackTools'
import { getProactiveEventsTool, markEventActedTool, createProactiveEventTool } from './proactiveTools'
import { getUserProfileTool } from './userProfileTools'

// Resume Module Tools (New)
import { generateResumePDFTool, processUploadedResumeTool } from '@/app/modules/resume'

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
  
  // Resume Tools (Basic)
  createResumeTool,
  updateResumeTool,
  addCourseToResumeTool,
  getResumeTool,
  
  // Resume Module Tools (Advanced - PDF Generation & Upload Processing)
  generateResumePDFTool,
  processUploadedResumeTool,
  
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

  // User Profile Tools
  getUserProfileTool,
}

export type ToolName = keyof typeof ALL_TOOLS
