'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { getUserId } from '@/lib/supabase'
import { EmploymentContract } from '@/lib/db/types'

export default function ContractsPage() {
  const [contracts, setContracts] = useState<EmploymentContract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContracts()
  }, [])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = getUserId()
      
      const response = await fetch(`/api/qiwa/contracts?user_id=${userId}`)
      const result = await response.json()

      if (result.success) {
        setContracts(result.data || [])
      } else {
        setError(result.error || 'فشل في جلب العقود')
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء جلب البيانات')
      console.error('Error fetching contracts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEndContract = async (contractId: string) => {
    if (!confirm('هل أنت متأكد من إنهاء هذا العقد؟')) return

    try {
      const response = await fetch('/api/qiwa/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', contract_id: contractId })
      })

      const result = await response.json()

      if (result.success) {
        alert('تم إنهاء العقد بنجاح')
        fetchContracts()
      } else {
        alert(result.error || 'فشل في إنهاء العقد')
      }
    } catch (err) {
      alert('حدث خطأ أثناء إنهاء العقد')
      console.error('Error ending contract:', err)
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
          { label: 'العقود الوظيفية' }
        ]} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                📄
              </div>
              <div>
                <h1 className="text-4xl font-bold">العقود الوظيفية</h1>
                <p className="text-white/80 text-lg mt-2">عرض وإدارة عقود العمل الخاصة بك</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-lg" style={{ color: '#4b515a' }}>جاري تحميل العقود...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-800 font-bold text-lg">{error}</p>
              <button onClick={fetchContracts} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                إعادة المحاولة
              </button>
            </div>
          ) : contracts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#20183b' }}>لا توجد عقود</h3>
              <p style={{ color: '#4b515a' }}>لم يتم العثور على أي عقود وظيفية مسجلة</p>
            </div>
          ) : (
            <div className="space-y-6">
              {contracts.map((contract) => (
                <div key={contract.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#20183b' }}>{contract.position}</h3>
                      <p className="text-lg mb-1" style={{ color: '#4b515a' }}>{contract.employer_name}</p>
                      <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${
                        contract.status === 'active' ? 'bg-green-100 text-green-800' :
                        contract.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {contract.status === 'active' ? 'نشط' : contract.status === 'ended' ? 'منتهي' : 'معلق'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💰</span>
                      <div>
                        <p className="text-xs text-gray-500">الراتب</p>
                        <p className="font-bold" style={{ color: '#20183b' }}>{contract.salary.toLocaleString()} ريال</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-xs text-gray-500">تاريخ البدء</p>
                        <p className="font-bold" style={{ color: '#20183b' }}>{new Date(contract.start_date).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📋</span>
                      <div>
                        <p className="text-xs text-gray-500">نوع العقد</p>
                        <p className="font-bold" style={{ color: '#20183b' }}>{contract.contract_type}</p>
                      </div>
                    </div>
                    {contract.end_date && (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📆</span>
                        <div>
                          <p className="text-xs text-gray-500">تاريخ الانتهاء</p>
                          <p className="font-bold" style={{ color: '#20183b' }}>{new Date(contract.end_date).toLocaleDateString('ar-SA')}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {contract.status === 'active' && (
                    <button
                      onClick={() => handleEndContract(contract.id)}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                      إنهاء العقد
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


