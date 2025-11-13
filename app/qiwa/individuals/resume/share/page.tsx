'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { getUserId } from '@/lib/supabase'
import { Resume, ResumeCourse } from '@/lib/db/types'

export default function ShareResumePage() {
  const [resume, setResume] = useState<Resume | null>(null)
  const [courses, setCourses] = useState<ResumeCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [shareLink, setShareLink] = useState('')
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    fetchResume()
  }, [])

  const fetchResume = async () => {
    try {
      setLoading(true)
      const userId = getUserId()
      
      const response = await fetch(`/api/qiwa/resume?user_id=${userId}`)
      const result = await response.json()

      if (result.success) {
        setResume(result.data?.resume || null)
        setCourses(result.data?.courses || [])
        
        // Generate share link
        const baseUrl = window.location.origin
        setShareLink(`${baseUrl}/qiwa/resume/view/${userId}`)
      }
    } catch (err) {
      console.error('Error fetching resume:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 3000)
  }

  const handleDownloadPDF = async () => {
    if (!resume) {
      alert('لا توجد سيرة ذاتية لتحميلها')
      return
    }

    // Generate PDF content
    const pdfContent = generatePDFContent(resume, courses)
    
    // Create a simple text file for now (can be enhanced with PDF library later)
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `السيرة_الذاتية_${resume.user_id.slice(0, 8)}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generatePDFContent = (resume: Resume, courses: ResumeCourse[]): string => {
    return `
═══════════════════════════════════
          السيرة الذاتية
═══════════════════════════════════

المسمى الوظيفي: ${resume.job_title || 'غير محدد'}

سنوات الخبرة: ${resume.experience_years || 0} سنة

المؤهل الأكاديمي: ${resume.education || 'غير متوفر'}

الملخص الشخصي:
${resume.summary || 'غير متوفر'}

المهارات:
${resume.skills && resume.skills.length > 0 ? resume.skills.map(s => `• ${s}`).join('\n') : '• لا توجد مهارات مسجلة'}

${courses.length > 0 ? `
الدورات التدريبية:
${courses.map(c => `
• ${c.course_name}
  الجهة المانحة: ${c.institution}
  تاريخ الإنجاز: ${new Date(c.completion_date).toLocaleDateString('ar-SA')}
`).join('\n')}
` : ''}

═══════════════════════════════════
تم الإنشاء عبر منصة قوى - qiwa.sa
وزارة الموارد البشرية والتنمية الاجتماعية
═══════════════════════════════════
    `.trim()
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
          { label: 'مشاركة السيرة الذاتية' }
        ]} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                🔗
              </div>
              <div>
                <h1 className="text-4xl font-bold">مشاركة السيرة الذاتية</h1>
                <p className="text-white/80 text-lg mt-2">شارك سيرتك مع أصحاب العمل</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
              <p className="mt-4 text-lg" style={{ color: '#4b515a' }}>جاري تحميل السيرة الذاتية...</p>
            </div>
          ) : !resume ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#20183b' }}>لا توجد سيرة ذاتية</h3>
              <p className="mb-6" style={{ color: '#4b515a' }}>يجب إنشاء سيرة ذاتية أولاً قبل المشاركة</p>
              <Link href="/qiwa/individuals/resume">
                <button className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700">
                  إنشاء سيرة ذاتية
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Download Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">📥</span>
                  <h2 className="text-2xl font-bold" style={{ color: '#20183b' }}>تحميل السيرة الذاتية</h2>
                </div>
                
                <p className="mb-6" style={{ color: '#4b515a' }}>
                  احصل على نسخة من سيرتك الذاتية بصيغة نصية للمراجعة أو الطباعة
                </p>

                <button
                  onClick={handleDownloadPDF}
                  className="w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-bold text-lg hover:from-amber-700 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all"
                >
                  تحميل السيرة الذاتية 📄
                </button>
              </div>

              {/* Share Link Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🔗</span>
                  <h2 className="text-2xl font-bold" style={{ color: '#20183b' }}>رابط المشاركة</h2>
                </div>
                
                <p className="mb-6" style={{ color: '#4b515a' }}>
                  شارك هذا الرابط مع أصحاب العمل لعرض سيرتك الذاتية
                </p>

                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 rounded-lg bg-gray-50"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-8 py-3 rounded-lg font-bold transition-all ${
                      copySuccess
                        ? 'bg-green-600 text-white'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    {copySuccess ? 'تم النسخ ✓' : 'نسخ الرابط'}
                  </button>
                </div>

                {copySuccess && (
                  <p className="text-green-600 font-bold text-center">تم نسخ الرابط بنجاح!</p>
                )}
              </div>

              {/* Preview Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">👁️</span>
                  <h2 className="text-2xl font-bold" style={{ color: '#20183b' }}>معاينة السيرة الذاتية</h2>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">المسمى الوظيفي</p>
                    <p className="font-bold text-lg" style={{ color: '#20183b' }}>{resume.job_title || 'غير محدد'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">سنوات الخبرة</p>
                    <p className="font-bold text-lg" style={{ color: '#20183b' }}>{resume.experience_years || 0} سنة</p>
                  </div>

                  {resume.summary && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الملخص الشخصي</p>
                      <p className="leading-relaxed" style={{ color: '#4b515a' }}>{resume.summary}</p>
                    </div>
                  )}

                  {resume.skills && resume.skills.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">المهارات</p>
                      <div className="flex flex-wrap gap-2">
                        {resume.skills.map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {courses.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-3">الدورات التدريبية ({courses.length})</p>
                      <div className="space-y-2">
                        {courses.slice(0, 3).map((course) => (
                          <div key={course.id} className="bg-white p-3 rounded-lg border">
                            <p className="font-bold" style={{ color: '#20183b' }}>{course.course_name}</p>
                            <p className="text-sm text-gray-600">{course.institution}</p>
                          </div>
                        ))}
                        {courses.length > 3 && (
                          <p className="text-sm text-gray-500 text-center">وأكثر...</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
