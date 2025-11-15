import { NextRequest, NextResponse } from 'next/server'
import { findById as findUserProfile } from '@/lib/db/db'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/lib/db/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id مطلوب' },
        { status: 400 }
      )
    }

    // جلب بيانات المستخدم
    const userProfile = await findUserProfile('user_profile', userId) as UserProfile | null
    
    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // جلب بيانات العقد الحالي
    const { data: contracts, error: contractError } = await supabase
      .from('employment_contracts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)

    if (contractError) {
      console.error('Contract fetch error:', contractError)
    }

    const currentContract = contracts && contracts.length > 0 ? contracts[0] : null

    // جلب بيانات السيرة الذاتية
    const { data: resumes, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (resumeError) {
      console.error('Resume fetch error:', resumeError)
    }

    const resume = resumes && resumes.length > 0 ? resumes[0] : null

    // حساب نسبة اكتمال السيرة الذاتية
    let resumeCompletionPercentage = 0
    let completedSteps = 0
    const totalSteps = 6

    if (resume) {
      if (resume.job_title) completedSteps++
      if (resume.summary) completedSteps++
      if (resume.education) completedSteps++
      if (resume.skills && resume.skills.length > 0) completedSteps++
      if (resume.experience_years) completedSteps++
      // TODO: إضافة فحص للشهادات والتطوع
      
      resumeCompletionPercentage = Math.round((completedSteps / totalSteps) * 100)
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userProfile.user_id,
          name: userProfile.full_name,
          email: userProfile.email || '-',
          phone: userProfile.phone || '-',
          nationality: userProfile.nationality || 'سعودي',
          birthDate: userProfile.birth_date || '-',
          gender: userProfile.gender || '-',
          address: userProfile.address || '-',
          employeeNumber: userProfile.employee_number || '-',
          job: currentContract ? currentContract.position : 'موظف',
          verified: true
        },
        contract: currentContract ? {
          id: currentContract.id,
          company: currentContract.company_name || currentContract.employer_name || 'شركة مقدام الرياضية',
          status: currentContract.status === 'active' ? 'ساري' : 'منتهي',
          contractNumber: currentContract.contract_number || currentContract.id.substring(0, 8),
          jobTitle: currentContract.job_title || 'استقبال',
          type: currentContract.contract_type || 'عقد بدوام كامل - 12 شهر',
          notificationPeriod: currentContract.notification_period || '60 يوم',
          probationPeriod: currentContract.probation_period || '90 يوم',
          renewal: currentContract.renewal_type || 'غير محدد',
          startDate: currentContract.start_date ? new Date(currentContract.start_date).toLocaleDateString('ar-SA') : '2025/04/28',
          endDate: currentContract.end_date ? new Date(currentContract.end_date).toLocaleDateString('ar-SA') : '2026/04/27',
          lastUpdate: currentContract.updated_at ? new Date(currentContract.updated_at).toLocaleDateString('ar-SA') : '2025/04/28'
        } : null,
        resume: resume ? {
          completionPercentage: resumeCompletionPercentage,
          completedSteps: completedSteps,
          totalSteps: totalSteps,
          completionLevel: resumeCompletionPercentage < 40 ? 'مبتدئ' : resumeCompletionPercentage < 70 ? 'متوسط' : 'متقدم',
          hasJobTitle: !!resume.job_title,
          hasSummary: !!resume.summary,
          hasEducation: !!resume.education,
          hasSkills: resume.skills && resume.skills.length > 0,
          hasExperience: !!resume.experience_years
        } : {
          completionPercentage: 0,
          completedSteps: 0,
          totalSteps: totalSteps,
          completionLevel: 'مبتدئ',
          hasJobTitle: false,
          hasSummary: false,
          hasEducation: false,
          hasSkills: false,
          hasExperience: false
        }
      }
    })

  } catch (error: any) {
    console.error('❌ User data fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ أثناء جلب البيانات',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

