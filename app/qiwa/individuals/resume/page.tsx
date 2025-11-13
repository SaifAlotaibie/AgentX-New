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
      
      const response = await fetch('/api/qiwa/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...formData })
      })

      const result = await response.json()

      if (result.success) {
        alert('تم تحديث السيرة الذاتية بنجاح')
        setEditing(false)
        fetchResume()
      } else {
        alert(result.error || 'فشل في تحديث السيرة الذاتية')
      }
    } catch (err) {
      alert('حدث خطأ أثناء التحديث')
      console.error('Error updating resume:', err)
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

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                📝
              </div>
              <div>
                <h1 className="text-4xl font-bold">إدارة السيرة الذاتية</h1>
                <p className="text-white/80 text-lg mt-2">أنشئ وعدّل سيرتك الذاتية الاحترافية</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
              <p className="mt-4 text-lg" style={{ color: '#4b515a' }}>جاري تحميل السيرة الذاتية...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-800 font-bold text-lg">{error}</p>
              <button onClick={fetchResume} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#20183b' }}>
                  {resume ? 'سيرتك الذاتية' : 'إنشاء سيرة ذاتية جديدة'}
                </h2>
                {resume && !editing && (
                  <button onClick={() => setEditing(true)} className="px-6 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700">
                    تعديل
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block font-bold mb-2" style={{ color: '#20183b' }}>المسمى الوظيفي</label>
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="مثال: مهندس برمجيات"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: '#20183b' }}>سنوات الخبرة</label>
                    <input
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: '#20183b' }}>المؤهل الأكاديمي</label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="مثال: بكالوريوس علوم حاسب"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: '#20183b' }}>الملخص الشخصي</label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-orange-500"
                      rows={4}
                      placeholder="اكتب نبذة مختصرة عنك..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <button onClick={handleUpdate} className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700">
                      حفظ التغييرات
                    </button>
                    <button onClick={() => setEditing(false)} className="px-6 py-3 border-2 rounded-xl font-bold hover:bg-gray-50">
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : resume ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">المسمى الوظيفي</p>
                      <p className="font-bold text-lg" style={{ color: '#20183b' }}>{resume.job_title || 'غير محدد'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">سنوات الخبرة</p>
                      <p className="font-bold text-lg" style={{ color: '#20183b' }}>{resume.experience_years || 0} سنة</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">المؤهل الأكاديمي</p>
                      <p className="font-bold text-lg" style={{ color: '#20183b' }}>{resume.education || 'غير محدد'}</p>
                    </div>
                  </div>

                  {resume.summary && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">الملخص الشخصي</p>
                      <p className="leading-relaxed" style={{ color: '#4b515a' }}>{resume.summary}</p>
                    </div>
                  )}

                  {courses.length > 0 && (
                    <div>
                      <h3 className="font-bold text-xl mb-4" style={{ color: '#20183b' }}>الدورات التدريبية</h3>
                      <div className="space-y-3">
                        {courses.map((course) => (
                          <div key={course.id} className="border-2 rounded-lg p-4">
                            <p className="font-bold" style={{ color: '#20183b' }}>{course.course_name}</p>
                            <p className="text-sm" style={{ color: '#4b515a' }}>{course.institution}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(course.completion_date).toLocaleDateString('ar-SA')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-lg mb-6" style={{ color: '#4b515a' }}>لم تقم بإنشاء سيرة ذاتية بعد</p>
                  <button onClick={() => setEditing(true)} className="px-10 py-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #20183b 0%, #0a0e14 100%)' }}>
                    إنشاء سيرة ذاتية
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


