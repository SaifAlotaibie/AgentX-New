'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import QiwaIcon from '@/components/qiwa/QiwaIcon'

interface ServiceCard {
  icon: string
  title: string
  description: string
  href: string
  badge?: string
  color: string
}

export default function IndividualsPage() {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('صباح الخير')
    else if (hour < 18) setGreeting('مساء الخير')
    else setGreeting('مساء الخير')
  }, [])

  const services: ServiceCard[] = [
    {
      icon: 'chat',
      title: 'المساعد الذكي',
      description: 'وكيل رقمي يساعدك في جميع الخدمات',
      href: '/qiwa/individuals/chatbot',
      badge: 'جديد',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: 'briefcase',
      title: 'وظيفتي الحالية',
      description: 'عرض وإدارة عقود العمل',
      href: '/qiwa/individuals/contracts',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: 'badge',
      title: 'إصدار الشهادات',
      description: 'شهادات راتب، خبرة، وتراخيص',
      href: '/qiwa/individuals/certificates/salary',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: 'documentText',
      title: 'السيرة الذاتية',
      description: 'إنشاء وإدارة سيرتك الذاتية',
      href: '/qiwa/individuals/resume',
      color: 'from-orange-500 to-amber-600'
    },
    {
      icon: 'ticket',
      title: 'التذاكر',
      description: 'فتح ومتابعة تذاكر الدعم',
      href: '/qiwa/individuals/tickets',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: 'calendar',
      title: 'المواعيد',
      description: 'حجز مواعيد مكتب العمل',
      href: '/qiwa/individuals/appointments',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: 'home2',
      title: 'العمالة المنزلية',
      description: 'خدمات استقدام وإدارة',
      href: '/qiwa/individuals/domestic',
      color: 'from-violet-500 to-purple-600'
    },
    {
      icon: 'calculator',
      title: 'حاسبة نهاية الخدمة',
      description: 'احسب مكافأة نهاية الخدمة',
      href: '/qiwa/individuals/end-of-service',
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: 'book',
      title: 'لوائح العمل',
      description: 'الأنظمة واللوائح التنظيمية',
      href: '/qiwa/individuals/regulations',
      color: 'from-slate-500 to-gray-600'
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--qiwa-bg-soft)' }}>
      <main className="qiwa-main-content">
        {/* Top Header with Logo */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <img 
              src="/qiwalogofor-afrad.png" 
              alt="قوى - حساب الأفراد" 
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
                {greeting}، سيف العتيبي
              </h1>
              <p style={{ color: 'var(--qiwa-text-secondary)' }}>
                مرحباً بك في حسابك على منصة قوى
              </p>
            </div>
          </div>

          {/* Notifications & Search */}
          <div className="hidden md:flex items-center gap-4">
            <button className="relative w-12 h-12 rounded-full bg-white flex items-center justify-center qiwa-shadow-card hover:qiwa-shadow-hover qiwa-transition">
              <QiwaIcon name="bell" className="w-6 h-6" style={{ color: 'var(--qiwa-primary)' }} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
            </button>
            
            <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center qiwa-shadow-card hover:qiwa-shadow-hover qiwa-transition">
              <QiwaIcon name="search" className="w-6 h-6" style={{ color: 'var(--qiwa-primary)' }} />
            </button>
          </div>
        </div>

        {/* AI Assistant Banner */}
        <Link href="/qiwa/individuals/chatbot">
          <div 
            className="qiwa-card mb-8 cursor-pointer animate-slide-in-right overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--qiwa-blue) 0%, var(--qiwa-primary) 100%)',
              color: 'white',
              padding: '32px'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <QiwaIcon name="chat" className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">المساعد الذكي متاح الآن!</h2>
                    <p className="text-white/90">وكيل رقمي ذكي يساعدك في جميع خدماتك بسرعة ودقة</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm">إصدار شهادات فوري</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">حجز مواعيد ذكي</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">دعم فوري 24/7</span>
                  </div>
                </div>

                <button className="bg-white px-6 py-3 rounded-lg font-bold hover:scale-105 qiwa-transition inline-flex items-center gap-2" style={{ color: 'var(--qiwa-blue)' }}>
                  <span>تحدث مع المساعد الآن</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

              <div className="hidden lg:block">
                <div className="w-32 h-32 relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                  <div className="absolute inset-4 flex items-center justify-center">
                    <QiwaIcon name="chat" className="w-20 h-20 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <div className="qiwa-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light-blue-1)' }}>
                <QiwaIcon name="briefcase" className="w-6 h-6" style={{ color: 'var(--qiwa-blue)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>العقود النشطة</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>1</p>
              </div>
            </div>
          </div>

          <div className="qiwa-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF9E6' }}>
                <QiwaIcon name="ticket" className="w-6 h-6" style={{ color: '#D97706' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>التذاكر المفتوحة</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>0</p>
              </div>
            </div>
          </div>

          <div className="qiwa-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-success-bg)' }}>
                <QiwaIcon name="badge" className="w-6 h-6" style={{ color: '#1B8354' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>الشهادات الصادرة</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>3</p>
              </div>
            </div>
          </div>

          <div className="qiwa-card">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFE6F0' }}>
                <QiwaIcon name="calendar" className="w-6 h-6" style={{ color: '#DC2626' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>المواعيد القادمة</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--qiwa-primary)' }}>
            الخدمات المتاحة
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Link key={index} href={service.href}>
                <div className="qiwa-card cursor-pointer group animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center group-hover:scale-110 qiwa-transition`}>
                      <QiwaIcon name={service.icon} className="w-7 h-7 text-white" />
                    </div>
                    {service.badge && (
                      <span className="qiwa-badge qiwa-badge-yellow text-xs">
                        {service.badge}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 qiwa-transition" style={{ color: 'var(--qiwa-primary)' }}>
                    {service.title}
                  </h3>
                  
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--qiwa-text-secondary)' }}>
                    {service.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 qiwa-transition" style={{ color: 'var(--qiwa-blue)' }}>
                    <span>اذهب للخدمة</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="qiwa-card animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>
              النشاط الأخير
            </h2>
            <button className="text-sm font-medium hover:underline" style={{ color: 'var(--qiwa-blue)' }}>
              عرض الكل
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--qiwa-border-light)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-light-blue-1)' }}>
                <QiwaIcon name="document" className="w-5 h-5" style={{ color: 'var(--qiwa-blue)' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium" style={{ color: 'var(--qiwa-primary)' }}>تم إصدار شهادة راتب</p>
                <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>منذ ساعتين</p>
              </div>
              <span className="qiwa-badge qiwa-badge-success">مكتمل</span>
            </div>

            <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: 'var(--qiwa-border-light)' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF9E6' }}>
                <QiwaIcon name="briefcase" className="w-5 h-5" style={{ color: '#D97706' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium" style={{ color: 'var(--qiwa-primary)' }}>تحديث بيانات العقد</p>
                <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>أمس</p>
              </div>
              <span className="qiwa-badge qiwa-badge-blue">نشط</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--qiwa-success-bg)' }}>
                <QiwaIcon name="documentText" className="w-5 h-5" style={{ color: '#1B8354' }} />
              </div>
              <div className="flex-1">
                <p className="font-medium" style={{ color: 'var(--qiwa-primary)' }}>تحديث السيرة الذاتية</p>
                <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>منذ 3 أيام</p>
              </div>
              <span className="qiwa-badge qiwa-badge-success">مكتمل</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
