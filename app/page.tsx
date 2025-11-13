'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import UserProfileForm from '@/components/UserProfileForm'
import { getUserId, getUserProfile, type UserProfile } from '@/lib/supabase'

// Lazy load heavy components
const VoiceCallButton = dynamic(() => import('@/components/VoiceCallButton'), {
  ssr: false // Voice feature requires browser APIs
})

const Services = dynamic(() => import('@/components/Services'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
})

const News = dynamic(() => import('@/components/News'), {
  loading: () => <div className="min-h-[400px] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
})

const Footer = dynamic(() => import('@/components/Footer'))

const ChatAssistant = dynamic(() => import('@/components/ChatAssistant'), {
  ssr: false // Chat assistant should only load on client
})

export default function Home() {
  const [isCheckingUser, setIsCheckingUser] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    checkUserRegistration()
  }, [])

  const checkUserRegistration = async () => {
    try {
      const userId = getUserId()
      const profile = await getUserProfile(userId)
      
      setUserProfile(profile)
      setIsCheckingUser(false)

      // Show welcome message briefly if user exists
      if (profile) {
        setShowWelcome(true)
        setTimeout(() => setShowWelcome(false), 3000)
      }
    } catch (error) {
      console.error('Error checking user registration:', error)
      setIsCheckingUser(false)
    }
  }

  const handleRegistrationSuccess = (fullName: string) => {
    setUserProfile({ user_id: getUserId(), full_name: fullName })
    setShowWelcome(true)
    setTimeout(() => setShowWelcome(false), 3000)
  }

  // Loading state
  if (isCheckingUser) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#006341] mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Show registration form if user not registered
  if (!userProfile) {
    return <UserProfileForm onSuccess={handleRegistrationSuccess} />
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Welcome Message */}
      {showWelcome && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-[#006341] to-[#00A878] text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👋</span>
              <p className="font-bold text-lg">
                مرحباً {userProfile.full_name}، سعيد برجعتك!
              </p>
            </div>
          </div>
        </div>
      )}

      <Header />
      <Hero />
      
      {/* Qiwa Platform Button */}
      <section className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <VoiceCallButton />
          
          <a 
            href="/qiwa"
            className="group relative text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #20183b 0%, #0a0e14 100%)' }}
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
            </svg>
            <span>منصة قوى</span>
            <span className="text-sm bg-white/20 px-2 py-1 rounded-lg">جديد</span>
          </a>
        </div>
      </section>
      
      <Services />
      <News />
      <Footer />
      <ChatAssistant />

      {/* Fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px) translateX(-50%);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(-50%);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </main>
  )
}
