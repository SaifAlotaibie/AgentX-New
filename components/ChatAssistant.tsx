'use client'

import { useState } from 'react'

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Help Button */}
      <button
        className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        style={{ color: isOpen ? 'var(--qiwa-primary)' : '#6B7280' }}
        aria-label="المساعد الذكي"
      >
        <span className="text-xl font-bold">!</span>
      </button>

      {/* Info Tooltip on Hover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-4 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 transform origin-top-left animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#006341] to-[#00A878] text-white px-5 py-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-base">المساعد الذكي</h3>
                <p className="text-[10px] text-white/80">متاح لخدمتك 24/7</p>
              </div>
            </div>
          </div>

          {/* Welcome Content */}
          <div className="p-5 text-right">
            <p className="text-gray-800 font-bold text-base mb-3">مرحباً بك! 👋</p>
            <p className="text-gray-700 text-sm mb-4">أنا المساعد الذكي لمنصة قوى، هنا لمساعدتك في جميع خدماتك.</p>
            <p className="text-gray-800 font-semibold text-sm mb-2">📋 يمكنني مساعدتك في:</p>
            <ul className="text-gray-600 text-sm space-y-1.5 mb-4">
              <li>• إصدار الشهادات فوراً 📄</li>
              <li>• حجز المواعيد 📅</li>
              <li>• إدارة العقود 💼</li>
              <li>• فتح ومتابعة التذاكر 🎫</li>
              <li>• تحديث السيرة الذاتية 📝</li>
            </ul>
            <p className="text-gray-700 text-sm font-medium">كيف يمكنني مساعدتك اليوم؟</p>
          </div>

        </div>
      )}
    </div>
  )
}
