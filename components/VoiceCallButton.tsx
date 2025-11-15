'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Lazy load the panel for better performance
const VoiceCallPanel = dynamic(() => import('./VoiceCallPanel'), {
  ssr: false
})

export default function VoiceCallButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Voice Call Panel */}
      {isOpen && <VoiceCallPanel onClose={() => setIsOpen(false)} />}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-3 transition-all transform hover:scale-110 group"
        title="تحدث مع موظف الموارد البشرية"
      >
        <div className="relative">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
          </svg>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
        </div>
        <span className="font-semibold text-sm">اتصل صوتياً</span>
      </button>
    </>
  )
}

