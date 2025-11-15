'use client'

import Link from 'next/link'
import QiwaIcon from '@/components/qiwa/QiwaIcon'

export default function ServicesPage() {
  const servicesGroups = [
    {
      title: 'إصدار المستندات',
      services: [
        {
          title: 'شهادة التعريف بالراتب',
          description: 'قم بإثبات وظيفتك الحالية وراتبك.',
          icon: 'badge',
          href: '/qiwa/individuals/certificates/salary',
          color: '#0A74A6'
        },
        {
          title: 'شهادة الخدمة',
          description: 'قم بإثبات خبرتك المهنية السابقة.',
          icon: 'badge',
          href: '/qiwa/individuals/certificates/service',
          color: '#0D9488'
        }
      ]
    },
    {
      title: 'إدارة سيرتك الذاتية',
      services: [
        {
          title: 'إدارة السيرة الذاتية',
          description: 'أنشئ سيرتك الذاتية وقم بإدارتها.',
          icon: 'documentText',
          href: '/qiwa/individuals/resume',
          color: '#7C3AED'
        },
        {
          title: 'مشاركة السيرة الذاتية',
          description: 'أنشئ رابط وصول لسيرتك الذاتية لمشاركتها مع مسؤولي التوظيف.',
          icon: 'share',
          href: '/qiwa/individuals/resume/share',
          color: '#DC2626'
        },
        {
          title: 'إدارة الدورات التدريبية',
          description: 'أضف الدورات التدريبية إلى سيرتك الذاتية لتعزيز مؤهلاتك وخبراتك.',
          icon: 'book',
          href: '/qiwa/individuals/resume/courses',
          color: '#EA580C'
        }
      ]
    },
    {
      title: 'مواعيد مكتب العمل',
      services: [
        {
          title: 'المواعيد بمكتب العمل',
          description: 'احجز موعدًا لزيارة مكتب العمل.',
          icon: 'calendar',
          href: '/qiwa/individuals/appointments',
          color: '#059669'
        }
      ]
    }
  ]

  return (
    <div className="qiwa-page-content">
      <div className="qiwa-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
            الخدمات
          </h1>
          <p className="text-base" style={{ color: 'var(--qiwa-text-secondary)' }}>
            جميع الخدمات المتاحة لك في منصة قوى
          </p>
        </div>

        {/* Services Groups */}
        <div className="space-y-8">
          {servicesGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-2xl shadow-md p-6 md:p-8 border" style={{ borderColor: 'var(--qiwa-border-light)' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--qiwa-primary)' }}>
                {group.title}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.services.map((service, serviceIndex) => (
                  <Link key={serviceIndex} href={service.href}>
                    <div 
                      className="group relative p-6 rounded-xl border-2 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                      style={{ borderColor: 'var(--qiwa-border-light)' }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = service.color}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--qiwa-border-light)'}
                    >
                      {/* Background Gradient on Hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                        style={{ background: `linear-gradient(135deg, ${service.color}, transparent)` }}
                      ></div>

                      {/* Content */}
                      <div className="relative z-10 flex items-start gap-4">
                        <div 
                          className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: `${service.color}15` }}
                        >
                          <QiwaIcon name={service.icon} className="w-7 h-7" style={{ color: service.color }} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold mb-2" style={{ color: 'var(--qiwa-text-primary)' }}>
                            {service.title}
                          </h3>
                          <p className="text-sm" style={{ color: 'var(--qiwa-text-secondary)' }}>
                            {service.description}
                          </p>
                        </div>

                        {/* Arrow Icon */}
                        <svg 
                          className="flex-shrink-0 w-5 h-5 transform rotate-180 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          strokeWidth={2}
                          style={{ color: service.color }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

