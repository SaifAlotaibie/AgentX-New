'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export interface HRSDNavProps {
  logo?: React.ReactNode
  title?: string
}

export const HRSDNav: React.FC<HRSDNavProps> = ({
  logo,
  title = 'وزارة الموارد البشرية والتنمية الاجتماعية'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const mainNavItems = [
    { label: 'الرئيسية', href: '/', icon: '🏠' },
    { label: 'الوزارة', href: '/about', icon: '🏛️' },
    { label: 'خدمات الوزارة', href: '/qiwa', icon: '💼' },
    { label: 'نهتم بكم', href: '/care', icon: '❤️' },
    { label: 'مركز المعرفة', href: '/knowledge', icon: '📚' },
    { label: 'المركز الإعلامي', href: '/media', icon: '📰' },
    { label: 'تواصل معنا', href: '/contact', icon: '📞' },
  ]
  
  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="hrsd-container">
          <div className="flex items-center justify-between h-10 text-xs md:text-sm">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">موقع حكومي رسمي</span>
              </div>
              <span className="hidden md:inline text-white/70">|</span>
              <Link href="/verify" className="hidden md:inline hover:text-secondary transition-colors">
                كيف تتحقق
              </Link>
            </div>
            
            <div className="flex items-center gap-3 md:gap-5">
              <button 
                className="hover:text-secondary transition-colors flex items-center gap-1"
                title="إمكانية الوصول"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden md:inline text-xs">إمكانية الوصول</span>
              </button>
              
              <button className="hover:text-secondary transition-colors font-sans font-semibold px-2 py-1 rounded bg-white/10 hover:bg-white/20">
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className={`bg-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-hrsd-lg' : 'shadow-hrsd'}`}>
        <div className="hrsd-container">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 md:gap-4 group">
              {logo ? (
                logo
              ) : (
                <>
                  <div className="relative">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-hrsd-md group-hover:shadow-hrsd-lg transition-all duration-300 group-hover:scale-105">
                      <span className="text-3xl md:text-4xl">🇸🇦</span>
                    </div>
                    {/* Decorative ring */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary/20 animate-pulse"></div>
                  </div>
                  <div className="text-right">
                    <div className="text-base md:text-lg font-bold text-text-primary leading-tight group-hover:text-primary transition-colors">
                      {title}
                    </div>
                    <div className="text-xs text-text-secondary font-sans mt-1 flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                      <span>HRSD · Ministry Portal</span>
                    </div>
                  </div>
                </>
              )}
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-1">
              {mainNavItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative px-4 py-2.5 text-text-primary hover:text-primary rounded-xl transition-all duration-200 font-medium"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  {/* Active indicator */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary rounded-full group-hover:w-3/4 transition-all duration-300"></div>
                </Link>
              ))}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="xl:hidden p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="xl:hidden py-4 border-t border-border animate-[slideIn_0.3s_ease-out]">
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-text-primary hover:text-primary hover:bg-primary-50 rounded-xl transition-all duration-200 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
