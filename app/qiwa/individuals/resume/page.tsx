'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { getUserId } from '@/lib/supabase'
import { Resume, ResumeCourse } from '@/lib/db/types'

export default function ResumePage() {
  const [resume, setResume] = useState<Resume | null>(null)
  const [courses, setCourses] = useState<ResumeCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    job_title: '',
    skills: [] as string[],
    experience_years: 0,
    education: '',
    summary: ''
  })

  useEffect(() => {
    fetchResume()
  }, [])

  const fetchResume = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = getUserId()
      
      const response = await fetch(`/api/qiwa/resume?user_id=${userId}`)
      const result = await response.json()

      if (result.success) {
        setResume(result.data?.resume || null)
        setCourses(result.data?.courses || [])
        
        if (result.data?.resume) {
          setFormData({
            job_title: result.data.resume.job_title || '',
            skills: result.data.resume.skills || [],
            experience_years: result.data.resume.experience_years || 0,
            education: result.data.resume.education || '',
            summary: result.data.resume.summary || ''
          })
        }
      } else {
        setError(result.error || 'فشل في جلب السيرة الذاتية')
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء جلب البيانات')
      console.error('Error fetching resume:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const userId = getUserId()
      
      console.log('📤 Sending resume data...')
      console.log('👤 User ID:', userId)
      console.log('📋 Form data:', formData)
      
      // Validate form data
      if (!formData.job_title?.trim()) {
        alert('⚠️ الرجاء إدخال المسمى الوظيفي')
        return
      }
      
      const payload = { user_id: userId, ...formData }
      console.log('📦 Full payload:', JSON.stringify(payload, null, 2))
      
      const response = await fetch('/api/qiwa/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('📨 Response status:', response.status)
      console.log('📨 Response ok:', response.ok)
      
      const result = await response.json()
      console.log('📦 Response data:', result)

      if (result.success) {
        console.log('✅ Success! Resume data:', result.data)
        alert('✅ تم حفظ السيرة الذاتية بنجاح!')
        setEditing(false)
        await fetchResume() // Refresh data
      } else {
        console.error('❌ API returned error:', result.error)
        console.error('📋 Full error response:', result)
        alert('❌ ' + (result.error || 'فشل في حفظ السيرة الذاتية'))
      }
    } catch (err) {
      console.error('❌ Exception in handleUpdate:', err)
      alert('❌ حدث خطأ أثناء الحفظ. الرجاء المحاولة مرة أخرى.')
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <Link href="/qiwa" className="flex items-center gap-3">
              <img src="/qiwaLogo.png" alt="قوى" className="h-10 w-auto object-contain" />
            </Link>
            <Link href="/qiwa/individuals" className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100" style={{ color: '#4b515a' }}>
              العودة للخدمات
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Breadcrumb items={[
          { label: 'قوى', href: '/qiwa' },
          { label: 'خدمات الأفراد', href: '/qiwa/individuals' },
          { label: 'إدارة السيرة الذاتية' }
        ]} />

        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl p-10 mb-8 shadow-xl relative overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">إدارة السيرة الذاتية</h1>
                  <p className="text-slate-300 text-base mt-1">أنشئ وعدّل سيرتك الذاتية الاحترافية</p>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-xl p-16 text-center border-2 border-slate-200">
              <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-6 text-xl font-bold text-slate-900">جاري تحميل السيرة الذاتية...</p>
            </div>
          ) : error ? (
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl p-16 text-center shadow-xl">
              <div className="inline-block p-6 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-6 shadow-lg">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-3xl font-black text-red-900 mb-3">حدث خطأ</h3>
              <p className="text-lg font-semibold text-red-700 mb-8">{error}</p>
              <button onClick={fetchResume} className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 shadow-xl hover:shadow-2xl transition-all">
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-xl p-10 border-2 border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-1">
                    {resume ? 'سيرتك الذاتية' : 'إنشاء سيرة ذاتية جديدة'}
                  </h2>
                  <p className="text-slate-600 text-sm">{resume ? 'معلوماتك المهنية الكاملة' : 'أدخل بياناتك لإنشاء سيرة احترافية'}</p>
                </div>
                {resume && !editing && (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>تعديل</span>
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-5">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <label className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      المسمى الوظيفي
                    </label>
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-lg font-medium text-slate-900"
                      placeholder="مثال: مهندس برمجيات"
                    />
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <label className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      سنوات الخبرة
                    </label>
                    <input
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-lg font-medium text-slate-900"
                      placeholder="مثال: 5"
                      min="0"
                    />
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <label className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      المهارات
                    </label>
                    <input
                      type="text"
                      value={formData.skills.join(', ')}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-lg font-medium text-slate-900"
                      placeholder="مثال: JavaScript, React, Node.js"
                    />
                    <p className="text-sm text-slate-600 mt-2 font-medium">افصل المهارات بفاصلة</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <label className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-violet-700 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                      </div>
                      المؤهل الأكاديمي
                    </label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-lg font-medium text-slate-900"
                      placeholder="مثال: بكالوريوس علوم حاسب"
                    />
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <label className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-rose-700 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      الملخص الشخصي
                    </label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white transition-all text-lg font-medium text-slate-900 min-h-[120px]"
                      rows={5}
                      placeholder="اكتب نبذة مختصرة عنك وخبراتك..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button onClick={handleUpdate} className="flex-1 px-8 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-emerald-800 shadow-xl transition-all hover:shadow-2xl">
                      حفظ التغييرات
                    </button>
                    <button onClick={() => setEditing(false)} className="px-8 py-5 bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 rounded-xl font-bold text-lg hover:from-slate-300 hover:to-slate-400 border-2 border-slate-400 transition-all">
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : resume ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">💼</span>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">المسمى الوظيفي</p>
                      </div>
                      <p className="font-bold text-xl text-gray-900">{resume.job_title || 'غير محدد'}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">📊</span>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">سنوات الخبرة</p>
                      </div>
                      <p className="font-bold text-xl text-gray-900">{resume.experience_years || 0} سنة</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">🎓</span>
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">المؤهل الأكاديمي</p>
                      </div>
                      <p className="font-bold text-xl text-gray-900">{resume.education || 'غير محدد'}</p>
                    </div>
                  </div>

                  {resume.skills && resume.skills.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🎯</span>
                        <p className="text-lg font-bold text-gray-900">المهارات</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resume.skills.map((skill, index) => (
                          <span key={index} className="px-5 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-shadow">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {resume.summary && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">📝</span>
                        <p className="text-lg font-bold text-gray-900">الملخص الشخصي</p>
                      </div>
                      <p className="leading-relaxed text-gray-700 text-base">{resume.summary}</p>
                    </div>
                  )}

                  {courses.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">📚</span>
                        <p className="text-lg font-bold text-gray-900">الدورات التدريبية</p>
                      </div>
                      <div className="space-y-3">
                        {courses.map((course) => (
                          <div key={course.id} className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
                            <p className="font-bold text-gray-900 text-lg">{course.course_name}</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">{course.institution}</p>
                            <p className="text-xs text-gray-500 mt-2 font-bold">📅 {new Date(course.completion_date).toLocaleDateString('ar-SA')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-100 rounded-2xl p-16 text-center border-2 border-slate-300">
                  <div className="inline-block p-8 bg-slate-200 rounded-2xl mb-6 border-2 border-slate-400">
                    <svg className="w-24 h-24 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  
                  <h2 className="text-4xl font-black text-slate-900 mb-4">
                    لا توجد سيرة ذاتية
                  </h2>
                  
                  <p className="text-xl text-slate-700 font-bold mb-10 max-w-xl mx-auto">
                    قم بإنشاء سيرتك الذاتية الآن
                  </p>

                  <button 
                    onClick={() => setEditing(true)} 
                    className="inline-flex items-center gap-3 px-14 py-6 bg-slate-800 text-white rounded-xl font-bold text-xl shadow-lg hover:bg-slate-900 transition-all border-2 border-slate-900"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>إنشاء سيرة ذاتية</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


