'use client'

import { useState, useEffect, useRef } from 'react'
import QiwaSidebar from '@/components/qiwa/QiwaSidebar'
import { getUserId } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
  tools_used?: string[]
  timestamp?: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [proactiveAlerts, setProactiveAlerts] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadProactiveAlerts()
    setMessages([{
      role: 'assistant',
      content: 'مرحباً بك في المساعد الذكي! 👋\n\nأنا وكيل رقمي متطور أساعدك في:\n• إصدار الشهادات فوراً 📄\n• حجز المواعيد 📅\n• إدارة العقود 💼\n• فتح ومتابعة التذاكر 🎫\n• تحديث السيرة الذاتية 📝\n\nكيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date().toISOString()
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadProactiveAlerts = async () => {
    try {
      const userId = getUserId()
      const response = await fetch(`/api/qiwa/proactive?user_id=${userId}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setProactiveAlerts(result.data)
      }
    } catch (err) {
      console.error('Error loading proactive alerts:', err)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }])

    setLoading(true)

    try {
      const userId = getUserId()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          user_id: userId,
          history: messages.slice(-10)
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.response,
          tools_used: result.tools_used,
          timestamp: new Date().toISOString()
        }])

        if (result.proactive_suggestions && result.proactive_suggestions.length > 0) {
          setProactiveAlerts(result.proactive_suggestions)
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.response || 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.',
          timestamp: new Date().toISOString()
        }])
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ في الاتصال. تأكد من اتصالك بالإنترنت.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { label: 'إصدار شهادة راتب', message: 'ابي اصدر شهادة راتب' },
    { label: 'حجز موعد', message: 'ابي احجز موعد في مكتب العمل' },
    { label: 'تجديد عقد', message: 'ابي اجدد عقدي' },
    { label: 'فتح تذكرة', message: 'ابي افتح تذكرة دعم' }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--qiwa-bg-soft)' }}>
      <QiwaSidebar />

      <main className="qiwa-main-content">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl qiwa-gradient-blue">
              🤖
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--qiwa-primary)' }}>
                المساعد الذكي
              </h1>
              <p style={{ color: 'var(--qiwa-text-secondary)' }}>
                وكيل رقمي ذكي لخدماتك على منصة قوى
              </p>
            </div>
          </div>
        </div>

        {/* Proactive Alerts */}
        {proactiveAlerts.length > 0 && (
          <div className="qiwa-card mb-6" style={{ backgroundColor: '#FFF9E6', border: '2px solid var(--qiwa-yellow)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔔</span>
              <p className="font-bold" style={{ color: 'var(--qiwa-primary)' }}>تنبيهات مهمة:</p>
            </div>
            <div className="space-y-2">
              {proactiveAlerts.slice(0, 3).map((alert, i) => (
                <p key={i} className="text-sm font-medium" style={{ color: 'var(--qiwa-text-primary)' }}>
                  • {alert.event_type}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="qiwa-card" style={{ height: 'calc(100vh - 300px)', display: 'flex', flexDirection: 'column' }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] px-6 py-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-white border-2'
                      : 'text-white qiwa-gradient-blue'
                  }`}
                  style={msg.role === 'user' ? { borderColor: 'var(--qiwa-border-light)' } : {}}
                >
                  <p className="whitespace-pre-wrap leading-relaxed" style={msg.role === 'user' ? { color: 'var(--qiwa-text-primary)' } : {}}>
                    {msg.content}
                  </p>
                  
                  {msg.tools_used && msg.tools_used.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-xs font-bold mb-2">🛠️ أدوات مستخدمة:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.tools_used.map((tool, i) => (
                          <span key={i} className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs mt-3 opacity-70">
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-end">
                <div className="bg-white border-2 px-6 py-4 rounded-2xl" style={{ borderColor: 'var(--qiwa-border-light)' }}>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--qiwa-blue)', animationDelay: '0ms' }}></span>
                    <span className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--qiwa-blue)', animationDelay: '150ms' }}></span>
                    <span className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'var(--qiwa-blue)', animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-6 py-4 border-t" style={{ borderColor: 'var(--qiwa-border-light)' }}>
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--qiwa-text-secondary)' }}>إجراءات سريعة:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(action.message)
                      setTimeout(() => handleSend(), 100)
                    }}
                    className="px-4 py-2 bg-white border-2 rounded-lg text-sm font-semibold hover:bg-blue-50 qiwa-transition"
                    style={{ borderColor: 'var(--qiwa-blue)', color: 'var(--qiwa-blue)' }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t" style={{ borderColor: 'var(--qiwa-border-light)' }}>
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا... (Enter للإرسال)"
                className="qiwa-input resize-none"
                disabled={loading}
                rows={2}
                style={{ minHeight: '60px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="qiwa-btn-primary"
                style={{ minWidth: '120px' }}
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
