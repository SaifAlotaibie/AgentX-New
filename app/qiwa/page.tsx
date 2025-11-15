'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getUserId, getUserProfile, type UserProfile } from '@/lib/supabase'

export default function QiwaHomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = [
    { number: '15,256,840', label: 'عدد المستخدمين المسجلين' },
    { number: '2,842,329', label: 'عدد المنشآت المسجلة' },
    { number: '103,478,453', label: 'عدد رخص العمل المجددة' },
    { number: '12,059,849', label: 'عدد العقود الموثقة' },
    { number: '10,872,217', label: 'عدد التأشيرات المهنية المصدرة' },
    { number: '921,527', label: 'عدد شهادات التوطين المصدرة' }
  ]

  const knowledgeCenter = [
    {
      title: 'خدمات لأصحاب الأعمال',
      description: 'إدارة المنشأة والموظفين بكفاءة.',
      link: '/qiwa/employers'
    },
    {
      title: 'خدمات للأفراد',
      description: 'تطوير المسيرة المهنية وزيادة الفرص الوظيفية.',
      link: '/qiwa/individuals'
    },
    {
      title: 'لمقدمي الخدمات',
      description: 'تحسين تجربة العملاء والتعاون مع أصحاب الأعمال.',
      link: '/qiwa/providers'
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FB' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/qiwa" className="flex items-center gap-3 transition-transform duration-300 hover:scale-110">
              <Image 
                src="/qiwa-logo-afrad.png" 
                alt="منصة قوى" 
                width={140} 
                height={60}
                className="h-14 w-auto"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/qiwa/employers" className="group relative text-base font-semibold transition-all duration-300 hover:scale-105" style={{ color: '#2E2E2E' }} onMouseOver={(e) => e.currentTarget.style.color = '#0098D4'} onMouseOut={(e) => e.currentTarget.style.color = '#2E2E2E'}>
                لأصحاب الأعمال
                <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#0098D4' }}></span>
              </Link>
              <Link href="/qiwa/individuals" className="group relative text-base font-semibold transition-all duration-300 hover:scale-105" style={{ color: '#2E2E2E' }} onMouseOver={(e) => e.currentTarget.style.color = '#0098D4'} onMouseOut={(e) => e.currentTarget.style.color = '#2E2E2E'}>
                للموظفين
                <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#0098D4' }}></span>
              </Link>
              <Link href="/qiwa/providers" className="group relative text-base font-semibold transition-all duration-300 hover:scale-105" style={{ color: '#2E2E2E' }} onMouseOver={(e) => e.currentTarget.style.color = '#0098D4'} onMouseOut={(e) => e.currentTarget.style.color = '#2E2E2E'}>
                لمقدمي الخدمات
                <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#0098D4' }}></span>
              </Link>
              <Link href="/qiwa/discover" className="group relative text-base font-semibold transition-all duration-300 hover:scale-105" style={{ color: '#2E2E2E' }} onMouseOver={(e) => e.currentTarget.style.color = '#0098D4'} onMouseOut={(e) => e.currentTarget.style.color = '#2E2E2E'}>
                اكتشف قوى
                <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ backgroundColor: '#0098D4' }}></span>
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ color: '#0098D4', border: '2px solid #0098D4' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0098D4'; e.currentTarget.style.color = 'white' }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0098D4' }}>
                ابحث
              </button>
              <button className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: '#0A1F4D' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1E3779'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0A1F4D'}>
                English
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A1F4D 0%, #1E3779 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ lineHeight: '1.3' }}>
              أهلاً بك في قوى
            </h1>
            <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto" style={{ lineHeight: '1.8', opacity: 0.95 }}>
              أدر أعمالك وطور مسيرتك المهنية وأنجز معاملاتك الرسمية بسهولة إلكترونيًا على مدار الساعة.
            </p>

            {/* Search Box */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-2 hover:shadow-3xl transition-all duration-300 group">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن خدمات أو معلومات"
                  className="flex-1 px-6 py-4 text-lg focus:outline-none rounded-xl"
                  style={{ color: '#2E2E2E' }}
                />
                <button className="px-8 py-4 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: '#0098D4' }}>
                  بحث
                </button>
              </div>
              
              <button className="mt-6 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold flex items-center gap-2 mx-auto hover:bg-white/30 hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span>اسأل قوى</span>
                <span className="text-xs px-2 py-1 rounded-full animate-pulse" style={{ backgroundColor: '#0098D4' }}>beta</span>
              </button>
              <p className="text-sm mt-2 opacity-80">مساعدك الافتراضي</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0A1F4D' }}>
              منصة قوى في أرقام
            </h2>
            <p className="text-lg max-w-4xl mx-auto" style={{ color: '#2E2E2E', lineHeight: '1.8' }}>
              تتحدث لغة الأرقام عن خدماتنا الرقمية وإنجازاتنا، حيث نهدف لرفع الكفاءة وتقليل المعاملات الورقية لنعزز الاستدامة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group relative text-center p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer overflow-hidden"
                style={{ borderColor: '#0098D4', backgroundColor: '#F8F9FB' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0098D4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-5xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300" style={{ color: '#0098D4' }}>
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold" style={{ color: '#2E2E2E' }}>
                    {stat.label}
                  </div>
                </div>
                <div className="absolute top-2 right-2 w-12 h-12 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ backgroundColor: '#0098D4' }}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20" style={{ backgroundColor: '#F8F9FB' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl p-12 border-r-8 transition-all duration-300 hover:scale-[1.02] cursor-pointer" style={{ borderColor: '#0098D4' }}>
            <svg className="w-16 h-16 mb-6 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#0098D4' }}>
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
            </svg>
            <p className="text-2xl md:text-3xl font-bold mb-8 group-hover:text-[#0098D4] transition-colors duration-300" style={{ color: '#0A1F4D', lineHeight: '1.6' }}>
              المملكة وجهة جذابة للاستثمار .. بيئة محفزة وإجراءات ميسرة
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#0098D4', color: 'white' }}>
                م
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: '#2E2E2E' }}>الدكتور ماجد القصبي</div>
                <div className="text-sm" style={{ color: '#0098D4' }}>معالي وزير التجارة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Center */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0A1F4D' }}>
              مركز المعرفة
            </h2>
            <p className="text-lg" style={{ color: '#2E2E2E' }}>
              استكشف خدمات قوى الإلكترونية واستفد منها.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {knowledgeCenter.map((item, index) => (
              <Link key={index} href={item.link}>
                <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 overflow-hidden cursor-pointer" style={{ borderColor: '#F8F9FB' }}>
                  {/* Hover Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0098D4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Animated Border */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0098D4] to-[#0A1F4D] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: '#0098D4' }}>
                      <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-[#0098D4] transition-colors duration-300" style={{ color: '#0A1F4D' }}>
                      {item.title}
                    </h3>
                    <p className="text-base leading-relaxed" style={{ color: '#2E2E2E' }}>
                      {item.description}
                    </p>
                    
                    <div className="mt-6 flex items-center gap-2 font-semibold group-hover:gap-4 transition-all duration-300" style={{ color: '#0098D4' }}>
                      <span>استكشف المزيد</span>
                      <svg className="w-5 h-5 transform rotate-180 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Corner Decoration */}
                  <div className="absolute bottom-2 left-2 w-16 h-16 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundColor: '#0098D4' }}></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-16" style={{ backgroundColor: '#0A1F4D' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* لأصحاب الأعمال */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0098D4' }}>لأصحاب الأعمال</h3>
              <ul className="space-y-3 text-sm">
                {['استقطاب الموظفين', 'إدارة الموظفين الحاليين', 'إدارة المنشأة', 'أداء المنشأة', 'إدارة حساب الأعمال', 'خدمات مكتب العمل'].map((item, i) => (
                  <li key={i}>
                    <Link href="#" className="group relative inline-block hover:text-[#0098D4] transition-all duration-300 opacity-90 hover:opacity-100 hover:translate-x-1">
                      <span className="relative">
                        {item}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0098D4] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* للموظفين */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0098D4' }}>للموظفين</h3>
              <ul className="space-y-3 text-sm">
                {['إدارة مسيرتك المهنية على قوى', 'إدارة وظيفتك الحالية', 'إدارة العمالة المنزلية', 'إدارة حساب الأفراد', 'خدمات مكتب العمل'].map((item, i) => (
                  <li key={i}>
                    <Link href="#" className="group relative inline-block hover:text-[#0098D4] transition-all duration-300 opacity-90 hover:opacity-100 hover:translate-x-1">
                      <span className="relative">
                        {item}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0098D4] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* لمقدمي الخدمات */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0098D4' }}>لمقدمي الخدمات</h3>
              <ul className="space-y-3 text-sm">
                {['مكاتب المحاماة', 'إدارة حساب مقدم الخدمة'].map((item, i) => (
                  <li key={i}>
                    <Link href="#" className="group relative inline-block hover:text-[#0098D4] transition-all duration-300 opacity-90 hover:opacity-100 hover:translate-x-1">
                      <span className="relative">
                        {item}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0098D4] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* الأدوات والحاسبات */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0098D4' }}>الأدوات والحاسبات</h3>
              <ul className="space-y-3 text-sm">
                {['حاسبة نطاقات', 'مكافأة نهاية الخدمة', 'التحقق من الشهادات', 'المهن المرتبطة بأنشطة نطاقات', 'حاسبة رخصة العمل'].map((item, i) => (
                  <li key={i}>
                    <Link href="#" className="group relative inline-block hover:text-[#0098D4] transition-all duration-300 opacity-90 hover:opacity-100 hover:translate-x-1">
                      <span className="relative">
                        {item}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0098D4] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* منصة قوى */}
            <div>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#0098D4' }}>منصة قوى</h3>
              <ul className="space-y-3 text-sm">
                {['اكتشف قوى', 'حساب الأعمال', 'حساب الأفراد', 'الأسئلة الشائعة', 'الاستدامة والتأثير', 'نظام العمل'].map((item, i) => (
                  <li key={i}>
                    <Link href="#" className="group relative inline-block hover:text-[#0098D4] transition-all duration-300 opacity-90 hover:opacity-100 hover:translate-x-1">
                      <span className="relative">
                        {item}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0098D4] group-hover:w-full transition-all duration-300"></span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t pt-8" style={{ borderColor: '#1E3779' }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm opacity-80">
                © ٢٠٢٥ منصة قوى - وزارة الموارد البشرية والتنمية الاجتماعية
              </p>
              <div className="flex gap-4">
                {['📘', '𝕏', '📷', '▶️'].map((icon, i) => (
                  <a key={i} href="#" className="group relative w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 hover:scale-125 hover:rotate-6 hover:shadow-lg" style={{ backgroundColor: '#1E3779' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0098D4'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1E3779'}>
                    <span className="group-hover:scale-110 transition-transform duration-300">{icon}</span>
                    <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300" style={{ backgroundColor: '#0098D4' }}></span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
