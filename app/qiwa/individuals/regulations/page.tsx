'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { WorkRegulation } from '@/lib/db/types'

export default function RegulationsPage() {
  const [regulations, setRegulations] = useState<WorkRegulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegulation, setSelectedRegulation] = useState<WorkRegulation | null>(null)

  useEffect(() => {
    fetchRegulations()
  }, [])

  const fetchRegulations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/qiwa/regulations')
      const result = await response.json()

      if (result.success) {
        setRegulations(result.data || [])
      } else {
        setError(result.error || 'فشل في جلب اللوائح')
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء جلب البيانات')
      console.error('Error fetching regulations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchRegulations()
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/qiwa/regulations?search=${encodeURIComponent(searchTerm)}`)
      const result = await response.json()

      if (result.success) {
        setRegulations(result.data || [])
      } else {
        setError(result.error || 'فشل في البحث')
      }
    } catch (err) {
      setError('حدث خطأ أثناء البحث')
      console.error('Error searching regulations:', err)
    } finally {
      setLoading(false)
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
          { label: 'لائحة تنظيم العمل' }
        ]} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                ⚖️
              </div>
              <div>
                <h1 className="text-4xl font-bold">لائحة تنظيم العمل</h1>
                <p className="text-white/80 text-lg mt-2">الاطلاع على لوائح وأنظمة العمل السعودي</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث في اللوائح..."
                className="flex-1 px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleSearch}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
              >
                بحث
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-lg" style={{ color: '#4b515a' }}>جاري تحميل اللوائح...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-800 font-bold text-lg">{error}</p>
              <button onClick={fetchRegulations} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                إعادة المحاولة
              </button>
            </div>
          ) : regulations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#20183b' }}>لا توجد نتائج</h3>
              <p style={{ color: '#4b515a' }}>لم يتم العثور على لوائح تطابق بحثك</p>
            </div>
          ) : (
            <div className="space-y-4">
              {regulations.map((regulation) => (
                <div key={regulation.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setSelectedRegulation(regulation)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#20183b' }}>{regulation.title}</h3>
                      <p className="text-sm mb-3" style={{ color: '#4b515a' }}>{regulation.description}</p>
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
                        {regulation.category}
                      </span>
                    </div>
                    <span className="text-2xl">📄</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedRegulation && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50" onClick={() => setSelectedRegulation(null)}>
              <div className="bg-white rounded-2xl p-8 max-w-3xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold" style={{ color: '#20183b' }}>{selectedRegulation.title}</h2>
                  <button onClick={() => setSelectedRegulation(null)} className="text-3xl text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#4b515a' }}>
                    {selectedRegulation.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


