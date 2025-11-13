import { db, findByUser, insert, update } from '@/lib/db/db'
import { Resume, ResumeCourse, UpdateResumeInput, AddCourseInput } from '@/lib/db/types'

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
  const resumeData = {
    user_id,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  return await insert<Resume>('resumes', resumeData)
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
    .order('completion_date', { ascending: false })

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


