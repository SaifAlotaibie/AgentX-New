/**
 * Resume Module - Type Definitions
 * Contains all TypeScript interfaces for the resume generation and parsing module
 */

// ============================================
// Resume Generation Types
// ============================================

export interface PersonalInfo {
  fullName: string
  email?: string
  phone?: string
  address?: string
  nationality?: string
}

export interface WorkExperience {
  company: string
  position: string
  startDate: string
  endDate?: string | null
  description?: string
}

export interface Course {
  name: string
  institution: string
  completionDate?: string
}

export interface CertificateInfo {
  type: string
  issueDate: string
}

/**
 * Aggregated resume data from all database sources
 */
export interface AggregatedResumeData {
  personalInfo: PersonalInfo
  summary?: string
  skills: string[]
  experienceYears: number
  education?: string
  experience: WorkExperience[]
  courses: Course[]
  certificates: CertificateInfo[]
}

/**
 * AI-formatted resume data optimized for ATS
 */
export interface FormattedResumeData {
  personalInfo: PersonalInfo
  summary: string
  skills: string[]
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    highlights: string[]
  }>
  education: string
  courses: Course[]
  certificates: CertificateInfo[]
}

export type ResumeTemplateStyle = 'modern' | 'classic' | 'minimal'

export interface GenerateResumeOptions {
  userId: string
  templateStyle?: ResumeTemplateStyle
  includePhoto?: boolean
  language?: 'ar' | 'en'
}

export interface GenerateResumeResult {
  success: boolean
  pdfUrl?: string
  fileName?: string
  generatedAt?: string
  error?: string
}

// ============================================
// Resume Upload & Parsing Types
// ============================================

/**
 * Data extracted from uploaded resume
 */
export interface ExtractedResumeData {
  personalInfo: {
    fullName?: string
    email?: string
    phone?: string
    address?: string
    nationality?: string
  }
  summary?: string
  skills: string[]
  experienceYears: number
  education?: string
  experience: WorkExperience[]
  courses: Course[]
}

/**
 * Proposed changes after parsing uploaded resume
 */
export interface ProposedChanges {
  profile: Record<string, any>
  resume: Record<string, any>
  newExperiences: WorkExperience[]
  newCourses: Course[]
}

export interface UploadResumeResult {
  success: boolean
  sessionId?: string
  proposedChanges?: ProposedChanges
  extractedData?: ExtractedResumeData
  message?: string
  error?: string
}

export interface ConfirmUpdateResult {
  success: boolean
  message?: string
  updatedFields?: {
    profile: number
    resume: number
    contracts: number
    courses: number
  }
  error?: string
}

// ============================================
// API Request/Response Types
// ============================================

export interface GenerateResumeRequest {
  userId: string
  templateStyle?: ResumeTemplateStyle
  includePhoto?: boolean
}

export interface GenerateResumeResponse {
  success: boolean
  pdfUrl?: string
  fileName?: string
  generatedAt?: string
  error?: string
}

export interface UploadResumeRequest {
  file: File
  userId: string
}

export interface ConfirmUpdateRequest {
  sessionId: string
  userId: string
  confirmedChanges: ProposedChanges
}

// ============================================
// ATS Compliance Types
// ============================================

export interface ATSReport {
  score: number
  issues: string[]
  warnings: string[]
  passed: boolean
}

// ============================================
// Temporary Storage Types
// ============================================

export interface TemporaryResumeSession {
  sessionId: string
  userId: string
  proposedChanges: ProposedChanges
  extractedData: ExtractedResumeData
  fileUrl: string
  createdAt: string
  expiresAt: string
}


