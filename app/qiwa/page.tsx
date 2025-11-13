'use client'

import Link from 'next/link'
import ChatbotWidget from '@/components/qiwa/ChatbotWidget'

export default function QiwaPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <img 
                src="/qiwaLogo.png" 
                alt="قوى" 
                className="h-12 w-auto object-contain"
              />
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-bold hover:text-[#20183b] transition-colors" style={{ color: '#4b515a' }}>
                لأصحاب الأعمال
              </a>
              <a href="#individuals" className="text-sm font-bold hover:text-[#20183b] transition-colors" style={{ color: '#4b515a' }}>
                للموظفين
              </a>
              <a href="#" className="text-sm font-bold hover:text-[#20183b] transition-colors" style={{ color: '#4b515a' }}>
                لمقدمي الخدمات
              </a>
            </nav>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100" style={{ color: '#4b515a' }}>
                English
              </button>
              <Link 
                href="/" 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: '#4b515a' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #20183b 0%, #0a0e14 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ backgroundColor: '#0060ff' }}></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full filter blur-3xl animate-pulse" style={{ backgroundColor: '#1b8354', animationDelay: '1s' }}></div>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <img 
            src="/qiwaLogo.png" 
            alt="" 
            className="w-[600px] h-auto object-contain"
            style={{ filter: 'brightness(2)' }}
          />
        </div>
        
        <div className="relative container mx-auto px-6 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              منصة قوى
            </h1>
            <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              منصة موحدة لإدارة الموارد البشرية بكفاءة وشفافية<br/>
              أدر أعمالك وطور مسيرتك المهنية على مدار الساعة
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/qiwa/individuals"
                className="group px-10 py-5 bg-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105 flex items-center gap-3"
                style={{ color: '#20183b' }}
              >
                <span className="text-3xl">👤</span>
                <span>خدمات الأفراد</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
              </Link>
              
              <a 
                href="#"
                className="group px-10 py-5 border-2 border-white text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-[#20183b] transition-all flex items-center gap-3"
              >
                <span className="text-3xl">🏢</span>
                <span>خدمات المنشآت</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </a>
              </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24" style={{ fill: '#fafafa' }} viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20" id="individuals">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: '#20183b' }}>
              لماذا منصة قوى؟
            </h2>
            <p className="text-lg" style={{ color: '#4b515a' }}>
              نظام متكامل لإدارة الموارد البشرية بكفاءة عالية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '⚡', title: 'سرعة الإنجاز', desc: 'معالجة فورية للمعاملات' },
              { icon: '🔒', title: 'أمان البيانات', desc: 'حماية متقدمة للمعلومات' },
              { icon: '🕐', title: 'خدمة 24/7', desc: 'متاح على مدار الساعة' },
              { icon: '💬', title: 'دعم متميز', desc: 'فريق جاهز لمساعدتك' },
              { icon: '📊', title: 'تقارير شاملة', desc: 'إحصائيات وتحليلات دقيقة' },
              { icon: '🎯', title: 'سهولة الاستخدام', desc: 'واجهة بسيطة وواضحة' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl mb-4" style={{ backgroundColor: '#f0f7ff' }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#20183b' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#4b515a' }}>
                  {feature.desc}
                </p>
                    </div>
                  ))}
                </div>
              </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-16 mt-12" style={{ backgroundColor: '#1b1f27' }}>
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img 
                src="/qiwaLogo.png" 
                alt="قوى" 
                className="h-14 w-auto object-contain"
              />
              <h3 className="text-2xl font-bold">منصة قوى</h3>
            </div>
            <p className="mb-10" style={{ color: '#b7d3ec' }}>نظام موحد لإدارة الموارد البشرية</p>
            <div className="flex items-center justify-center gap-10 text-sm mb-10">
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#b7d3ec' }}>الشروط والأحكام</a>
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#b7d3ec' }}>سياسة الخصوصية</a>
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#b7d3ec' }}>اتصل بنا</a>
            </div>
            <p className="text-sm" style={{ color: '#4b515a' }}>© 2025 منصة قوى - وزارة الموارد البشرية والتنمية الاجتماعية</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot Widget */}
      <ChatbotWidget />
    </div>
  )
}
