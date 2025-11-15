'use client'

import { useEffect, useState } from 'react'
import QiwaSidebar from '@/components/qiwa/QiwaSidebar'
import ProactiveNotifications from '@/components/ProactiveNotifications'
import '@/app/globals.css'

export default function QiwaIndividualsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem('user_id')
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  return (
    <>
      {/* Proactive Notifications Banner */}
      {userId && <ProactiveNotifications userId={userId} />}
      
      <QiwaSidebar />
      {children}
    </>
  )
}

