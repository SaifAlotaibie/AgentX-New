'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { getUserId, getUserProfile, type UserProfile } from '@/lib/supabase'
import UserProfileForm from '@/components/UserProfileForm'

const VoiceCallButton = dynamic(() => import('@/components/VoiceCallButton'), { ssr: false })
const ChatAssistant = dynamic(() => import('@/components/ChatAssistant'), { ssr: false })

export default function HomePage() {
  const [isCheckingUser, setIsCheckingUser] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    checkUserRegistration()
  }, [])

  const checkUserRegistration = async () => {
    try {
      const userId = getUserId()
      const profile = await getUserProfile(userId)
      
      setUserProfile(profile)
      setIsCheckingUser(false)

      if (profile) {
        setShowWelcome(true)
        setTimeout(() => setShowWelcome(false), 3000)
      }
    } catch (error) {
      console.error('Error checking user registration:', error)
      setIsCheckingUser(false)
    }
  }

  const handleRegistrationSuccess = (fullName: string) => {
    setUserProfile({ user_id: getUserId(), full_name: fullName })
    setShowWelcome(true)
    setTimeout(() => setShowWelcome(false), 3000)
  }

  if (isCheckingUser) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#fafafa' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{ borderColor: '#1B8354' }}></div>
          <p className="font-semibold" style={{ color: '#525252' }}>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return <UserProfileForm onSuccess={handleRegistrationSuccess} />
  }

  const platforms = [
    {
      title: 'منصة قوى',
      description: 'هي منصة رقمية توفر جميع خدمات منظومة العمل في المملكة العربية السعودية، وتمكّن مختلف أطرافها (موظفين، ومنشآت حكومية وخاصة) من تنظيم جميع تعاملاتهم ومتابعتها بطريقة مؤتمتة وفورية دون الحاجة إلى تعاملات ورقية.',
      image: '/qiwa.webp',
      href: '/qiwa',
      isActive: true,
      bgColor: '#f0fdf4'
    },
    {
      title: 'منصة مساند للعمالة المنزلية',
      description: 'تُسهّل المنصة إجراءات استقدام العمالة المنزلية، وتسعى إلى رفع مستوى حفظ الحقوق لدى جميع الأطراف؛ حيث تُعرّف أصحاب العمل والعمالة المنزلية بحقوقهم وواجباتهم.',
      image: '/musand.webp',
      href: '#',
      isActive: false,
      bgColor: '#eff6ff'
    },
    {
      title: 'منصة أجير',
      description: 'تسعى هذه المنصة الإلكترونية إلى تنظيم (العمل المؤقت) في المملكة العربية السعودية من خلال تيسير الوصول إلى القوى العاملة الموجودة داخلها كبديل عن استقدامها من الخارج، مما يُسهم في رفع كفاءة سوق العمل.',
      image: '/ager.webp',
      href: '#',
      isActive: false,
      bgColor: '#faf5ff'
    },
    {
      title: 'حساب المواطن',
      description: 'أنشئ برنامج حساب المواطن لحماية الأسر السعودية من الأثر المباشر وغير المباشر المتوقع من الإصلاحات الاقتصادية المختلفة، التي قد تتسبب في عبء إضافي على بعض فئات المجتمع.',
      image: '/muwaten.webp',
      href: '#',
      isActive: false,
      bgColor: '#fff7ed'
    }
  ]

  const careServices = [
    {
      title: 'تمكين المرأة',
      description: 'انطلاقا من رؤية المملكة حظي ملف المرأة باهتمام كبير من حكومة المملكة العربية السعودية وبالتالي من الجهات ذات العلاقة ومنها وزارة الموارد البشرية والتنمية الاجتماعية، وذلك بتخصيص أحد أهداف الرؤية لضمان...',
      gradient: 'from-pink-500 to-rose-600'
    },
    {
      title: 'تمكين الشباب',
      description: 'يمكن أن نطلق على المجتمع السعودي اسم مجتمع الشباب حيث يشكِّل الشباب دون الـ 30 عاماً النسبة الأكبر من سكان المملكة؛ ما يجعلهم قاعدة أساسية في التحول الاقتصادي والمجتمعي وفي كافة المجالات.',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'تمكين الأشخاص ذوي الإعاقة',
      description: 'تسعى الوزارة الى تمكين الأشخاص ذوي الإعاقة من الحصول على فرص عمل مناسبة وتعليم يضمن استقلاليتهم واندماجهم بوصفهم عناصر فاعلة في المجتمع، وتزويدهم بكل التسهيلات والأدوات التي تساعدهم على تحقيق النجاح.',
      gradient: 'from-teal-500 to-cyan-600'
    },
    {
      title: 'الصحة والسلامة في بيئة العمل',
      description: 'يتمتع العامل في المملكة بحقوق وواجبات تم أخذها في الاعتبار من قبل وزارة الموارد البشرية والتنمية الاجتماعية كجهة مشرعة ومنظمة لسوق العمل، وتتوافق هذه الحقوق والواجبات مع حقوق الإنسان في المملكة والتي ...',
      gradient: 'from-red-500 to-pink-600'
    },
    {
      title: 'كبار السن',
      description: 'أولت حكومة خادم الحرمين الشريفين اهتماماً بالغاً برعاية كبار السن حيث جرى إطلاق العديد من المبادرات لتحسين جودة الحياة ورفع مستوى الخدمات المقدمة لكبار السن في المجتمع عامة وفي دور الرعاية التي تشرف ع...',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      title: 'الحماية الاجتماعية',
      description: 'يستعرض هذا القسم الجهود التي تبذلها المملكة لدعم المواطنين في مختلف مراحل حياتهم لضمان حياة كريمة تعود إمكانية تحقيق هذه الجهود إلى تكامل أنظمة الرعاية الاجتماعية، ومن خدماتها توفير رعاية الأيتام ورعا...',
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      title: 'المهارات والتدريب',
      description: 'تولي رؤية 2030 المملكة اهتماما كبيراً بالمواطن السعودي للمنافسة محلياً وعالمياً من خلال إعداد قوى عاملة وطنية متميزة عبر تعزيز القيم وتطوير المهارات الأساسية والمستقبلية وتنمية المعارف.',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      title: 'دعم الطفل',
      description: 'نحو إرساء نظام حماية اجتماعية شاملة يشمل كافة فئات المجتمع، تعددت أوجه دعم الحكومة للأطفال، حيث يختلف مقدار الدعم المادي للطفل في المملكة العربية السعودية حسب البرنامج أو الخدمة التي يتم تقديمها. ومن ...',
      gradient: 'from-yellow-500 to-amber-600'
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      {showWelcome && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50" style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div className="text-white px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-sm" style={{ background: 'linear-gradient(135deg, #1B8354 0%, #14573A 100%)', border: '2px solid rgba(255, 255, 255, 0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ABEFCC' }}></div>
              <p className="font-bold text-lg">مرحباً {userProfile.full_name}، سعيد برجعتك!</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50" style={{ borderBottom: '1px solid rgba(27, 131, 84, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28">
            <div className="flex items-center">
              <Link href="/" className="flex items-center transition-transform duration-300 hover:scale-105">
                <Image 
                  src="/logohrsd.svg" 
                  alt="وزارة الموارد البشرية والتنمية الاجتماعية" 
                  width={180} 
                  height={180}
                  className="w-36 h-36 md:w-44 md:h-44"
                  priority
                />
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-2">
              {['الوزارة', 'خدمات الوزارة', 'نهتم بكم', 'مركز المعرفة', 'المركز الإعلامي', 'تواصل معنا'].map((item, i) => (
                <Link
                  key={i}
                  href={`/${item}`}
                  className="relative px-5 py-2.5 text-base font-semibold transition-all duration-200 rounded-lg group"
                  style={{ color: '#676C77' }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#1B8354'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#676C77'}
                >
                  <span className="relative z-10">{item}</span>
                  <div className="absolute inset-0 bg-[#1B8354]/5 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button className="text-base font-semibold px-6 py-3 rounded-lg border-2 transition-all duration-200 hover:scale-105" style={{ color: '#676C77', borderColor: '#D2D6DB', backgroundColor: 'white' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; e.currentTarget.style.borderColor = '#1B8354'; e.currentTarget.style.color = '#1B8354' }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = '#D2D6DB'; e.currentTarget.style.color = '#676C77' }}>
                اللغة
              </button>
              <div className="px-4 py-2 rounded-lg font-bold text-sm" style={{ backgroundColor: '#f0fdf4', color: '#1B8354' }}>HRSD</div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B8354 0%, #14573A 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ABEFCC' }}></div>
              <span className="text-sm font-semibold">البوابة الرسمية</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 leading-relaxed" style={{ lineHeight: '1.6' }}>
              الريادة عالمياً في تمكين الإنسان والمجتمع، وتعزيز تنافسية سوق العمل
            </h1>
            <p className="text-lg md:text-xl mb-10 opacity-95 leading-loose" style={{ lineHeight: '1.8' }}>
              تمكين الفرد والمجتمع والمؤسسات وخلق سوق عمل يحفز الابتكار والاستدامة ومواكبة التحولات المستقبلية، من خلال سياسات وتشريعات مرنة وفاعلة
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/about">
                <button className="group relative px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden" style={{ backgroundColor: '#eab308', color: '#161616' }}>
                  <span className="relative z-10">المزيد</span>
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="#fafafa"/>
          </svg>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#f0fdf4', color: '#1B8354' }}>
              <span className="text-sm font-semibold">الإحصائيات</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#161616' }}>احصائيات حول الوزارة</h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#676C77' }}>
              آخر الأرقام والإحصاءات المتعلقة بالخدمات الرقمية التي تقدمها وزارة الموارد البشرية والتنمية الاجتماعية.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '855', label: 'الخدمات المقدمة' },
              { number: '197,901,069', label: 'زوار الموقع' },
              { number: '36,687,106', label: 'المعاملات المنجزة' }
            ].map((stat, i) => (
              <div key={i} className="group relative text-center p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: '#f0fdf4', borderColor: '#1B8354', borderWidth: '2px' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1B8354]/5 to-[#14573A]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-5xl md:text-6xl font-bold mb-3" style={{ color: '#1B8354' }}>{stat.number}</div>
                  <div className="text-lg font-semibold" style={{ color: '#161616' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20" style={{ backgroundColor: '#fafafa' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#f0fdf4', color: '#1B8354' }}>
              <span className="text-sm font-semibold">الخدمات الإلكترونية</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#161616' }}>خدمات الوزارة</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <Link key={index} href={platform.href} className={!platform.isActive ? 'pointer-events-none' : ''}>
                <div className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${platform.isActive ? 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer' : 'opacity-60'}`} style={{ border: '1px solid #e5e5e5' }}>
                  {/* Image Container - بدون overlay */}
                  <div className="relative h-48 flex items-center justify-center p-8" style={{ backgroundColor: platform.bgColor }}>
                    <Image 
                      src={platform.image}
                      alt={platform.title}
                      width={280}
                      height={180}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      style={{ filter: 'none' }}
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3" style={{ color: '#161616' }}>{platform.title}</h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#676C77' }}>{platform.description}</p>
                    
                    {platform.isActive && (
                      <div className="flex items-center font-semibold text-sm group-hover:gap-2 transition-all duration-300" style={{ color: '#1B8354' }}>
                        <span>استكشف المنصة</span>
                        <svg className="w-5 h-5 transform rotate-180 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Active Badge */}
                  {platform.isActive && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm" style={{ backgroundColor: 'rgba(27, 131, 84, 0.9)', color: 'white' }}>
                      متاح الآن
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Care Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full mb-4" style={{ backgroundColor: '#f0fdf4', color: '#1B8354' }}>
              <span className="text-sm font-semibold">الرعاية والتمكين</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: '#161616' }}>نهتم بكم</h2>
            <p className="text-lg max-w-4xl mx-auto leading-relaxed" style={{ color: '#676C77' }}>
              تعمل وزارة الموارد البشرية والتنمية الإجتماعية على دعم الأفراد بكافة فئاتهم في مختلف مراحل حياتهم لضمان حياة كريمة لهم وبناء مجتمع مستقر، ومتوازن، ومتكافئ.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {careServices.map((service, index) => (
              <div key={index} className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden" style={{ border: '2px solid #f0f0f0' }}>
                {/* Top Gradient Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to right, ${service.gradient.replace('from-', '').replace('to-', ',')}` }}></div>
                
                {/* Left Accent Line */}
                <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b opacity-50 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to bottom, ${service.gradient.replace('from-', '').replace('to-', ',')}` }}></div>
                
                <div className="relative">
                  <h3 className="text-xl font-bold mb-4 group-hover:text-[#1B8354] transition-colors duration-300" style={{ color: '#161616', lineHeight: '1.4' }}>
                    {service.title}
                  </h3>
                  <p className="text-sm leading-loose" style={{ color: '#676C77', lineHeight: '1.8' }}>
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-16" style={{ backgroundColor: '#171717' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#1B8354' }}></div>
                نظرة عامة
              </h3>
              <ul className="space-y-3 text-sm">
                {['عن الوزارة', 'كيفية الإستخدام', 'التسجيل في البوابة', 'اتفاقية مستوى الخدمة', 'أمن المعلومات'].map((item, i) => (
                  <li key={i}>
                    <Link href={`/${item}`} className="flex items-center gap-2 transition-all duration-200 group" style={{ color: '#a3a3a3' }} onMouseOver={(e) => { e.currentTarget.style.color = '#ABEFCC'; e.currentTarget.style.transform = 'translateX(-4px)' }} onMouseOut={(e) => { e.currentTarget.style.color = '#a3a3a3'; e.currentTarget.style.transform = 'translateX(0)' }}>
                      <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#1B8354' }}></div>
                المنصات الرقمية
              </h3>
              <ul className="space-y-3 text-sm">
                {['الأخبار', 'الفعاليات', 'سياسة سهولة الوصول'].map((item, i) => (
                  <li key={i}>
                    <Link href={`/${item}`} className="transition-colors duration-200" style={{ color: '#a3a3a3' }} onMouseOver={(e) => e.currentTarget.style.color = '#ABEFCC'} onMouseOut={(e) => e.currentTarget.style.color = '#a3a3a3'}>{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#1B8354' }}></div>
                الدعم والمساعدة
              </h3>
              <ul className="space-y-3 text-sm">
                {['تواصل معنا', 'حجز موعد إلكتروني', 'تقديم شكوى', 'التبليغ عن الفساد', 'حرية المعلومة', 'الأسئلة الشائعة'].map((item, i) => (
                  <li key={i}>
                    <Link href={`/${item}`} className="transition-colors duration-200" style={{ color: '#a3a3a3' }} onMouseOver={(e) => e.currentTarget.style.color = '#ABEFCC'} onMouseOut={(e) => e.currentTarget.style.color = '#a3a3a3'}>{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: '#1B8354' }}></div>
                تابعنا
              </h3>
              <div className="flex gap-3">
                {['📷', '𝕏', '👻', '📘'].map((icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-200 hover:scale-110 hover:-translate-y-1" style={{ backgroundColor: '#262626' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1B8354'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#262626'}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t pt-8" style={{ borderColor: '#262626' }}>
            <p className="text-center text-sm" style={{ color: '#a3a3a3' }}>
              © ٢٠٢٥ وزارة الموارد البشرية والتنمية الاجتماعية - جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons - Professional Placement */}
      <div className="fixed bottom-8 left-8 z-50 flex flex-col gap-4">
        {/* Chat Assistant Button */}
        <ChatAssistant />
        
        {/* Voice Call Button */}
        <VoiceCallButton />
      </div>
    </div>
  )
}
