'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { getUserId } from '@/lib/supabase'

interface DomesticRequest {
  id: string
  worker_name: string
  request_type: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function DomesticLaborPage() {
  const [requests, setRequests] = useState<DomesticRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    worker_name: '',
    request_type: ''
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const userId = getUserId()
      
      const response = await fetch(`/api/qiwa/domestic?user_id=${userId}`)
      const result = await response.json()

      if (result.success) {
        setRequests(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.worker_name || !formData.request_type) {
      alert('الرجاء تعبئة جميع الحقول')
      return
    }

    try {
      const userId = getUserId()
      
      const response = await fetch('/api/qiwa/domestic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          worker_name: formData.worker_name,
          request_type: formData.request_type
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('تم إنشاء الطلب بنجاح')
        setShowCreateForm(false)
        setFormData({ worker_name: '', request_type: '' })
        fetchRequests()
      } else {
        alert(result.error || 'فشل في إنشاء الطلب')
      }
    } catch (err) {
      alert('حدث خطأ أثناء إنشاء الطلب')
      console.error('Error creating request:', err)
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
          { label: 'العمالة المنزلية' }
        ]} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                🏠
              </div>
              <div>
                <h1 className="text-4xl font-bold">العمالة المنزلية</h1>
                <p className="text-white/80 text-lg mt-2">خدمات استقدام وإدارة العمالة المنزلية</p>
              </div>
            </div>
          </div>

          {!showCreateForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: '#20183b' }}>إنشاء طلب جديد</h2>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                >
                  طلب جديد
                </button>
              </div>
            </div>
          )}

          {showCreateForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#20183b' }}>طلب جديد</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>اسم العامل/ة *</label>
                  <input
                    type="text"
                    value={formData.worker_name}
                    onChange={(e) => setFormData({ ...formData, worker_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="مثال: محمد أحمد"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>نوع الطلب *</label>
                  <select
                    value={formData.request_type}
                    onChange={(e) => setFormData({ ...formData, request_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="">اختر نوع الطلب</option>
                    <option value="استقدام جديد">استقدام جديد</option>
                    <option value="نقل خدمة">نقل خدمة</option>
                    <option value="تمديد تأشيرة">تمديد تأشيرة</option>
                    <option value="إلغاء عقد">إلغاء عقد</option>
                    <option value="شكوى">شكوى</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleCreate}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                  >
                    إنشاء الطلب
                  </button>
                  <button 
                    onClick={() => setShowCreateForm(false)}
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
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              <p className="mt-4 text-lg" style={{ color: '#4b515a' }}>جاري تحميل الطلبات...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#20183b' }}>لا توجد طلبات</h3>
              <p style={{ color: '#4b515a' }}>لم يتم العثور على أي طلبات عمالة منزلية</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#20183b' }}>{request.worker_name}</h3>
                      <p className="mb-2">{request.request_type}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(request.created_at).toLocaleString('ar-SA')}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      request.status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status === 'approved' ? 'موافق عليه' :
                       request.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
