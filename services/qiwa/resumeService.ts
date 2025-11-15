import { db, findByUser, insert, update } from '@/lib/db/db'
import { Resume, ResumeCourse, UpdateResumeInput, AddCourseInput } from '@/lib/db/types'
import { getUserProfile, createUserProfile } from '@/lib/supabase'

export async function getResume(user_id: string): Promise<Resume | null> {
  const { data, error } = await db
    .from('resumes')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching resume:', error)
    return null
  }

  return data as Resume
}

export async function getResumeWithCourses(user_id: string): Promise<{ resume: Resume | null; courses: ResumeCourse[] }> {
  const resume = await getResume(user_id)
  
  if (!resume) {
    return { resume: null, courses: [] }
  }

  const courses = await getCourses(resume.id)

  return { resume, courses }
}

export async function createResume(user_id: string, data: UpdateResumeInput): Promise<Resume | null> {
  try {
    console.log('📝 Creating resume for user:', user_id)
    console.log('📋 Resume data:', JSON.stringify(data, null, 2))
    
    // ✅ CRITICAL: Ensure user exists in user_profile before creating resume
    let userProfile = await getUserProfile(user_id)
    
    if (!userProfile) {
      console.log('🔧 User not found in user_profile. Creating profile...')
      
      // Try to create user profile directly with db
      const { data: newProfile, error } = await db
        .from('user_profile')
        .insert({
          user_id,
          full_name: 'مستخدم جديد',
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        // If user already exists (23505), that's okay
        if (error.code === '23505') {
          console.log('⚠️ User profile already exists, continuing...')
        } else {
          console.error('❌ Failed to create user profile:', error)
          throw new Error(`فشل إنشاء ملف المستخدم: ${error.message}`)
        }
      } else {
        console.log('✅ User profile created successfully:', newProfile)
      }
    } else {
      console.log('✅ User profile found:', userProfile.user_id)
    }

    const resumeData = {
      user_id,
      job_title: data.job_title || '',
      skills: data.skills || [],
      experience_years: data.experience_years || 0,
      education: data.education || '',
      summary: data.summary || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Inserting resume into database...')
    const result = await insert<Resume>('resumes', resumeData)
    
    if (!result) {
      console.error('❌ Failed to insert resume into database')
      throw new Error('فشل حفظ السيرة الذاتية في قاعدة البيانات')
    }
    
    console.log('✅ Resume created successfully:', result.id)
    return result
  } catch (error: any) {
    console.error('❌ Error in createResume:', error)
    throw error
  }
}

export async function updateResume(user_id: string, data: UpdateResumeInput): Promise<Resume | null> {
  const existingResume = await getResume(user_id)

  if (!existingResume) {
    return await createResume(user_id, data)
  }

  return await update<Resume>(
    'resumes',
    { id: existingResume.id },
    {
      ...data,
      updated_at: new Date().toISOString()
    }
  )
}

export async function getCourses(resume_id: string): Promise<ResumeCourse[]> {
  const { data, error } = await db
    .from('resume_courses')
    .select('*')
    .eq('resume_id', resume_id)
    .order('date_completed', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  return (data || []) as ResumeCourse[]
}

export async function addCourse(resume_id: string, courseData: Omit<AddCourseInput, 'resume_id'>): Promise<ResumeCourse | null> {
  const data = {
    resume_id,
    ...courseData,
    created_at: new Date().toISOString()
  }

  return await insert<ResumeCourse>('resume_courses', data)
}

export async function deleteCourse(course_id: string): Promise<boolean> {
  const { error } = await db
    .from('resume_courses')
    .delete()
    .eq('id', course_id)

  if (error) {
    console.error('Error deleting course:', error)
    return false
  }

  return true
}


