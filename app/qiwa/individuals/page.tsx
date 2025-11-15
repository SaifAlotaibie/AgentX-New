'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function IndividualsHomePage() {
  const router = useRouter()
  
  useEffect(() => {
    // توجيه المستخدم مباشرة للشات بوت
    router.push('/qiwa/individuals/chatbot')
  }, [router])

  return (
    <div className="qiwa-page-content flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--qiwa-primary)' }}></div>
        <p style={{ color: 'var(--qiwa-text-secondary)' }}>جاري التحميل...</p>
      </div>
    </div>
  )
}
