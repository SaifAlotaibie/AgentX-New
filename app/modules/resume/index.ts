/**
 * Resume Module - Main Export
 * 
 * Self-contained module for resume generation and parsing features:
 * 1. AI Resume Generator - Creates ATS-friendly PDF resumes from user data
 * 2. Resume Upload Parser - Extracts data from uploaded resumes to update profiles
 * 
 * Usage:
 * import { generateResumePDFTool, processUploadedResumeTool } from '@/app/modules/resume'
 */

// ========================================
// Agent Tools (Main exports)
// ========================================
export { generateResumePDFTool, processUploadedResumeTool } from './tools'

// ========================================
// Types
// ========================================
export * from './types'

// ========================================
// Services (for direct use if needed)
// ========================================
export {
  // Data Aggregator
  aggregateResumeData,
  calculateExperienceYears,
  hasMinimumResumeData,
  
  // AI Formatter
  formatResumeForATS,
  generateATSKeywords,
  
  // PDF Generator
  generateResumePDF,
  logResumeGeneration,
  validateATSCompliance,
  htmlToDataUrl,
  
  // Resume Parser
  parseResumeFile,
  extractTextFromPDF,
  extractTextFromDOCX,
  sanitizeResumeText,
  detectFileType,
  
  // Data Merger
  mergeResumeData,
  getExistingProfile,
  getExistingResume,
  applyConfirmedChanges,
  summarizeChanges
} from './services'


