'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { getUserId } from '@/lib/supabase'
import { ResumeCourse } from '@/lib/db/types'

export default function CoursesPage() {
  const [courses, setCourses] = useState<ResumeCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    course_name: '',
    provider: '',
    date_completed: '',
    certificate_url: ''
  })

  useEffect(() => {
    fetchResumeAndCourses()
  }, [])

  const fetchResumeAndCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = getUserId()

      const response = await fetch(`/api/qiwa/resume?user_id=${userId}`)
      const result = await response.json()

      if (result.success) {
        const resume = result.data?.resume
        if (resume) {
          setResumeId(resume.id)
          setCourses(result.data?.courses || [])
        } else {
          setError('لا توجد سيرة ذاتية. يجب إنشاء سيرة ذاتية أولاً')
        }
      } else {
        setError(result.error || 'فشل في جلب البيانات')
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء جلب البيانات')
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async () => {
    if (!resumeId) {
      alert('يجب إنشاء سيرة ذاتية أولاً')
      return
    }

    if (!formData.course_name || !formData.provider || !formData.date_completed) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة')
      return
    }

    try {
      const response = await fetch('/api/qiwa/resume/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_id: resumeId, ...formData })
      })

      const result = await response.json()

      if (result.success) {
        alert('تمت إضافة الدورة بنجاح!')
        setShowAddForm(false)
        setFormData({ course_name: '', provider: '', date_completed: '', certificate_url: '' })
        fetchResumeAndCourses()
      } else {
        alert(result.error || 'فشل في إضافة الدورة')
      }
    } catch (err) {
      alert('حدث خطأ أثناء إضافة الدورة')
      console.error('Error adding course:', err)
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدورة؟')) return

    try {
      const response = await fetch(`/api/qiwa/resume/courses?course_id=${courseId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        alert('تم حذف الدورة بنجاح')
        fetchResumeAndCourses()
      } else {
        alert(result.error || 'فشل في حذف الدورة')
      }
    } catch (err) {
      alert('حدث خطأ أثناء حذف الدورة')
      console.error('Error deleting course:', err)
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
          { label: 'إدارة الدورات التدريبية' }
        ]} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                📚
              </div>
              <div>
                <h1 className="text-4xl font-bold">إدارة الدورات التدريبية</h1>
                <p className="text-white/80 text-lg mt-2">أضف دوراتك وشهاداتك للسيرة الذاتية</p>
              </div>
            </div>
          </div>

          {resumeId && !showAddForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: '#20183b' }}>إضافة دورة جديدة</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700"
                >
                  أضف دورة
                </button>
              </div>
            </div>
          )}

          {showAddForm && resumeId && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#20183b' }}>إضافة دورة جديدة</h2>

              <div className="space-y-6">
                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>اسم الدورة *</label>
                  <input
                    type="text"
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-yellow-500"
                    placeholder="مثال: دورة البرمجة المتقدمة"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>الجهة المانحة *</label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-yellow-500"
                    placeholder="مثال: جامعة الملك سعود"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>تاريخ الإكمال *</label>
                  <input
                    type="date"
                    value={formData.date_completed}
                    onChange={(e) => setFormData({ ...formData, date_completed: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-yellow-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>رابط الشهادة (اختياري)</label>
                  <input
                    type="url"
                    value={formData.certificate_url}
                    onChange={(e) => setFormData({ ...formData, certificate_url: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-yellow-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddCourse}
                    className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700"
                  >
                    إضافة
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 border-2 rounded-xl font-bold hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
              <p className="mt-4 text-lg" style={{ color: '#4b515a' }}>جاري تحميل الدورات...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-800 font-bold text-lg">{error}</p>
              {!resumeId && (
                <Link href="/qiwa/individuals/resume" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">
                  إنشاء سيرة ذاتية
                </Link>
              )}
            </div>
          ) : courses.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-6" style={{ color: '#20183b' }}>دوراتك التدريبية</h3>
              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="border-2 rounded-xl p-6" style={{ borderColor: '#e0e0e0' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1" style={{ color: '#20183b' }}>{course.course_name}</h4>
                        <p className="text-sm" style={{ color: '#4b515a' }}>{course.provider}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(course.date_completed).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        حذف
                      </button>
                    </div>
                    {course.certificate_url && (
                      <a
                        href={course.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        عرض الشهادة 🔗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : resumeId ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#20183b' }}>لا توجد دورات</h3>
              <p style={{ color: '#4b515a' }}>ابدأ بإضافة دوراتك التدريبية</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}


