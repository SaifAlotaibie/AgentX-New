'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Lazy load the panel for better performance
const VoiceCallPanel = dynamic(() => import('./VoiceCallPanel'), {
  ssr: false
})

export default function VoiceCallButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [showTest, setShowTest] = useState(false)

  const testVoice = () => {
    console.log('🧪 Testing voice...')
    if ('speechSynthesis' in window) {
      // Get all voices
      const voices = window.speechSynthesis.getVoices()
      console.log('📢 Total voices available:', voices.length)
      
      if (voices.length === 0) {
        console.warn('⚠️ No voices loaded yet. Waiting...')
        // Try again after a delay
        setTimeout(() => {
          const voicesRetry = window.speechSynthesis.getVoices()
          console.log('📢 Voices after retry:', voicesRetry.length)
          if (voicesRetry.length > 0) {
            console.log('✅ Voices loaded! List:')
            voicesRetry.forEach((v, i) => {
              console.log(`  ${i + 1}. ${v.name} (${v.lang}) ${v.default ? '⭐ DEFAULT' : ''}`)
            })
          } else {
            console.error('❌ Still no voices available!')
            alert('⚠️ لا توجد أصوات متاحة في المتصفح!\n\nالحل:\n1. أضف صوت عربي في Windows\n2. أو استخدم Chrome/Edge')
          }
        }, 100)
      } else {
        console.log('📋 Available voices:')
        voices.forEach((v, i) => {
          const isArabic = v.lang.includes('ar') || v.lang.includes('AR')
          console.log(`  ${i + 1}. ${v.name} (${v.lang}) ${isArabic ? '🌟 ARABIC' : ''} ${v.default ? '⭐ DEFAULT' : ''}`)
        })
      }
      
      const arabicVoice = voices.find(v => v.lang.includes('ar') || v.lang.includes('AR'))
      
      if (!arabicVoice && voices.length > 0) {
        console.warn('⚠️ No Arabic voice found! Will use default voice.')
        console.log('💡 To add Arabic voice: Windows Settings → Time & Language → Speech → Add voices')
      } else if (arabicVoice) {
        console.log('✅ Found Arabic voice:', arabicVoice.name)
      }
      
      const utterance = new SpeechSynthesisUtterance('Hello, this is a test. مرحباً، هذا اختبار للصوت')
      utterance.lang = arabicVoice ? arabicVoice.lang : 'ar-SA'
      utterance.rate = 0.9
      utterance.volume = 1.0
      utterance.pitch = 1.0
      
      if (arabicVoice) {
        utterance.voice = arabicVoice
      } else if (voices.length > 0) {
        utterance.voice = voices[0] // Use first available voice
        console.log('🔄 Using fallback voice:', voices[0].name)
      }
      
      utterance.onstart = () => {
        console.log('✅ Voice test started')
        console.log('   Voice:', utterance.voice?.name || 'default')
        console.log('   Lang:', utterance.lang)
      }
      utterance.onend = () => {
        console.log('✅ Voice test completed')
      }
      utterance.onerror = (e) => {
        console.error('❌ Voice test error:', e.error)
        alert('❌ خطأ في الصوت: ' + e.error)
      }
      
      console.log('🎤 Speaking now...')
      window.speechSynthesis.speak(utterance)
      
      setTimeout(() => {
        alert('تحقق من Console (F12) لمعرفة التفاصيل.\n\nإذا لم تسمع صوت:\n• قد لا يوجد صوت عربي مثبت\n• جرب إضافة صوت عربي في إعدادات Windows')
      }, 500)
    } else {
      alert('❌ المتصفح لا يدعم تحويل النص إلى صوت')
    }
  }

  return (
    <>
      {/* Voice Call Panel */}
      {isOpen && <VoiceCallPanel onClose={() => setIsOpen(false)} />}

      {/* Floating Buttons */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-3 z-40">
        {/* Main Call Button */}
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

        {/* Test Voice Button */}
        <button
          onClick={testVoice}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2 transition-all text-xs"
          title="اختبر الصوت"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <span>اختبر الصوت</span>
        </button>
      </div>
    </>
  )
}

