/**
 * Resume Data Aggregator Service
 * Collects all user data from multiple database tables for resume generation
 */

import { db } from '@/lib/db/db'
import { 
  AggregatedResumeData, 
  PersonalInfo, 
  WorkExperience, 
  Course, 
  CertificateInfo 
} from '../types'

/**
 * Fetch user profile from database
 */
async function getUserProfile(userId: string): Promise<PersonalInfo | null> {
  const { data, error } = await db
    .from('user_profile')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    console.log('📝 No user profile found for:', userId)
    return null
  }

  return {
    fullName: data.full_name || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    nationality: data.nationality || ''
  }
}

/**
 * Fetch user resume data from database
 */
async function getResumeData(userId: string): Promise<{
  summary?: string
  skills: string[]
  experienceYears: number
  education?: string
  resumeId?: string
} | null> {
  const { data, error } = await db
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    console.log('📝 No resume found for:', userId)
    return null
  }

  return {
    summary: data.summary || '',
    skills: data.skills || [],
    experienceYears: data.experience_years || 0,
    education: data.education || '',
    resumeId: data.id
  }
}

/**
 * Fetch employment contracts as work experience
 */
async function getWorkExperience(userId: string): Promise<WorkExperience[]> {
  const { data, error } = await db
    .from('employment_contracts')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (error || !data) {
    console.log('📝 No employment contracts found for:', userId)
    return []
  }

  return data.map(contract => ({
    company: contract.employer_name || '',
    position: contract.position || '',
    startDate: contract.start_date || '',
    endDate: contract.end_date || null,
    description: `العمل كـ ${contract.position} في ${contract.employer_name}`
  }))
}

/**
 * Fetch certificates
 */
async function getCertificates(userId: string): Promise<CertificateInfo[]> {
  const { data, error } = await db
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .order('issue_date', { ascending: false })

  if (error || !data) {
    console.log('📝 No certificates found for:', userId)
    return []
  }

  return data.map(cert => ({
    type: cert.certificate_type || '',
    issueDate: cert.issue_date || ''
  }))
}

/**
 * Fetch courses from resume
 */
async function getCourses(resumeId?: string): Promise<Course[]> {
  if (!resumeId) return []

  const { data, error } = await db
    .from('resume_courses')
    .select('*')
    .eq('resume_id', resumeId)
    .order('date_completed', { ascending: false })

  if (error || !data) {
    console.log('📝 No courses found for resume:', resumeId)
    return []
  }

  return data.map(course => ({
    name: course.course_name || '',
    institution: course.provider || '',
    completionDate: course.date_completed || ''
  }))
}

/**
 * Main function: Aggregate all resume data for a user
 * Fetches data from: user_profile, resumes, employment_contracts, certificates, resume_courses
 */
export async function aggregateResumeData(userId: string): Promise<AggregatedResumeData> {
  console.log('📊 Aggregating resume data for user:', userId)

  // Fetch all data in parallel for performance
  const [
    profile,
    resumeData,
    experience,
    certificates
  ] = await Promise.all([
    getUserProfile(userId),
    getResumeData(userId),
    getWorkExperience(userId),
    getCertificates(userId)
  ])

  // Fetch courses (depends on resume ID)
  const courses = await getCourses(resumeData?.resumeId)

  // Build aggregated data object
  const aggregatedData: AggregatedResumeData = {
    personalInfo: profile || {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      nationality: ''
    },
    summary: resumeData?.summary || '',
    skills: resumeData?.skills || [],
    experienceYears: resumeData?.experienceYears || 0,
    education: resumeData?.education || '',
    experience: experience,
    courses: courses,
    certificates: certificates
  }

  console.log('✅ Aggregated data:', {
    hasProfile: !!profile,
    hasResume: !!resumeData,
    experienceCount: experience.length,
    coursesCount: courses.length,
    certificatesCount: certificates.length
  })

  return aggregatedData
}

/**
 * Calculate total experience years from work history
 */
export function calculateExperienceYears(experience: WorkExperience[]): number {
  if (!experience || experience.length === 0) return 0

  let totalMonths = 0

  experience.forEach(exp => {
    if (!exp.startDate) return

    const start = new Date(exp.startDate)
    const end = exp.endDate ? new Date(exp.endDate) : new Date()
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth())
    
    totalMonths += Math.max(0, months)
  })

  return Math.round(totalMonths / 12)
}

/**
 * Check if user has enough data to generate a resume
 */
export function hasMinimumResumeData(data: AggregatedResumeData): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []

  if (!data.personalInfo.fullName) {
    missing.push('الاسم الكامل')
  }

  if (!data.personalInfo.email && !data.personalInfo.phone) {
    missing.push('البريد الإلكتروني أو رقم الهاتف')
  }

  // At least some content
  if (data.skills.length === 0 && data.experience.length === 0 && !data.education) {
    missing.push('المهارات أو الخبرات أو التعليم')
  }

  return {
    valid: missing.length === 0,
    missing
  }
}


