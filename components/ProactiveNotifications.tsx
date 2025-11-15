'use client'

import { useEffect, useState } from 'react'
import { X, AlertCircle, Calendar, FileText, Briefcase, Clock } from 'lucide-react'

interface ProactiveEvent {
  id: string
  event_type: string
  suggested_action: string
  detected_at: string
  metadata?: any
}

export default function ProactiveNotifications({ userId }: { userId: string }) {
  const [events, setEvents] = useState<ProactiveEvent[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    const fetchProactiveEvents = async () => {
      try {
        const res = await fetch(`/api/proactive/events?user_id=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Error fetching proactive events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProactiveEvents()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchProactiveEvents, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [userId])

  const handleDismiss = async (eventId: string) => {
    setDismissed(prev => new Set([...prev, eventId]))
    
    // Mark as acted in backend
    try {
      await fetch(`/api/proactive/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acted: true, action_taken: 'dismissed' })
      })
    } catch (error) {
      console.error('Error dismissing event:', error)
    }
  }

  const getIcon = (eventType: string) => {
    if (eventType.includes('contract') || eventType.includes('عقد')) return Briefcase
    if (eventType.includes('appointment') || eventType.includes('موعد')) return Calendar
    if (eventType.includes('resume') || eventType.includes('سيرة')) return FileText
    return AlertCircle
  }

  const getColor = (eventType: string) => {
    if (eventType.includes('expiring') || eventType.includes('ينتهي')) return 'amber'
    if (eventType.includes('incomplete') || eventType.includes('ناقص')) return 'blue'
    if (eventType.includes('pending') || eventType.includes('معلق')) return 'violet'
    return 'green'
  }

  const visibleEvents = events.filter(e => !dismissed.has(e.id))

  if (loading || visibleEvents.length === 0) return null

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-4 rtl:pr-4 rtl:pl-4">
      <div className="max-w-7xl mx-auto space-y-2">
        {visibleEvents.map((event) => {
          const Icon = getIcon(event.event_type)
          const color = getColor(event.event_type)
          
          const bgColors = {
            amber: 'bg-gradient-to-r from-amber-50 to-orange-50',
            blue: 'bg-gradient-to-r from-blue-50 to-cyan-50',
            violet: 'bg-gradient-to-r from-violet-50 to-purple-50',
            green: 'bg-gradient-to-r from-green-50 to-emerald-50'
          }
          
          const borderColors = {
            amber: 'border-amber-300',
            blue: 'border-blue-300',
            violet: 'border-violet-300',
            green: 'border-green-300'
          }
          
          const iconColors = {
            amber: 'text-amber-600',
            blue: 'text-blue-600',
            violet: 'text-violet-600',
            green: 'text-green-600'
          }

          return (
            <div
              key={event.id}
              className={`${bgColors[color]} ${borderColors[color]} border-2 rounded-2xl p-4 shadow-xl animate-slideDown`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`${iconColors[color]} mt-0.5 flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-900 mb-1">
                    🔔 تنبيه مهم
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {event.suggested_action}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(event.detected_at).toLocaleDateString('ar-SA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => handleDismiss(event.id)}
                  className="flex-shrink-0 p-2 hover:bg-white/50 rounded-lg transition-colors"
                  aria-label="إغلاق التنبيه"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}

