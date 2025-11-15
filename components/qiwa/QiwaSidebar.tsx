'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import QiwaIcon from './QiwaIcon'

interface MenuItem {
  title: string
  icon: string
  href: string
}

export default function QiwaSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const menuItems: MenuItem[] = [
    { title: 'معلوماتي', icon: 'user', href: '/qiwa/individuals/profile' },
    { title: 'وظيفتي الحالية', icon: 'briefcase', href: '/qiwa/individuals/contracts' },
    { title: 'الخدمات', icon: 'document', href: '/qiwa/individuals/services' }
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-[150] w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
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
              />
            </div>
            <p className="text-center text-sm font-medium" style={{ color: 'var(--qiwa-text-secondary)' }}>
              حساب الأفراد
            </p>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="py-4 px-3">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href || 
                            (item.href !== '/qiwa/individuals/dashboard' && pathname?.startsWith(item.href))
            
            return (
              <Link
                key={index}
                href={item.href}
                className={`qiwa-sidebar-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <QiwaIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.title}</span>
                {isActive && (
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: 'var(--qiwa-blue)' }}></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all hover:bg-gray-50"
            style={{ color: 'var(--qiwa-text-secondary)' }}
          >
            <svg className="w-4 h-4 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>العودة لموقع الوزارة</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
