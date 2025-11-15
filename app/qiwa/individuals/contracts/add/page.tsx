'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { getUserId } from '@/lib/supabase'

export default function AddContractPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    employer_name: '',
    position: '',
    salary: '',
    start_date: '',
    end_date: '',
    contract_type: 'full_time',
    status: 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.employer_name || !formData.position || !formData.salary || !formData.start_date) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة')
      return
    }

    try {
      setLoading(true)
      const userId = getUserId()
      
      const response = await fetch('/api/qiwa/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          user_id: userId,
          ...formData,
          salary: parseFloat(formData.salary)
        })
      })

      const result = await response.json()

      console.log('📤 Response:', result)

      if (result.success) {
        alert('✅ تم إضافة العقد بنجاح!')
        router.push('/qiwa/individuals/contracts')
      } else {
        console.error('❌ API Error:', result)
        alert('❌ فشل في إضافة العقد:\n' + (result.error || 'خطأ غير معروف'))
      }
    } catch (err) {
      console.error('❌ Network Error:', err)
      alert('❌ حدث خطأ في الاتصال بالخادم')
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
              <img src="/qiwalogofor-afrad.png" alt="قوى" className="h-10 w-auto object-contain" />
            </Link>
            <Link href="/qiwa/individuals/contracts" className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100" style={{ color: '#4b515a' }}>
              العودة للعقود
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <Breadcrumb items={[
          { label: 'قوى', href: '/qiwa' },
          { label: 'خدمات الأفراد', href: '/qiwa/individuals' },
          { label: 'العقود الوظيفية', href: '/qiwa/individuals/contracts' },
          { label: 'إضافة عقد' }
        ]} />

        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl p-10 mb-8 shadow-xl relative overflow-hidden">
            {/* Decorative Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)'
              }}></div>
            </div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">إضافة عقد جديد</h1>
                <p className="text-slate-300 text-base mt-1">أدخل بيانات العقد الوظيفي</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-xl p-8 space-y-5 border-2 border-slate-200">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <label className="block text-base font-bold mb-3 text-slate-900">
                اسم جهة العمل <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.employer_name}
                onChange={(e) => setFormData({ ...formData, employer_name: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-lg font-medium text-slate-900"
                placeholder="مثال: شركة قوى للتقنية"
                required
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <label className="block text-base font-bold mb-3 text-slate-900">
                المسمى الوظيفي <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-lg font-medium text-slate-900"
                placeholder="مثال: مهندس برمجيات"
                required
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <label className="block text-base font-bold mb-3 text-slate-900">
                الراتب الشهري (ريال) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-lg font-medium text-slate-900"
                placeholder="مثال: 15000"
                required
                min="0"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <label className="block text-base font-bold mb-3 text-slate-900">
                  تاريخ البدء <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-lg font-medium text-slate-900"
                  required
                />
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <label className="block text-base font-bold mb-3 text-slate-900">
                  تاريخ الانتهاء (اختياري)
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-lg font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <label className="block text-base font-bold mb-3 text-slate-900">
                نوع العقد
              </label>
              <select
                value={formData.contract_type}
                onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-lg font-medium text-slate-900"
              >
                <option value="full_time">دوام كامل</option>
                <option value="part_time">دوام جزئي</option>
                <option value="temporary">مؤقت</option>
                <option value="contract">عقد محدد المدة</option>
              </select>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <label className="block text-base font-bold mb-3 text-slate-900">
                حالة العقد
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:bg-white focus:outline-none transition-all text-lg font-medium text-slate-900"
              >
                <option value="active">نشط</option>
                <option value="pending">معلق</option>
                <option value="ended">منتهي</option>
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-8 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ العقد'}
              </button>
              <Link
                href="/qiwa/individuals/contracts"
                className="px-8 py-5 bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 rounded-xl font-bold text-lg hover:from-slate-300 hover:to-slate-400 transition-all text-center border-2 border-slate-400"
              >
                إلغاء
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

