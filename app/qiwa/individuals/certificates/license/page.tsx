'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { getUserId } from '@/lib/supabase'
import { Certificate } from '@/lib/db/types'

export default function LicensePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = getUserId()
      
      const response = await fetch(`/api/qiwa/certificates?user_id=${userId}`)
      const result = await response.json()

      if (result.success) {
        const licenseCerts = (result.data || []).filter((cert: Certificate) => cert.certificate_type === 'labor_license')
        setCertificates(licenseCerts)
      } else {
        setError(result.error || 'فشل في جلب الشهادات')
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء جلب البيانات')
      console.error('Error fetching certificates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      const userId = getUserId()
      
      const response = await fetch('/api/qiwa/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          certificate_type: 'labor_license' 
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('تم إصدار الترخيص بنجاح!')
        fetchCertificates()
      } else {
        alert(result.error || 'فشل في إصدار الترخيص')
      }
    } catch (err) {
      alert('حدث خطأ أثناء إصدار الترخيص')
      console.error('Error generating license:', err)
    } finally {
      setGenerating(false)
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
          { label: 'ترخيص الاستشارات العمالية' }
        ]} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                🎫
              </div>
              <div>
                <h1 className="text-4xl font-bold">ترخيص الاستشارات العمالية</h1>
                <p className="text-white/80 text-lg mt-2">إصدار ترخيص استشارات عمالية</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#20183b' }}>نبذة عن الخدمة</h2>
            <p className="leading-relaxed mb-6" style={{ color: '#4b515a' }}>
              احصل على ترخيص رسمي لمزاولة أعمال الاستشارات العمالية وتقديم الخدمات الاستشارية في مجال الموارد البشرية.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border-2 rounded-xl p-6" style={{ borderColor: '#e0e0e0' }}>
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="font-bold mb-2" style={{ color: '#20183b' }}>مدة الترخيص</h3>
                <p style={{ color: '#4b515a' }}>سنة واحدة قابلة للتجديد</p>
              </div>
              <div className="border-2 rounded-xl p-6" style={{ borderColor: '#e0e0e0' }}>
                <div className="text-3xl mb-3">✅</div>
                <h3 className="font-bold mb-2" style={{ color: '#20183b' }}>الاعتماد</h3>
                <p style={{ color: '#4b515a' }}>معتمد من الوزارة</p>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="px-10 py-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
                style={{ background: 'linear-gradient(135deg, #20183b 0%, #0a0e14 100%)' }}
              >
                {generating ? 'جاري الإصدار...' : 'طلب الترخيص'}
              </button>
            </div>
          </div>

          {certificates.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-6" style={{ color: '#20183b' }}>التراخيص الصادرة</h3>
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="border-2 rounded-xl p-6" style={{ borderColor: '#e0e0e0' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">تاريخ الإصدار</p>
                        <p className="font-bold" style={{ color: '#20183b' }}>
                          {new Date(cert.issue_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <span className="px-4 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-bold">
                        ساري
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap font-arabic text-sm leading-relaxed" style={{ color: '#4b515a' }}>
                        {cert.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


