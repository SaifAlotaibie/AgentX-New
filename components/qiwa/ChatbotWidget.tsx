'use client'

import { useState, useEffect, useRef } from 'react'
import { getUserId } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
  tools_used?: string[]
  timestamp?: string
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [proactiveAlerts, setProactiveAlerts] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Load initial proactive suggestions
      loadProactiveAlerts()
      
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: 'مرحباً بك في المساعد الذكي لقوى! 👋\n\nكيف يمكنني مساعدتك اليوم؟',
        timestamp: new Date().toISOString()
      }])
    }
  }, [isOpen])

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
        setProactiveAlerts(result.data.map((e: any) => e.event_type))
      }
    } catch (err) {
      console.error('Error loading proactive alerts:', err)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
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
          history: messages.slice(-10) // Last 10 messages for context
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

        // Update proactive alerts if any
        if (result.proactive_suggestions && result.proactive_suggestions.length > 0) {
          setProactiveAlerts(result.proactive_suggestions)
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.',
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

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          style={{ background: 'linear-gradient(135deg, #0060ff 0%, #20183b 100%)' }}
          aria-label="فتح المساعد الذكي"
        >
          <span className="text-3xl">💬</span>
          {proactiveAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
              {proactiveAlerts.length}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-6 left-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ maxWidth: 'calc(100vw - 48px)', maxHeight: 'calc(100vh - 48px)' }}
        >
          {/* Header */}
          <div 
            className="p-4 text-white flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #0060ff 0%, #20183b 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-lg">المساعد الذكي</h3>
                <p className="text-xs text-white/80">منصة قوى</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Proactive Alerts */}
          {proactiveAlerts.length > 0 && (
            <div className="p-3 bg-yellow-50 border-b border-yellow-200">
              <p className="text-xs font-bold text-yellow-800 mb-2">🔔 تنبيهات مهمة:</p>
              {proactiveAlerts.slice(0, 2).map((alert, i) => (
                <p key={i} className="text-xs text-yellow-700">• {alert}</p>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  style={msg.role === 'assistant' ? { direction: 'rtl' } : {}}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  
                  {msg.tools_used && msg.tools_used.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 font-bold">أدوات مستخدمة:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.tools_used.map((tool, i) => (
                          <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                disabled={loading}
                style={{ direction: 'rtl' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

