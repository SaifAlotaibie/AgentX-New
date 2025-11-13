'use client'

import { useState, useEffect } from 'react'
import QiwaSidebar from '@/components/qiwa/QiwaSidebar'
import { getUserId } from '@/lib/supabase'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    national_id: '',
    job_title: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const userId = getUserId()
      
      // Simulated fetch - replace with actual API call
      const mockProfile = {
        full_name: 'سيف العتيبي',
        phone: '+966501234567',
        national_id: '1234567890',
        job_title: 'مهندس برمجيات',
        created_at: new Date().toISOString()
      }
      
      setProfile(mockProfile)
      setFormData(mockProfile)
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Simulated save
      alert('تم حفظ المعلومات بنجاح!')
      setProfile(formData)
      setEditing(false)
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ')
      console.error('Error saving profile:', err)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--qiwa-bg-soft)' }}>
      <QiwaSidebar />

      <main className="qiwa-main-content">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
            معلوماتي الشخصية
          </h1>
          <p style={{ color: 'var(--qiwa-text-secondary)' }}>
            عرض وتعديل معلوماتك الشخصية على منصة قوى
          </p>
        </div>

        {loading ? (
          <div className="qiwa-card text-center py-12">
            <div className="qiwa-spinner mx-auto mb-4"></div>
            <p style={{ color: 'var(--qiwa-text-secondary)' }}>جاري تحميل المعلومات...</p>
          </div>
        ) : (
          <div className="max-w-4xl">
            {/* Profile Card */}
            <div className="qiwa-card mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold"
                    style={{ backgroundColor: 'var(--qiwa-blue)' }}
                  >
                    س
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>
                      {profile?.full_name}
                    </h2>
                    <p style={{ color: 'var(--qiwa-text-secondary)' }}>
                      {profile?.job_title}
                    </p>
                  </div>
                </div>

                {!editing && (
                  <button 
                    onClick={() => setEditing(true)}
                    className="qiwa-btn-primary"
                  >
                    تعديل المعلومات
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-6">
                  <div>
                    <label className="block font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="qiwa-input"
                      placeholder="مثال: سيف العتيبي"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
                      رقم الجوال *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="qiwa-input"
                      placeholder="مثال: +966501234567"
                      dir="ltr"
                      style={{ textAlign: 'right' }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
                      رقم الهوية الوطنية *
                    </label>
                    <input
                      type="text"
                      value={formData.national_id}
                      onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                      className="qiwa-input"
                      placeholder="مثال: 1234567890"
                      dir="ltr"
                      style={{ textAlign: 'right' }}
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
                      المسمى الوظيفي
                    </label>
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="qiwa-input"
                      placeholder="مثال: مهندس برمجيات"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={handleSave}
                      className="qiwa-btn-primary flex-1"
                    >
                      حفظ التغييرات
                    </button>
                    <button 
                      onClick={() => {
                        setEditing(false)
                        setFormData(profile)
                      }}
                      className="qiwa-btn-secondary"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--qiwa-light-blue-1)' }}>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>
                      الاسم الكامل
                    </p>
                    <p className="text-lg font-bold" style={{ color: 'var(--qiwa-primary)' }}>
                      {profile?.full_name}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--qiwa-light-blue-1)' }}>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>
                      رقم الجوال
                    </p>
                    <p className="text-lg font-bold" style={{ color: 'var(--qiwa-primary)' }} dir="ltr">
                      {profile?.phone}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--qiwa-light-blue-1)' }}>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>
                      رقم الهوية الوطنية
                    </p>
                    <p className="text-lg font-bold" style={{ color: 'var(--qiwa-primary)' }} dir="ltr">
                      {profile?.national_id}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--qiwa-light-blue-1)' }}>
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>
                      المسمى الوظيفي
                    </p>
                    <p className="text-lg font-bold" style={{ color: 'var(--qiwa-primary)' }}>
                      {profile?.job_title}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Card */}
            <div className="qiwa-card mb-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--qiwa-primary)' }}>
                الأمان والخصوصية
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 qiwa-transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--qiwa-primary)' }}>تغيير كلمة المرور</p>
                      <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>آخر تحديث: منذ 3 أشهر</p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--qiwa-blue)' }}>←</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 qiwa-transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--qiwa-primary)' }}>التحقق بخطوتين</p>
                      <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>حماية إضافية لحسابك</p>
                    </div>
                  </div>
                  <span className="qiwa-badge qiwa-badge-success">مفعّل</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 qiwa-transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔔</span>
                    <div>
                      <p className="font-bold" style={{ color: 'var(--qiwa-primary)' }}>إشعارات الحساب</p>
                      <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>إدارة الإشعارات والتنبيهات</p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--qiwa-blue)' }}>←</span>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="qiwa-card">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--qiwa-primary)' }}>
                إحصائيات الحساب
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--qiwa-light-blue-1)' }}>
                  <p className="text-3xl font-bold mb-1" style={{ color: 'var(--qiwa-blue)' }}>1</p>
                  <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>عقود نشطة</p>
                </div>

                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--qiwa-success-bg)' }}>
                  <p className="text-3xl font-bold mb-1" style={{ color: '#1B8354' }}>3</p>
                  <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>شهادات صادرة</p>
                </div>

                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FFF9E6' }}>
                  <p className="text-3xl font-bold mb-1" style={{ color: '#D97706' }}>0</p>
                  <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>تذاكر مفتوحة</p>
                </div>

                <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FFE6F0' }}>
                  <p className="text-3xl font-bold mb-1" style={{ color: '#DC2626' }}>0</p>
                  <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>مواعيد قادمة</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

