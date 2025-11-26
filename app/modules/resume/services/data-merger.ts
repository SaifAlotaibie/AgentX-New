/**
 * Data Merger Service
 * Intelligently merges extracted resume data with existing user profile
 * Implements smart merge rules to preserve good data
 */

import {
  ExtractedResumeData,
  ProposedChanges,
  WorkExperience,
  Course
} from '../types'
import { db } from '@/lib/db/db'

interface ExistingProfile {
  user_id: string
  full_name?: string
  email?: string
  phone?: string
  address?: string
  nationality?: string
}

interface ExistingResume {
  id: string
  user_id: string
  job_title?: string
  skills?: string[]
  experience_years?: number
  education?: string
  summary?: string
}

/**
 * Main function: Merge extracted resume data with existing profile
 * Updated logic: Show ALL extracted data as proposed changes
 * Let the user decide what to apply (front-end handles confirmation)
 * 
 * Rules:
 * 1. Include all extracted non-empty values as proposals
 * 2. Mark if value differs from existing (isNew/isDifferent)
 * 3. Skills are combined (new + existing)
 * 4. All experiences and courses are included
 */
export function mergeResumeData(
  extracted: ExtractedResumeData,
  existingProfile: ExistingProfile | null,
  existingResume: ExistingResume | null
): ProposedChanges {
  console.log('🔀 Merging resume data...')
  console.log('📥 Extracted data:', JSON.stringify(extracted, null, 2))

  const changes: ProposedChanges = {
    profile: {},
    resume: {},
    newExperiences: [],
    newCourses: []
  }

  // ========================================
  // Personal Info → user_profile
  // Include all extracted values (even if existing has data)
  // ========================================

  // Full name: Include if extracted has value
  if (extracted.personalInfo.fullName) {
    changes.profile.full_name = extracted.personalInfo.fullName
  }

  // Email: Include if extracted has value
  if (extracted.personalInfo.email) {
    changes.profile.email = extracted.personalInfo.email
  }

  // Phone: Include if extracted has value
  if (extracted.personalInfo.phone) {
    changes.profile.phone = extracted.personalInfo.phone
  }

  // Address: Include if extracted has value
  if (extracted.personalInfo.address) {
    changes.profile.address = extracted.personalInfo.address
  }

  // Nationality: Include if extracted has value
  if (extracted.personalInfo.nationality) {
    changes.profile.nationality = extracted.personalInfo.nationality
  }

  // ========================================
  // Resume Data → resumes table
  // ========================================

  // Summary: Include if extracted has value
  if (extracted.summary) {
    changes.resume.summary = extracted.summary
  }

  // Skills: Combine unique skills (new skills get added to existing)
  if (extracted.skills && extracted.skills.length > 0) {
    const existingSkills = existingResume?.skills || []
    const newSkills = extracted.skills.filter(
      skill => !existingSkills.some(
        existing => existing.toLowerCase() === skill.toLowerCase()
      )
    )

    if (newSkills.length > 0) {
      // Combine existing + new skills
      changes.resume.skills = [...existingSkills, ...newSkills]
    } else if (existingSkills.length === 0) {
      // No existing skills, use all extracted
      changes.resume.skills = extracted.skills
    }
  }

  // Experience years: Include if extracted has value > 0
  if (extracted.experienceYears > 0) {
    changes.resume.experience_years = extracted.experienceYears
  }

  // Education: Include if extracted has value
  if (extracted.education) {
    changes.resume.education = extracted.education
  }

  // ========================================
  // New Work Experiences → employment_contracts
  // ========================================

  if (extracted.experience && extracted.experience.length > 0) {
    // All extracted experiences are potential new entries
    changes.newExperiences = extracted.experience.filter(exp =>
      exp.company && exp.position
    )
  }

  // ========================================
  // New Courses → resume_courses
  // ========================================

  if (extracted.courses && extracted.courses.length > 0) {
    changes.newCourses = extracted.courses.filter(course =>
      course.name && course.institution
    )
  }

  // Log summary
  console.log('✅ Merge complete:', {
    profileChanges: Object.keys(changes.profile).length,
    resumeChanges: Object.keys(changes.resume).length,
    newExperiences: changes.newExperiences.length,
    newCourses: changes.newCourses.length
  })

  return changes
}

/**
 * Fetch existing user profile from database
 */
export async function getExistingProfile(userId: string): Promise<ExistingProfile | null> {
  const { data, error } = await db
    .from('user_profile')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    console.log('📝 No existing profile found for:', userId)
    return null
  }

  return data as ExistingProfile
}

/**
 * Fetch existing resume from database
 */
export async function getExistingResume(userId: string): Promise<ExistingResume | null> {
  const { data, error } = await db
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    console.log('📝 No existing resume found for:', userId)
    return null
  }

  return data as ExistingResume
}

/**
 * Apply confirmed changes to database
 */
export async function applyConfirmedChanges(
  userId: string,
  confirmedChanges: ProposedChanges
): Promise<{
  success: boolean
  updatedFields: {
    profile: number
    resume: number
    contracts: number
    courses: number
  }
  error?: string
}> {
  console.log('💾 Applying confirmed changes for user:', userId)

  const results = {
    profile: 0,
    resume: 0,
    contracts: 0,
    courses: 0
  }

  try {
    // ========================================
    // Update Profile
    // ========================================
    if (Object.keys(confirmedChanges.profile).length > 0) {
      const { error } = await db
        .from('user_profile')
        .update({
          ...confirmedChanges.profile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (!error) {
        results.profile = Object.keys(confirmedChanges.profile).length
      } else {
        console.error('Error updating profile:', error)
      }
    }

    // ========================================
    // Update or Create Resume
    // ========================================
    if (Object.keys(confirmedChanges.resume).length > 0) {
      // Check if resume exists
      const { data: existingResume } = await db
        .from('resumes')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (existingResume) {
        // Update existing
        const { error } = await db
          .from('resumes')
          .update({
            ...confirmedChanges.resume,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (!error) {
          results.resume = Object.keys(confirmedChanges.resume).length
        }
      } else {
        // Create new
        const { error } = await db
          .from('resumes')
          .insert({
            user_id: userId,
            ...confirmedChanges.resume,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (!error) {
          results.resume = Object.keys(confirmedChanges.resume).length
        }
      }
    }

    // ========================================
    // Create New Employment Contracts
    // ========================================
    if (confirmedChanges.newExperiences && confirmedChanges.newExperiences.length > 0) {
      const contractsToInsert = confirmedChanges.newExperiences.map(exp => ({
        user_id: userId,
        employer_name: exp.company,
        position: exp.position,
        start_date: exp.startDate || new Date().toISOString(),
        end_date: exp.endDate || null,
        status: exp.endDate ? 'ended' : 'active',
        contract_type: 'full-time',
        salary: 0, // To be updated by user
        created_at: new Date().toISOString()
      }))

      const { error } = await db
        .from('employment_contracts')
        .insert(contractsToInsert)

      if (!error) {
        results.contracts = contractsToInsert.length
      } else {
        console.error('Error inserting contracts:', error)
      }
    }

    // ========================================
    // Create New Courses
    // ========================================
    if (confirmedChanges.newCourses && confirmedChanges.newCourses.length > 0) {
      // Get resume ID first
      const { data: resume } = await db
        .from('resumes')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (resume) {
        const coursesToInsert = confirmedChanges.newCourses.map(course => ({
          resume_id: resume.id,
          course_name: course.name,
          provider: course.institution,
          date_completed: course.completionDate || new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        }))

        const { error } = await db
          .from('resume_courses')
          .insert(coursesToInsert)

        if (!error) {
          results.courses = coursesToInsert.length
        } else {
          console.error('Error inserting courses:', error)
        }
      }
    }

    console.log('✅ Changes applied successfully:', results)

    return {
      success: true,
      updatedFields: results
    }

  } catch (error: any) {
    console.error('❌ Error applying changes:', error)
    return {
      success: false,
      updatedFields: results,
      error: error.message
    }
  }
}

/**
 * Generate summary of proposed changes for user review
 */
export function summarizeChanges(changes: ProposedChanges): string {
  const parts: string[] = []

  const profileCount = Object.keys(changes.profile).length
  if (profileCount > 0) {
    parts.push(`${profileCount} تحديث للملف الشخصي`)
  }

  const resumeCount = Object.keys(changes.resume).length
  if (resumeCount > 0) {
    parts.push(`${resumeCount} تحديث للسيرة الذاتية`)
  }

  if (changes.newExperiences.length > 0) {
    parts.push(`${changes.newExperiences.length} خبرة عمل جديدة`)
  }

  if (changes.newCourses.length > 0) {
    parts.push(`${changes.newCourses.length} دورة تدريبية جديدة`)
  }

  if (parts.length === 0) {
    return 'لم يتم العثور على تغييرات جديدة'
  }

  return `وُجد: ${parts.join('، ')}`
}

