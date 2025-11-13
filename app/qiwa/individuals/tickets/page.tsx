'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { getUserId } from '@/lib/supabase'

interface Ticket {
  id: string
  ticket_number: number
  title: string
  category: string
  status: 'open' | 'closed'
  created_at: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: ''
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const userId = getUserId()
      
      const response = await fetch(`/api/qiwa/tickets?user_id=${userId}`)
      const result = await response.json()

      if (result.success) {
        setTickets(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.title || !formData.category) {
      alert('الرجاء تعبئة جميع الحقول')
      return
    }

    try {
      const userId = getUserId()
      
      const response = await fetch('/api/qiwa/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: formData.title,
          category: formData.category
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(`تم إنشاء التذكرة رقم ${result.data.ticket_number}`)
        setShowCreateForm(false)
        setFormData({ title: '', category: '' })
        fetchTickets()
      } else {
        alert(result.error || 'فشل في إنشاء التذكرة')
      }
    } catch (err) {
      alert('حدث خطأ أثناء إنشاء التذكرة')
      console.error('Error creating ticket:', err)
    }
  }

  const handleClose = async (ticketId: string) => {
    if (!confirm('هل أنت متأكد من إغلاق هذه التذكرة؟')) return

    try {
      const userId = getUserId()
      
      const response = await fetch('/api/qiwa/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ticket_id: ticketId,
          status: 'closed'
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('تم إغلاق التذكرة بنجاح')
        fetchTickets()
      } else {
        alert(result.error || 'فشل في إغلاق التذكرة')
      }
    } catch (err) {
      alert('حدث خطأ أثناء إغلاق التذكرة')
      console.error('Error closing ticket:', err)
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
          { label: 'التذاكر' }
        ]} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                🎫
              </div>
              <div>
                <h1 className="text-4xl font-bold">إدارة التذاكر</h1>
                <p className="text-white/80 text-lg mt-2">فتح ومتابعة تذاكر الدعم</p>
              </div>
            </div>
          </div>

          {!showCreateForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: '#20183b' }}>إنشاء تذكرة جديدة</h2>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                >
                  فتح تذكرة
                </button>
              </div>
            </div>
          )}

          {showCreateForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#20183b' }}>فتح تذكرة جديدة</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>العنوان *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="مثال: مشكلة في عرض العقد"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>الفئة *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-purple-500"
                  >
                    <option value="">اختر الفئة</option>
                    <option value="عقود">عقود</option>
                    <option value="شهادات">شهادات</option>
                    <option value="مواعيد">مواعيد</option>
                    <option value="سيرة ذاتية">سيرة ذاتية</option>
                    <option value="عمالة منزلية">عمالة منزلية</option>
                    <option value="دعم فني">دعم فني</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleCreate}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                  >
                    إنشاء التذكرة
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
              <p className="mt-4 text-lg" style={{ color: '#4b515a' }}>جاري تحميل التذاكر...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#20183b' }}>لا توجد تذاكر</h3>
              <p style={{ color: '#4b515a' }}>لم يتم العثور على أي تذاكر. قم بفتح تذكرة جديدة!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold" style={{ color: '#20183b' }}>#{ticket.ticket_number}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {ticket.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                        </span>
                      </div>
                      <p className="text-lg mb-2">{ticket.title}</p>
                      <p className="text-sm text-gray-500">الفئة: {ticket.category}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(ticket.created_at).toLocaleString('ar-SA')}
                      </p>
                    </div>
                  </div>

                  {ticket.status === 'open' && (
                    <button
                      onClick={() => handleClose(ticket.id)}
                      className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                    >
                      إغلاق التذكرة
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

