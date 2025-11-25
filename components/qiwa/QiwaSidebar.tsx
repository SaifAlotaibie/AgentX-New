'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import QiwaIcon from './QiwaIcon'
import ChatAssistant from '../ChatAssistant'

interface MenuItem {
  title: string
  icon: string
  href: string
}

export default function QiwaSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false) // Mobile state
  const [isCollapsed, setIsCollapsed] = useState(false) // Desktop state

  const menuItems: MenuItem[] = [
    { title: 'معلوماتي', icon: 'user', href: '/qiwa/individuals/profile' },
    { title: 'وظيفتي الحالية', icon: 'briefcase', href: '/qiwa/individuals/contracts' },
    { title: 'الخدمات', icon: 'document', href: '/qiwa/individuals/services' }
  ]

  // Handle desktop collapse - Update CSS variable
  useEffect(() => {
    const root = document.documentElement
    if (isCollapsed) {
      root.style.setProperty('--qiwa-sidebar-width', '80px')
    } else {
      root.style.setProperty('--qiwa-sidebar-width', '280px')
    }
  }, [isCollapsed])

  return (
    <>
      {/* Top Bar with Menu Toggle and Help (Mobile Only) */}
      <div className="lg:hidden fixed top-4 right-4 z-[150] flex items-center gap-2">
        {/* Help Button */}
        <ChatAssistant />

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
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
      </div>

      {/* Overlay (Mobile Only) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`qiwa-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Desktop Toggle Button - Top Right Corner - ANIMATED */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute top-4 right-4 items-center justify-center w-12 h-12 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 z-50 group"
          style={{
            background: isCollapsed
              ? 'linear-gradient(135deg, #059669, #10b981)'
              : 'linear-gradient(135deg, var(--qiwa-primary), var(--qiwa-blue))',
            color: 'white'
          }}
        >
          <div className="relative w-6 h-6">
            {isCollapsed ? (
              /* Expand Arrow */
              <svg className="absolute inset-0 animate-in fade-in duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              /* Collapse Arrow */
              <svg className="absolute inset-0 animate-in fade-in duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </div>
        </button>

        {/* Logo Section */}
        <div className={`p-6 border-b transition-all duration-300 ${isCollapsed ? 'px-3 py-4' : ''}`} style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <Link href="/qiwa/individuals" className="block" onClick={() => setIsOpen(false)}>
            <div className={`flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'h-12 mb-0' : 'mb-3 h-16'}`}>
              <img
                src="/qiwalogofor-afrad.png"
                alt="قوى - حساب الأفراد"
                className={`transition-all duration-300 object-contain ${isCollapsed ? 'w-8 h-8' : 'h-16 w-auto'}`}
              />
            </div>
            <p
              className={`text-center text-sm font-medium transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 mt-2'}`}
              style={{ color: 'var(--qiwa-text-secondary)' }}
            >
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
              <div key={index} className="relative group/item">
                <Link
                  href={item.href}
                  className={`qiwa-sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-2' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <QiwaIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                  <span className={`flex-1 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                    {item.title}
                  </span>
                  {isActive && !isCollapsed && (
                    <div className="w-1 h-6 rounded-full" style={{ backgroundColor: 'var(--qiwa-blue)' }}></div>
                  )}
                </Link>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="hidden lg:block absolute right-full top-1/2 -translate-y-1/2 mr-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-[60]">
                    {item.title}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-px border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4 transition-all duration-300" style={{ borderColor: 'var(--qiwa-border-light)' }}>
          <div className="relative group/footer">
            <Link
              href="/"
              className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-all hover:bg-gray-50 ${isCollapsed ? 'justify-center px-2' : 'justify-center'}`}
              style={{ color: 'var(--qiwa-text-secondary)' }}
            >
              <svg className="w-4 h-4 transform rotate-180 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className={`transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                العودة لموقع الوزارة
              </span>
            </Link>

            {/* Tooltip for footer in collapsed state */}
            {isCollapsed && (
              <div className="hidden lg:block absolute right-full top-1/2 -translate-y-1/2 mr-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover/footer:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-[60]">
                العودة لموقع الوزارة
                <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-px border-4 border-transparent border-r-gray-900"></div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
