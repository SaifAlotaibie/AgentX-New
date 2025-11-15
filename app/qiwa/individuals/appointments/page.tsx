'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/qiwa/Breadcrumb'
import { getUserId } from '@/lib/supabase'
import { LaborAppointment } from '@/lib/db/types'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<LaborAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [formData, setFormData] = useState({
    appointment_type: '',
    appointment_date: '',
    notes: ''
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      const userId = getUserId()
      
      const response = await fetch(`/api/qiwa/appointments?user_id=${userId}`)
      const result = await response.json()

      if (result.success) {
        setAppointments(result.data || [])
      } else {
        setError(result.error || 'فشل في جلب المواعيد')
      }
    } catch (err: any) {
      setError('حدث خطأ أثناء جلب البيانات')
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async () => {
    if (!formData.appointment_type || !formData.appointment_date) {
      alert('الرجاء تعبئة جميع الحقول المطلوبة')
      return
    }

    try {
      const userId = getUserId()
      
      const response = await fetch('/api/qiwa/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          ...formData 
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('تم حجز الموعد بنجاح!')
        setShowBookingForm(false)
        setFormData({ appointment_type: '', appointment_date: '', notes: '' })
        fetchAppointments()
      } else {
        alert(result.error || 'فشل في حجز الموعد')
      }
    } catch (err) {
      alert('حدث خطأ أثناء حجز الموعد')
      console.error('Error booking appointment:', err)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return

    try {
      const response = await fetch('/api/qiwa/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', appointment_id: appointmentId })
      })

      const result = await response.json()

      if (result.success) {
        alert('تم إلغاء الموعد بنجاح')
        fetchAppointments()
      } else {
        alert(result.error || 'فشل في إلغاء الموعد')
      }
    } catch (err) {
      alert('حدث خطأ أثناء إلغاء الموعد')
      console.error('Error cancelling appointment:', err)
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
          { label: 'مواعيد مكتب العمل' }
        ]} />

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-3xl p-12 mb-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-5xl backdrop-blur-sm">
                📅
              </div>
              <div>
                <h1 className="text-4xl font-bold">مواعيد مكتب العمل</h1>
                <p className="text-white/80 text-lg mt-2">احجز موعد في مكتب العمل</p>
              </div>
            </div>
          </div>

          {!showBookingForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#20183b' }}>حجز موعد جديد</h2>
                <button 
                  onClick={() => setShowBookingForm(true)}
                  className="px-6 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700"
                >
                  احجز موعد
                </button>
              </div>
            </div>
          )}

          {showBookingForm && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#20183b' }}>حجز موعد جديد</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>نوع الخدمة *</label>
                  <select
                    value={formData.appointment_type}
                    onChange={(e) => setFormData({ ...formData, appointment_type: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-pink-500"
                  >
                    <option value="">اختر نوع الخدمة</option>
                    <option value="تصديق مستندات">تصديق مستندات</option>
                    <option value="استشارة عمالية">استشارة عمالية</option>
                    <option value="تجديد رخصة">تجديد رخصة</option>
                    <option value="شكوى عمالية">شكوى عمالية</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>التاريخ والوقت *</label>
                  <input
                    type="datetime-local"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2" style={{ color: '#20183b' }}>ملاحظات إضافية</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-pink-500"
                    rows={3}
                    placeholder="اكتب أي ملاحظات إضافية..."
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleBook}
                    className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700"
                  >
                    تأكيد الحجز
                  </button>
                  <button 
                    onClick={() => setShowBookingForm(false)}
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
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
              <p className="mt-4 text-lg" style={{ color: '#4b515a' }}>جاري تحميل المواعيد...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold mb-6" style={{ color: '#20183b' }}>مواعيدك المحجوزة</h3>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="border-2 rounded-xl p-6" style={{ borderColor: '#e0e0e0' }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-lg mb-1" style={{ color: '#20183b' }}>{appointment.appointment_type}</h4>
                        <p className="text-sm text-gray-500">
                          {appointment.date} - {appointment.time}
                        </p>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-sm font-bold ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status === 'scheduled' ? 'محجوز' : 
                         appointment.status === 'completed' ? 'مكتمل' : 'ملغي'}
                      </span>
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-sm mb-4" style={{ color: '#4b515a' }}>{appointment.notes}</p>
                    )}

                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        className="w-full px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                      >
                        إلغاء الموعد
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}


