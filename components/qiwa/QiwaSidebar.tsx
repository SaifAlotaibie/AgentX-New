'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import QiwaIcon from './QiwaIcon'

interface SidebarItem {
  icon: string
  label: string
  href: string
}

export default function QiwaSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems: SidebarItem[] = [
    { icon: 'user', label: 'معلوماتي', href: '/qiwa/individuals/profile' },
    { icon: 'briefcase', label: 'وظيفتي الحالية', href: '/qiwa/individuals/contracts' },
    { icon: 'document', label: 'الخدمات', href: '/qiwa/individuals' },
    { icon: 'documentText', label: 'السيرة الذاتية', href: '/qiwa/individuals/resume' },
    { icon: 'ticket', label: 'التذاكر', href: '/qiwa/individuals/tickets' },
    { icon: 'calendar', label: 'المواعيد', href: '/qiwa/individuals/appointments' },
    { icon: 'home2', label: 'العمالة المنزلية', href: '/qiwa/individuals/domestic' },
    { icon: 'briefcase', label: 'العقود', href: '/qiwa/individuals/contracts' },
    { icon: 'badge', label: 'الشهادات', href: '/qiwa/individuals/certificates/salary' },
    { icon: 'book', label: 'اللوائح', href: '/qiwa/individuals/regulations' },
    { icon: 'chat', label: 'المساعد الذكي', href: '/qiwa/individuals/chatbot' },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[150] w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        style={{ color: 'var(--qiwa-primary)' }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`qiwa-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo Section */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <Link href="/qiwa/individuals" className="block" onClick={() => setIsOpen(false)}>
            <div className="flex items-center justify-center mb-3">
              <img 
                src="/qiwalogofor-afrad.png" 
                alt="قوى - حساب الأفراد" 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  // Fallback if image not found
                  e.currentTarget.style.display = 'none'
                  const fallback = document.createElement('div')
                  fallback.className = 'text-2xl font-bold text-center'
                  fallback.style.color = 'var(--qiwa-primary)'
                  fallback.textContent = 'قوى'
                  e.currentTarget.parentNode?.appendChild(fallback)
                }}
              />
            </div>
            <p className="text-center text-sm font-medium" style={{ color: 'var(--qiwa-text-secondary)' }}>
              حساب الأفراد
            </p>
          </Link>
        </div>

        {/* User Info Card */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ background: 'linear-gradient(135deg, var(--qiwa-blue) 0%, var(--qiwa-primary) 100%)' }}
            >
              س
            </div>
            <div className="flex-1">
              <p className="font-bold text-base" style={{ color: 'var(--qiwa-primary)' }}>سيف العتيبي</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--qiwa-text-secondary)' }}>حساب فردي</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="py-2 px-3">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || 
                            (item.href !== '/qiwa/individuals' && pathname?.startsWith(item.href))
            
            return (
              <Link
                key={index}
                href={item.href}
                className={`qiwa-sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <QiwaIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: 'var(--qiwa-blue)' }}></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all hover:bg-gray-50"
            style={{ color: 'var(--qiwa-text-secondary)' }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>العودة لموقع الوزارة</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
