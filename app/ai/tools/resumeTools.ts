import { Tool, ToolResult } from './types'
import { findByUser, findById, insert, update } from '@/lib/db/db'
import { db } from '@/lib/db/db'
import { Resume, ResumeCourse } from '@/lib/db/types'
import { logAgentAction, updateUserBehavior } from './logger'
import { createTicketTool } from './ticketTools'

/**
 * Get Resume Tool - Fetch user's resume from database
 * MANDATORY: Use this FIRST before any resume operations
 */
export const getResumeTool: Tool = {
  name: 'getResumeTool',
  description: 'جلب السيرة الذاتية من قاعدة البيانات. يجب استخدام هذه الأداة أولاً قبل أي عملية تتعلق بالسيرة الذاتية.',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
  },
  execute: async (params: { user_id: string }): Promise<ToolResult> => {
    try {
      const { user_id } = params

      // Fetch resume
      const resumes = await findByUser<Resume>('resumes', user_id)
      
      if (!resumes || resumes.length === 0) {
        return {
          success: true,
          data: null,
          message: 'المستخدم ليس لديه سيرة ذاتية في النظام حالياً'
        }
      }

      const resume = resumes[0]

      // Fetch courses
      const { data: courses } = await db
        .from('resume_courses')
        .select('*')
        .eq('resume_id', resume.id)
        .order('date_completed', { ascending: false })

      await updateUserBehavior(user_id, {
        last_seen_service: 'resume'
      })

      return {
        success: true,
        data: {
          resume,
          courses: courses || []
        },
        message: 'تم جلب السيرة الذاتية بنجاح'
      }
    } catch (error: any) {
      console.error('Error in getResumeTool:', error)
      return {
        success: false,
        error: error.message || 'فشل جلب السيرة الذاتية'
      }
    }
  }
}

/**
 * Create Resume Tool - Create new resume
 * Auto-creates ticket after creation
 */
export const createResumeTool: Tool = {
  name: 'createResumeTool',
  description: 'إنشاء سيرة ذاتية جديدة. الحقول المدعومة: job_title, education, summary, experience_years, skills',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    job_title: 'المسمى الوظيفي',
    education: 'المؤهل الأكاديمي (اختياري)',
    summary: 'النبذة التعريفية (اختياري)',
    experience_years: 'سنوات الخبرة (رقم)',
    skills: 'المهارات (array من strings)',
  },
  execute: async (params: {
    user_id: string
    job_title: string
    education?: string
    summary?: string
    experience_years?: number
    skills?: string[]
  }): Promise<ToolResult> => {
    try {
      const { user_id, job_title, summary, experience_years, skills } = params

      // Validate required fields
      if (!job_title) {
        return {
          success: false,
          error: 'المسمى الوظيفي مطلوب'
        }
      }

      // Check if resume already exists
      const existing = await findByUser<Resume>('resumes', user_id)
      if (existing && existing.length > 0) {
        return {
          success: false,
          error: 'المستخدم لديه سيرة ذاتية بالفعل. استخدم updateResumeTool للتحديث'
        }
      }

      // Create resume with REAL Supabase operation
      const resumeData = {
        user_id,
        job_title,
        education: params.education || '',
        summary: summary || '',
        experience_years: experience_years || 0,
        skills: skills || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('💾 Creating resume with data:', resumeData)

      const { data: result, error: insertError } = await db
        .from('resumes')
        .insert(resumeData)
        .select()
        .single()

      if (insertError || !result) {
        console.error('❌ Failed to create resume:', insertError)
        return {
          success: false,
          error: insertError?.message || 'فشل إنشاء السيرة الذاتية'
        }
      }

      console.log('✅ Resume created successfully:', result.id)

      // Log action
      await logAgentAction(user_id, 'create_resume', params, { success: true, resume: result })

      // Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'resume'
      })

      // Auto-create ticket (MANDATORY)
      await createTicketTool.execute({
        user_id,
        title: 'إنشاء سيرة ذاتية جديدة عبر المساعد الذكي',
        category: 'agent_action',
        description: `تم إنشاء سيرة ذاتية جديدة للمستخدم. المسمى الوظيفي: ${job_title}`
      })

      return {
        success: true,
        data: result,
        message: 'تم إنشاء السيرة الذاتية بنجاح وفتح تذكرة متابعة'
      }
    } catch (error: any) {
      console.error('Error in createResumeTool:', error)
      return {
        success: false,
        error: error.message || 'فشل إنشاء السيرة الذاتية'
      }
    }
  }
}

/**
 * Update Resume Tool - Update existing resume with REAL Supabase operations
 * Auto-creates ticket after update
 */
export const updateResumeTool: Tool = {
  name: 'updateResumeTool',
  description: 'تحديث سيرة ذاتية موجودة. الحقول المدعومة: job_title, education, summary, experience_years, skills',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    job_title: 'المسمى الوظيفي (اختياري)',
    education: 'المؤهل الأكاديمي (اختياري)',
    summary: 'النبذة التعريفية (اختياري)',
    experience_years: 'سنوات الخبرة (اختياري)',
    skills: 'المهارات (اختياري)',
  },
  execute: async (params: {
    user_id: string
    job_title?: string
    education?: string
    summary?: string
    experience_years?: number
    skills?: string[]
  }): Promise<ToolResult> => {
    try {
      const { user_id, ...updates } = params

      console.log('🔧 updateResumeTool - Starting update for user:', user_id)
      console.log('📝 Update params:', updates)

      // Check if resume exists
      const existing = await findByUser<Resume>('resumes', user_id)
      if (!existing || existing.length === 0) {
        console.log('⚠️  Resume not found - Creating new one automatically')
        
        // إنشاء سيرة ذاتية جديدة تلقائياً بناءً على المعلومات المقدمة
        const newResumeData = {
          user_id,
          job_title: updates.job_title || 'موظف',
          education: updates.education || '',
          summary: updates.summary || '',
          experience_years: updates.experience_years || 0,
          skills: updates.skills || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        console.log('💾 Creating new resume automatically:', newResumeData)

        const { data: newResume, error: createError } = await db
          .from('resumes')
          .insert(newResumeData)
          .select()
          .single()

        if (createError || !newResume) {
          console.error('❌ Failed to create resume:', createError)
          return {
            success: false,
            error: `فشل إنشاء السيرة الذاتية: ${createError?.message || 'خطأ غير معروف'}`
          }
        }

        console.log('✅ New resume created successfully:', newResume.id)

        // Log action
        await logAgentAction(user_id, 'create_resume_auto', params, { success: true, resume: newResume })
        await updateUserBehavior(user_id, { last_seen_service: 'resume' })

        // Auto-create ticket
        await createTicketTool.execute({
          user_id,
          title: 'إنشاء سيرة ذاتية تلقائياً عبر المساعد الذكي',
          category: 'agent_action',
          description: `تم إنشاء سيرة ذاتية جديدة تلقائياً بناءً على طلب التحديث`
        })

        return {
          success: true,
          data: newResume,
          message: 'تم إنشاء سيرة ذاتية جديدة وحفظ المعلومات بنجاح! 🎉'
        }
      }

      const resumeId = existing[0].id
      console.log('✅ Found resume:', resumeId)

      // Filter out undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      )

      if (Object.keys(cleanUpdates).length === 0) {
        console.log('⚠️ No updates provided')
        return {
          success: false,
          error: 'لم يتم تقديم أي تحديثات'
        }
      }

      // Add updated_at timestamp
      cleanUpdates.updated_at = new Date().toISOString()

      console.log('💾 Performing REAL Supabase update with:', cleanUpdates)

      // REAL Supabase update operation
      const { data: updatedResume, error: updateError } = await db
        .from('resumes')
        .update(cleanUpdates)
        .eq('user_id', user_id)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Supabase update error:', updateError)
        console.error('Error code:', updateError.code)
        console.error('Error message:', updateError.message)
        return {
          success: false,
          error: `فشل تحديث السيرة الذاتية: ${updateError.message}`
        }
      }

      if (!updatedResume) {
        console.error('❌ No resume returned after update')
        return {
          success: false,
          error: 'فشل تحديث السيرة الذاتية'
        }
      }

      console.log('✅ Resume updated successfully:', updatedResume.id)

      // Log action
      await logAgentAction(user_id, 'update_resume', params, { success: true, resume: updatedResume })

      // Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'resume'
      })

      // Auto-create ticket (MANDATORY)
      const updatedFields = Object.keys(cleanUpdates).filter(k => k !== 'updated_at').join('، ')
      await createTicketTool.execute({
        user_id,
        title: 'تحديث السيرة الذاتية عبر المساعد الذكي',
        category: 'agent_action',
        description: `تم تحديث الحقول التالية: ${updatedFields}`
      })

      return {
        success: true,
        data: updatedResume,
        message: 'تم تحديث السيرة الذاتية بنجاح وفتح تذكرة متابعة'
      }
    } catch (error: any) {
      console.error('❌ Error in updateResumeTool:', error)
      return {
        success: false,
        error: error.message || 'فشل تحديث السيرة الذاتية'
      }
    }
  }
}

/**
 * Add Course to Resume Tool
 * Auto-creates ticket after adding course
 */
export const addCourseToResumeTool: Tool = {
  name: 'addCourseToResumeTool',
  description: 'إضافة دورة تدريبية للسيرة الذاتية',
  parameters: {
    user_id: 'معرف المستخدم (UUID)',
    course_name: 'اسم الدورة',
    institution: 'الجهة المانحة',
    date_completed: 'تاريخ الإكمال (YYYY-MM-DD)',
  },
  execute: async (params: {
    user_id: string
    course_name: string
    institution: string
    date_completed?: string
  }): Promise<ToolResult> => {
    try {
      const { user_id, course_name, institution, date_completed } = params

      // Validate required fields
      if (!course_name || !institution) {
        return {
          success: false,
          error: 'اسم الدورة والجهة المانحة مطلوبان'
        }
      }

      // Check if resume exists
      const existing = await findByUser<Resume>('resumes', user_id)
      if (!existing || existing.length === 0) {
        return {
          success: false,
          error: 'المستخدم ليس لديه سيرة ذاتية. يجب إنشاء سيرة أولاً'
        }
      }

      const resumeId = existing[0].id

      // Create course
      const courseData = {
        resume_id: resumeId,
        course_name,
        institution,
        date_completed: date_completed || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      }

      const result: any = await insert('resume_courses', courseData)

      // Log action
      await logAgentAction(user_id, 'add_course', params, result)

      // Update user behavior
      await updateUserBehavior(user_id, {
        last_seen_service: 'resume'
      })

      // Auto-create ticket (MANDATORY)
      await createTicketTool.execute({
        user_id,
        title: 'إضافة دورة تدريبية عبر المساعد الذكي',
        category: 'agent_action',
        description: `تم إضافة دورة: ${course_name} من ${institution}`
      })

      return {
        success: true,
        data: result.data,
        message: 'تم إضافة الدورة التدريبية بنجاح وفتح تذكرة متابعة'
      }
    } catch (error: any) {
      console.error('Error in addCourseToResumeTool:', error)
      return {
        success: false,
        error: error.message || 'فشل إضافة الدورة التدريبية'
      }
    }
  }
}
