'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showServicesMenu, setShowServicesMenu] = useState(false)

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-white py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex gap-4">
            <Link href="#" className="hover:text-accent">English</Link>
            <Link href="#" className="hover:text-accent">تسجيل الدخول</Link>
          </div>
          <div className="flex gap-4">
            <span>الرقم الموحد: 19911</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">وزارة الموارد البشرية</h1>
                <p className="text-sm text-gray-600">والتنمية الاجتماعية</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex gap-8">
              <Link href="/" className="text-gray-700 hover:text-primary font-semibold">الرئيسية</Link>
              <div 
                className="relative"
                onMouseEnter={() => setShowServicesMenu(true)}
                onMouseLeave={() => setShowServicesMenu(false)}
              >
                <button className="text-gray-700 hover:text-primary font-semibold flex items-center gap-1">
                  الخدمات
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
                {showServicesMenu && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white shadow-lg rounded-lg py-2 z-50">
                    <Link href="/qiwa" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 border-b">
                      <div className="font-semibold text-primary">منصة قوى</div>
                      <div className="text-sm text-gray-600">خدمات سوق العمل</div>
                    </Link>
                    <Link href="#" className="block px-4 py-3 hover:bg-gray-50 text-gray-700">خدمات التوظيف</Link>
                    <Link href="#" className="block px-4 py-3 hover:bg-gray-50 text-gray-700">خدمات التنمية الاجتماعية</Link>
                    <Link href="#" className="block px-4 py-3 hover:bg-gray-50 text-gray-700">خدمات ذوي الإعاقة</Link>
                  </div>
                )}
              </div>
              <Link href="#" className="text-gray-700 hover:text-primary font-semibold">عن الوزارة</Link>
              <Link href="#" className="text-gray-700 hover:text-primary font-semibold">الأخبار</Link>
              <Link href="#" className="text-gray-700 hover:text-primary font-semibold">اتصل بنا</Link>
            </nav>

            {/* Search and Mobile Menu */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <Link href="/" className="block py-2 text-gray-700 hover:text-primary">الرئيسية</Link>
              <Link href="/qiwa" className="block py-2 text-primary font-semibold">منصة قوى</Link>
              <Link href="#" className="block py-2 text-gray-700 hover:text-primary">الخدمات</Link>
              <Link href="#" className="block py-2 text-gray-700 hover:text-primary">عن الوزارة</Link>
              <Link href="#" className="block py-2 text-gray-700 hover:text-primary">الأخبار</Link>
              <Link href="#" className="block py-2 text-gray-700 hover:text-primary">اتصل بنا</Link>
            </div>
          )}
        </div>
      </header>
    </>
  )
}

