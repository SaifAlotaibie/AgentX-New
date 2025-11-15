'use client'

import { useState, useEffect } from 'react'
import QiwaIcon from '@/components/qiwa/QiwaIcon'

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        setLoading(false)
        return
      }

      const response = await fetch(`/api/qiwa/user-data?user_id=${userId}`)
      const result = await response.json()

      if (result.success && result.data) {
        setUserData({
          name: result.data.user.name,
          employeeNumber: result.data.user.employeeNumber,
          nationality: result.data.user.nationality,
          birthDate: result.data.user.birthDate,
          gender: result.data.user.gender,
          phone: result.data.user.phone,
          email: result.data.user.email,
          address: result.data.user.address,
          job: result.data.user.job,
          verified: result.data.user.verified,
          currentCompany: result.data.contract?.company || '-',
          currentStatus: result.data.contract?.status || '-'
        })
      } else {
        console.error('Failed to fetch user data:', result.error)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="qiwa-page-content flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--qiwa-primary)' }}></div>
          <p style={{ color: 'var(--qiwa-text-secondary)' }}>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="qiwa-page-content">
      <div className="qiwa-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
            معلوماتي
          </h1>
          <p className="text-base" style={{ color: 'var(--qiwa-text-secondary)' }}>
            معلوماتك الشخصية والوظيفية
          </p>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-6 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <div className="flex items-center gap-6">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--qiwa-blue) 0%, var(--qiwa-primary) 100%)' }}
            >
              س
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {userData?.name}
                </h2>
                {userData?.verified && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    موثق
                  </span>
                )}
              </div>
              <p className="text-base" style={{ color: 'var(--qiwa-text-secondary)' }}>
                {userData?.job}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-6 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>
              المعلومات الشخصية
            </h3>
            {userData?.verified && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                موثق
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light)' }}>
                <QiwaIcon name="badge" className="w-5 h-5" style={{ color: 'var(--qiwa-primary)' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>رقم الموظف</p>
                <p className="text-base font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {userData?.employeeNumber}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light)' }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--qiwa-primary)' }}>
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>الجنسية</p>
                <p className="text-base font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {userData?.nationality}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light)' }}>
                <QiwaIcon name="calendar" className="w-5 h-5" style={{ color: 'var(--qiwa-primary)' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>تاريخ الميلاد</p>
                <p className="text-base font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {userData?.birthDate}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light)' }}>
                <QiwaIcon name="user" className="w-5 h-5" style={{ color: 'var(--qiwa-primary)' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>الجنس</p>
                <p className="text-base font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {userData?.gender}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-6 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>
              معلومات التواصل
            </h3>
            {userData?.verified && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                موثق
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light)' }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--qiwa-primary)' }}>
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>رقم الجوال</p>
                <p className="text-base font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {userData?.phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light)' }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--qiwa-primary)' }}>
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>البريد الإلكتروني</p>
                <p className="text-base font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {userData?.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light)' }}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--qiwa-primary)' }}>
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>العنوان</p>
                <p className="text-base font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {userData?.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Information */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--qiwa-primary)' }}>
            المعلومات الوظيفية
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light)' }}>
                <QiwaIcon name="briefcase" className="w-5 h-5" style={{ color: 'var(--qiwa-primary)' }} />
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>المهنة</p>
                <p className="text-base font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {userData?.job}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--qiwa-border-light)' }}>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--qiwa-text-primary)' }}>
                الحالات الوظيفية
              </p>
              <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <QiwaIcon name="briefcase" className="w-5 h-5" style={{ color: 'var(--qiwa-primary)' }} />
                  <span className="font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                    {userData?.currentCompany}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  {userData?.currentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
