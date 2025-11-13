'use client'

import { useState } from 'react'
import { createUserProfile, getUserId } from '@/lib/supabase'

interface UserProfileFormProps {
  onSuccess: (fullName: string) => void
}

export default function UserProfileForm({ onSuccess }: UserProfileFormProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim()) {
      setError('الرجاء إدخال الاسم الكامل')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const userId = getUserId()
      
      const success = await createUserProfile({
        user_id: userId,
        full_name: fullName.trim(),
        phone: phone.trim() || undefined
      })

      if (success) {
        onSuccess(fullName.trim())
      } else {
        setError('حدث خطأ في التسجيل. يرجى المحاولة مرة أخرى.')
      }
    } catch (err) {
      console.error('Registration error:', err)
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#006341]/20 to-[#00A878]/20 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-[#006341]/10">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#006341] to-[#00A878] text-white px-8 py-6 text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">مرحباً بك!</h2>
          <p className="text-white/90 text-sm">يرجى إدخال بياناتك للمتابعة</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#006341] focus:outline-none transition-colors text-right"
              disabled={isLoading}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              رقم الجوال <span className="text-gray-400 text-xs">(اختياري)</span>
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#006341] focus:outline-none transition-colors text-right"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#006341] to-[#00A878] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>جاري التسجيل...</span>
              </>
            ) : (
              <>
                <span>متابعة</span>
                <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Info Text */}
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            بياناتك محمية ولن تُستخدم إلا لتحسين خدمة المساعد الذكي
          </p>
        </form>
      </div>
    </div>
  )
}

