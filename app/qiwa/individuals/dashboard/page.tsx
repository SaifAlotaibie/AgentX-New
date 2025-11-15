'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import QiwaIcon from '@/components/qiwa/QiwaIcon'

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [contractData, setContractData] = useState<any>(null)
  const [resumeData, setResumeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) {
        setError('الرجاء تسجيل الدخول أولاً')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/qiwa/user-data?user_id=${userId}`)
      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'حدث خطأ أثناء جلب البيانات')
        setLoading(false)
        return
      }

      setUserData(result.data.user)
      setContractData(result.data.contract)
      setResumeData(result.data.resume)
      setLoading(false)
    } catch (error: any) {
      console.error('Error fetching user data:', error)
      setError('حدث خطأ أثناء الاتصال بالخادم')
      setLoading(false)
    }
  }

  // تحديد التحية حسب الوقت
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 18) return 'مساء الخير'
    return 'مساء الخير'
  }

  const quickActions = [
    {
      title: 'العقود الوظيفية',
      description: 'قم بإدارة أو إنهاء العقود الخاصة بك.',
      icon: 'document',
      href: '/qiwa/individuals/contracts',
      color: '#0A74A6'
    },
    {
      title: 'شهادة التعريف بالراتب',
      description: 'قم بإثبات وظيفتك الحالية وراتبك.',
      icon: 'badge',
      href: '/qiwa/individuals/certificates/salary',
      color: '#0D9488'
    },
    {
      title: 'شهادة الخدمة',
      description: 'قم بإثبات خبرتك المهنية السابقة.',
      icon: 'badge',
      href: '/qiwa/individuals/certificates/service',
      color: '#7C3AED'
    }
  ]

  const knowledgeCenter = [
    {
      title: 'الحصول على وظيفة',
      icon: 'search',
      color: '#0A74A6'
    },
    {
      title: 'إدارة وظيفتك الحالية',
      icon: 'briefcase',
      color: '#0D9488'
    },
    {
      title: 'إدارة نقل العمالة المنزلية',
      icon: 'home',
      color: '#7C3AED'
    }
  ]

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

  if (error) {
    return (
      <div className="qiwa-page-content">
        <div className="qiwa-container">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700 font-semibold mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="qiwa-page-content">
      <div className="qiwa-container">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
            {getGreeting()}، {userData?.name?.split(' ')[0] || 'ضيف'}! 👋
          </h1>
          <p className="text-base" style={{ color: 'var(--qiwa-text-secondary)' }}>
            الإجراءات المقترحة
          </p>
        </div>

        {/* وظيفتي الحالية */}
        {contractData ? (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>
                وظيفتي الحالية
              </h2>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                {contractData.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--qiwa-text-primary)' }}>
                  {contractData.company}
                </h3>
                <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>
                  رقم العقد: {contractData.contractNumber}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--qiwa-text-secondary)' }}>
                  مُحدث: {contractData.lastUpdate}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--qiwa-border-light)' }}>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>المسمى الوظيفي:</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>{contractData.jobTitle}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>النوع:</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>{contractData.type}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>فترة الإشعار:</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>{contractData.notificationPeriod}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>فترة التجربة:</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>{contractData.probationPeriod}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--qiwa-text-secondary)' }}>تجديد العقد:</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>{contractData.renewal}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--qiwa-border-light)' }}>
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <p className="text-xl font-bold mb-1" style={{ color: 'var(--qiwa-primary)' }}>{contractData.startDate}</p>
                  <p className="text-xs" style={{ color: 'var(--qiwa-text-secondary)' }}>تاريخ بداية العقد الحالي</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50">
                  <p className="text-xl font-bold mb-1" style={{ color: 'var(--qiwa-primary)' }}>{contractData.endDate}</p>
                  <p className="text-xs" style={{ color: 'var(--qiwa-text-secondary)' }}>تاريخ انتهاء العقد الحالي</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--qiwa-primary)' }}>
              وظيفتي الحالية
            </h2>
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--qiwa-text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p style={{ color: 'var(--qiwa-text-secondary)' }}>لا يوجد عقد نشط حالياً</p>
            </div>
          </div>
        )}

        {/* العثور على وظيفة جديدة / سيرتك الذاتية */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
            العثور على وظيفة جديدة
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--qiwa-text-secondary)' }}>
            سيرتك الذاتية
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm mb-3" style={{ color: 'var(--qiwa-text-secondary)' }}>
              التحقق من خبرتك العملية أو إضافتها إلى سيرتك الذاتية للعثور على وظيفة جديدة
            </p>
          </div>

          <div className="border rounded-xl p-6" style={{ borderColor: 'var(--qiwa-border-light)' }}>
            <h3 className="text-base font-bold mb-4" style={{ color: 'var(--qiwa-text-primary)' }}>
              إكمال السيرة الذاتية
            </h3>

            {resumeData && resumeData.completionPercentage > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: 'var(--qiwa-text-primary)' }}>
                    اكتمال السيرة الذاتية: {resumeData.completionLevel}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--qiwa-text-secondary)' }}>
                    {resumeData.completedSteps} من {resumeData.totalSteps}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${resumeData.completionPercentage}%`,
                      backgroundColor: 'var(--qiwa-primary)'
                    }}
                  ></div>
                </div>
                <Link 
                  href="/qiwa/individuals/resume"
                  className="inline-block px-6 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-md"
                  style={{ backgroundColor: 'var(--qiwa-primary)', color: 'white' }}
                >
                  إكمال السيرة الذاتية
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
                <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 mb-1">لم نتمكن من تحميل بياناتك،</p>
                <p className="text-xs text-red-600">رقم الخطأ: {Math.random().toString(36).substring(2, 15)}</p>
                <Link 
                  href="/qiwa/individuals/resume"
                  className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  إنشاء سيرة ذاتية
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* إجراءات سريعة */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--qiwa-primary)' }}>
            إجراءات سريعة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div 
                  className="group p-6 rounded-xl border-2 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  style={{ borderColor: 'var(--qiwa-border-light)' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = action.color}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--qiwa-border-light)'}
                >
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <QiwaIcon name={action.icon} className="w-6 h-6" style={{ color: action.color }} />
                    </div>
                    <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--qiwa-text-primary)' }}>
                      {action.title}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--qiwa-text-secondary)' }}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* مركز المعرفة */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 mb-8 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--qiwa-primary)' }}>
            مركز المعرفة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {knowledgeCenter.map((item, index) => (
              <div 
                key={index}
                className="group p-6 rounded-xl border-2 hover:shadow-lg transition-all duration-300 cursor-pointer"
                style={{ borderColor: 'var(--qiwa-border-light)' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = item.color}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--qiwa-border-light)'}
              >
                <div className="flex flex-col items-center text-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <QiwaIcon name={item.icon} className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--qiwa-text-primary)' }}>
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <div className="text-center space-y-4">
            <h3 className="text-base font-bold" style={{ color: 'var(--qiwa-text-primary)' }}>
              روابط مهمة
            </h3>
            
            <Link 
              href="/qiwa"
              className="inline-block px-8 py-3 rounded-lg text-sm font-semibold transition-all hover:shadow-md"
              style={{ backgroundColor: 'var(--qiwa-primary)', color: 'white' }}
            >
              استكشف قوى
            </Link>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--qiwa-border-light)' }}>
              <p className="text-sm mb-3" style={{ color: 'var(--qiwa-text-secondary)' }}>
                واجهتك مشكلة أو ترغب بمساعدتنا على تحسين المنصة؟
              </p>
              <Link 
                href="/qiwa/individuals/tickets"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold border-2 transition-all hover:shadow-md"
                style={{ borderColor: 'var(--qiwa-primary)', color: 'var(--qiwa-primary)' }}
              >
                <QiwaIcon name="ticket" className="w-4 h-4" />
                <span>فتح تذكرة دعم</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
