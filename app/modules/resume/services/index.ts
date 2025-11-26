/**
 * Resume Module Services - Index
 * Export all services for the resume module
 */

// Data Aggregator Service
export {
  aggregateResumeData,
  calculateExperienceYears,
  hasMinimumResumeData
} from './data-aggregator'

// AI Formatter Service
export {
  formatResumeForATS,
  generateATSKeywords
} from './ai-formatter'

// PDF Generator Service
export {
  generateResumePDF,
  logResumeGeneration,
  validateATSCompliance,
  htmlToDataUrl
} from './pdf-generator'

// Resume Parser Service
export {
  parseResumeFile,
  extractTextFromPDF,
  extractTextFromDOCX,
  sanitizeResumeText,
  detectFileType
} from './parser'

// Data Merger Service
export {
  mergeResumeData,
  getExistingProfile,
  getExistingResume,
  applyConfirmedChanges,
  summarizeChanges
} from './data-merger'


