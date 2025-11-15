'use client'

import { useState, useEffect, useRef } from 'react'
import { getUserId } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
  tools_used?: string[]
  timestamp?: string
}

interface ThinkingStage {
  stage: 'thinking' | 'analyzing' | 'executing' | 'finalizing'
  message: string
  icon: string
  color: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentThinkingStage, setCurrentThinkingStage] = useState<ThinkingStage | null>(null)
  const [welcomeMessage, setWelcomeMessage] = useState<string>('')
  const [loadingWelcome, setLoadingWelcome] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch personalized welcome message on mount
  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      try {
        const userId = getUserId()
        const res = await fetch(`/api/welcome?user_id=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setWelcomeMessage(data.message)
        }
      } catch (error) {
        console.error('Error fetching welcome message:', error)
        // Fallback welcome message
        setWelcomeMessage('مرحباً بك في المساعد الذكي! 👋\n\nكيف يمكنني مساعدتك اليوم؟')
      } finally {
        setLoadingWelcome(false)
      }
    }
    fetchWelcomeMessage()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim()
    if (!messageToSend || loading) return

    setInput('')
    setShowWelcome(false)

    setMessages(prev => [...prev, {
      role: 'user',
      content: messageToSend,
      timestamp: new Date().toISOString()
    }])

    setLoading(true)

    const thinkingStages: ThinkingStage[] = [
      { stage: 'thinking', message: 'يفكر في طلبك', icon: '🤔', color: '#0A74A6' },
      { stage: 'analyzing', message: 'يحلل البيانات', icon: '🔍', color: '#0D9488' },
      { stage: 'executing', message: 'ينفذ العملية', icon: '⚡', color: '#7C3AED' },
      { stage: 'finalizing', message: 'يجهز الإجابة', icon: '✅', color: '#059669' }
    ]

    let stageIndex = 0
    setCurrentThinkingStage(thinkingStages[0])

    const thinkingInterval = setInterval(() => {
      stageIndex++
      if (stageIndex < thinkingStages.length) {
        setCurrentThinkingStage(thinkingStages[stageIndex])
      }
    }, 800)

    try {
      const userId = getUserId()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          user_id: userId,
          history: messages.slice(-10)
        })
      })

      clearInterval(thinkingInterval)
      setCurrentThinkingStage(null)

      const result = await response.json()

      if (result.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.response,
          tools_used: result.tools_used,
          timestamp: new Date().toISOString()
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: result.response || 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.',
          timestamp: new Date().toISOString()
        }])
      }
    } catch (err) {
      clearInterval(thinkingInterval)
      setCurrentThinkingStage(null)
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

  const quickQuestions = [
    'كيف أحدث سيرتي الذاتية؟',
    'كيف أصدر شهادة راتب؟',
    'كيف أحجز موعد في مكتب العمل؟'
  ]

  return (
    <div className="qiwa-page-content" style={{ padding: 0 }}>
      <div style={{ maxWidth: '100%', width: '100%', margin: '0 auto' }}>
        {showWelcome && messages.length === 0 ? (
          /* Welcome Screen */
          <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(10, 116, 166, 0.15) 1px, transparent 0)`,
                backgroundSize: '40px 40px',
                animation: 'float 20s ease-in-out infinite'
              }} />
            </div>

            {/* Header */}
            <div className="w-full max-w-4xl flex items-center justify-center mb-16 relative z-10">
              <img 
                src="/qiwalogofor-afrad.png" 
                alt="قوى" 
                className="h-20 w-auto object-contain"
              />
            </div>

            {/* Rotating 3D AI Sphere - Original Design */}
            <div className="relative mb-12 z-10">
              <div className="relative w-56 h-56">
                {/* Main Sphere */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(10, 116, 166, 0.15) 0%, rgba(0, 152, 212, 0.25) 50%, rgba(13, 148, 136, 0.15) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 20px 60px rgba(10, 116, 166, 0.3), inset 0 0 60px rgba(255, 255, 255, 0.1)',
                    animation: 'rotate3d 20s linear infinite, float 6s ease-in-out infinite'
                  }}
                >
                  {/* Inner Glow */}
                  <div 
                    className="absolute inset-4 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 50%)',
                      animation: 'pulse 3s ease-in-out infinite'
                    }}
                  />
                  
                  {/* Rotating Particles Inside */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, #0A74A6, #0098D4)',
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${i * 30}deg) translateY(-80px)`,
                        animation: `orbit ${8 + i * 0.5}s linear infinite`,
                        boxShadow: '0 0 10px rgba(10, 116, 166, 0.8)',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}

                  {/* Center AI Icon - SVG Style */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg 
                      width="120" 
                      height="120" 
                      viewBox="0 0 120 120" 
                      fill="none" 
                      style={{
                        filter: 'drop-shadow(0 0 30px rgba(10, 116, 166, 0.6))',
                        animation: 'float 3s ease-in-out infinite'
                      }}
                    >
                      {/* AI Brain/Circuit Design */}
                      <circle cx="60" cy="60" r="35" stroke="url(#aiGradient)" strokeWidth="3" fill="none" />
                      <circle cx="60" cy="60" r="25" stroke="url(#aiGradient)" strokeWidth="2" fill="none" opacity="0.6" />
                      <circle cx="60" cy="60" r="15" fill="url(#aiGradient)" opacity="0.3" />
                      
                      {/* Neural Network Lines */}
                      <line x1="60" y1="25" x2="60" y2="40" stroke="url(#aiGradient)" strokeWidth="2" />
                      <line x1="60" y1="80" x2="60" y2="95" stroke="url(#aiGradient)" strokeWidth="2" />
                      <line x1="25" y1="60" x2="40" y2="60" stroke="url(#aiGradient)" strokeWidth="2" />
                      <line x1="80" y1="60" x2="95" y2="60" stroke="url(#aiGradient)" strokeWidth="2" />
                      
                      {/* Corner Nodes */}
                      <circle cx="45" cy="45" r="4" fill="#0A74A6" />
                      <circle cx="75" cy="45" r="4" fill="#0098D4" />
                      <circle cx="45" cy="75" r="4" fill="#0D9488" />
                      <circle cx="75" cy="75" r="4" fill="#0A74A6" />
                      
                      {/* Center Pulse */}
                      <circle cx="60" cy="60" r="8" fill="#0098D4">
                        <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                      </circle>
                      
                      <defs>
                        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#0A74A6" />
                          <stop offset="50%" stopColor="#0098D4" />
                          <stop offset="100%" stopColor="#0D9488" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Rotating Rings */}
                {[0, 1, 2].map((ring) => (
                  <div
                    key={ring}
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                      borderColor: `rgba(10, 116, 166, ${0.1 - ring * 0.03})`,
                      transform: `scale(${1 + ring * 0.15})`,
                      animation: `ping ${2 + ring}s cubic-bezier(0, 0, 0.2, 1) infinite`,
                      animationDelay: `${ring * 0.3}s`
                    }}
                  />
                ))}

                {/* Orbiting Dots */}
                {[0, 1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className="absolute w-3 h-3 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #0A74A6, #0098D4)',
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${dot * 90}deg) translateY(-140px)`,
                      animation: `orbit ${10 + dot}s linear infinite reverse`,
                      boxShadow: '0 0 15px rgba(10, 116, 166, 0.8)',
                      animationDelay: `${dot * 0.5}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Welcome Text - Dynamic based on user behavior */}
            <div className="text-center mb-10 max-w-2xl relative z-10 px-4">
              {loadingWelcome ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qiwa-blue"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 animate-gradient" style={{ backgroundSize: '200% auto' }}>
                    قوى - المساعد الذكي
                  </h2>
                  <div className="text-lg leading-relaxed whitespace-pre-line" style={{ color: 'var(--qiwa-text-secondary)' }}>
                    {welcomeMessage}
                  </div>
                </>
              )}
            </div>

            {/* Quick Questions - Compact */}
            <div className="w-full max-w-3xl mb-10 relative z-10">
              <p className="text-sm mb-3 text-center" style={{ color: 'var(--qiwa-text-secondary)' }}>
                أسئلة شائعة:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(question)}
                    className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid var(--qiwa-border-light)',
                      color: 'var(--qiwa-text-primary)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--qiwa-primary)'
                      e.currentTarget.style.backgroundColor = 'white'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(10, 116, 166, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--qiwa-border-light)'
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box */}
            <div className="w-full max-w-3xl relative z-10 px-4">
              <p className="text-base font-semibold mb-4" style={{ color: 'var(--qiwa-text-primary)' }}>
                ما سؤالك؟
              </p>
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب سؤالك هنا"
                  disabled={loading}
                  className="w-full px-7 py-5 rounded-2xl text-lg focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid transparent',
                    color: 'var(--qiwa-text-primary)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--qiwa-primary)'
                    e.currentTarget.style.boxShadow = '0 8px 40px rgba(10, 116, 166, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                />
                {input.trim() && (
                  <button
                    onClick={() => handleSend()}
                    disabled={loading}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, var(--qiwa-blue) 0%, var(--qiwa-primary) 100%)',
                      boxShadow: '0 6px 25px rgba(10, 116, 166, 0.5)'
                    }}
                  >
                    <svg className="w-7 h-7 text-white transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="mt-5 p-4 rounded-xl" style={{ backgroundColor: 'rgba(234, 88, 12, 0.06)', border: '1px solid rgba(234, 88, 12, 0.15)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--qiwa-text-secondary)' }}>
                  💡 قد لا تكون الإجابات دقيقة ولا يمكن الاعتماد عليها، يُنصح بالرجوع إلى مختصين للتأكد منها.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Screen - Full Width like ChatGPT */
          <div className="flex flex-col h-screen">
            {/* Fixed Header */}
            <div className="flex-shrink-0 border-b-2 px-6 py-4" style={{ borderColor: 'var(--qiwa-border-light)', backgroundColor: 'white' }}>
              <div className="max-w-6xl mx-auto flex items-center justify-between">
                <img 
                  src="/qiwalogofor-afrad.png" 
                  alt="قوى" 
                  className="h-12 w-auto object-contain"
                />
                <button
                  onClick={() => {
                    setMessages([])
                    setShowWelcome(true)
                  }}
                  className="text-base font-medium px-6 py-2.5 rounded-xl transition-all hover:bg-gray-100"
                  style={{ color: 'var(--qiwa-text-secondary)' }}
                >
                  محادثة جديدة
                </button>
              </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="space-y-8">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="flex gap-6 animate-slideIn"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {msg.role === 'assistant' ? (
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                            style={{
                              background: 'linear-gradient(135deg, var(--qiwa-blue), var(--qiwa-primary))'
                            }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" />
                              <circle cx="12" cy="12" r="3" fill="white" />
                            </svg>
                          </div>
                        ) : (
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                            style={{
                              background: 'linear-gradient(135deg, #6B7280, #4B5563)'
                            }}
                          >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        {msg.role === 'assistant' && (
                          <div className="font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
                            مساعد قوى
                          </div>
                        )}
                        {msg.role === 'user' && (
                          <div className="font-bold mb-2" style={{ color: 'var(--qiwa-text-primary)' }}>
                            أنت
                          </div>
                        )}
                        <div 
                          className="text-base leading-relaxed whitespace-pre-wrap"
                          style={{ color: 'var(--qiwa-text-primary)' }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Thinking Animation */}
                  {currentThinkingStage && (
                    <div className="flex gap-6 animate-slideIn">
                      <div className="flex-shrink-0">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                          style={{
                            background: 'linear-gradient(135deg, var(--qiwa-blue), var(--qiwa-primary))'
                          }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" />
                            <circle cx="12" cy="12" r="3" fill="white" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold mb-2" style={{ color: 'var(--qiwa-primary)' }}>
                          مساعد قوى
                        </div>
                        <div 
                          className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl"
                          style={{ 
                            backgroundColor: `${currentThinkingStage.color}10`,
                            border: `2px solid ${currentThinkingStage.color}`
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center animate-spin"
                            style={{
                              border: `2px solid ${currentThinkingStage.color}`,
                              borderTopColor: 'transparent'
                            }}
                          />
                          <div>
                            <div className="text-sm font-bold" style={{ color: currentThinkingStage.color }}>
                              {currentThinkingStage.message}
                            </div>
                            <div className="flex gap-1 mt-1">
                              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: currentThinkingStage.color, animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: currentThinkingStage.color, animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: currentThinkingStage.color, animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Fixed Input Area */}
            <div className="flex-shrink-0 border-t px-6 py-6" style={{ borderColor: 'var(--qiwa-border-light)', backgroundColor: 'white' }}>
              <div className="max-w-6xl mx-auto relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب سؤالك هنا..."
                  disabled={loading}
                  rows={1}
                  className="w-full px-6 py-4 rounded-2xl border-2 text-base focus:outline-none transition-all resize-none"
                  style={{
                    borderColor: 'var(--qiwa-border-light)',
                    color: 'var(--qiwa-text-primary)',
                    minHeight: '60px',
                    maxHeight: '200px'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--qiwa-primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(10, 116, 166, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--qiwa-border-light)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                {input.trim() && (
                  <button
                    onClick={() => handleSend()}
                    disabled={loading}
                    className="absolute left-4 bottom-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, var(--qiwa-blue) 0%, var(--qiwa-primary) 100%)',
                      boxShadow: '0 4px 15px rgba(10, 116, 166, 0.4)'
                    }}
                  >
                    <svg className="w-5 h-5 text-white transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
