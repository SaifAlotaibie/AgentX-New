'use client'

import { useState, useRef, useEffect } from 'react'
import { speakArabic, stopSpeaking } from '@/utils/speak'
import { getUserId } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface VoiceCallPanelProps {
  onClose: () => void
}

export default function VoiceCallPanel({ onClose }: VoiceCallPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [callStatus, setCallStatus] = useState<string>('connecting')
  const [voiceDetected, setVoiceDetected] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const maxRecordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const hasGreetedRef = useRef(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start call automatically
  useEffect(() => {
    if (!hasGreetedRef.current) {
      hasGreetedRef.current = true
      startCall()
    }
    
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    stopSpeaking()
    
    // Clear all timers
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current)
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
    }
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current)
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {}
    }
    
    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close()
      } catch (e) {}
    }
  }

  const startCall = async () => {
    try {
      setCallStatus('connecting')
      
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'greeting' }),
      })

      const data = await response.json()

      if (data.aiText) {
        setMessages([{ role: 'assistant', content: data.aiText }])
        setCallStatus('speaking')
        setIsSpeaking(true)
        
        speakArabic(data.aiText, () => {
          setIsSpeaking(false)
          setCallStatus('listening')
          startRecording()
        })
      }
    } catch (err: any) {
      console.error('❌ Call error:', err)
      setCallStatus('error')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
      
      streamRef.current = stream
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        stopVAD()
        processVoice()
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setCallStatus('recording')
      
      // ✅ Start Voice Activity Detection
      startVAD(stream)
      
      // ⏱️ Max recording time: 6 seconds (safety limit)
      maxRecordingTimerRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          console.log('⏱️ Max time (6s)')
          mediaRecorder.stop()
          setIsRecording(false)
        }
      }, 6000)
      
    } catch (err: any) {
      console.error('❌ Mic error:', err)
      setCallStatus('error')
    }
  }

  const startVAD = (stream: MediaStream) => {
    try {
      // Create audio context for voice activity detection
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      
      const source = audioContext.createMediaStreamSource(stream)
      const analyzer = audioContext.createAnalyser()
      analyzer.fftSize = 2048
      analyzer.smoothingTimeConstant = 0.8
      
      source.connect(analyzer)
      analyzerRef.current = analyzer
      
      console.log('✅ VAD: threshold=5, silence=1s, max=6s')
      
      // Start monitoring
      monitorVoiceActivity()
    } catch (err) {
      console.warn('⚠️ VAD setup failed:', err)
    }
  }

  const stopVAD = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close()
        audioContextRef.current = null
      } catch (e) {}
    }
  }

  const monitorVoiceActivity = () => {
    if (!analyzerRef.current || !mediaRecorderRef.current) return
    
    const analyzer = analyzerRef.current
    const dataArray = new Uint8Array(analyzer.frequencyBinCount)
    
    // ✅ CRITICAL FIX: Move lastVoiceTime OUTSIDE detectVoice!
    let lastVoiceTime = Date.now()
    let hasSpoken = false
    
    const detectVoice = () => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        return
      }
      
      analyzer.getByteFrequencyData(dataArray)
      
      // Calculate average volume
      const sum = dataArray.reduce((acc, val) => acc + val, 0)
      const average = sum / dataArray.length
      
      const VOICE_THRESHOLD = 5 // Even more sensitive!
      const SILENCE_DURATION = 1000 // 1.0 second (faster!)
      const currentTime = Date.now()
      
      if (average > VOICE_THRESHOLD) {
        // 🗣️ Voice detected
        setVoiceDetected(true)
        lastVoiceTime = currentTime
        hasSpoken = true
        
        // Reset silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
      } else {
        // 🔇 Silence detected
        setVoiceDetected(false)
        
        // Only check silence if user has spoken
        if (hasSpoken) {
          const silenceDuration = currentTime - lastVoiceTime
          
          if (silenceDuration >= SILENCE_DURATION && !silenceTimerRef.current) {
            // Mark that we're stopping
            silenceTimerRef.current = setTimeout(() => {}, 0)
            
            console.log(`🔇 ${(silenceDuration/1000).toFixed(1)}s silence - stopping!`)
            
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop()
              setIsRecording(false)
            }
          }
        }
      }
      
      // Continue monitoring
      animationFrameRef.current = requestAnimationFrame(detectVoice)
    }
    
    detectVoice()
  }

  const processVoice = async () => {
    if (chunksRef.current.length === 0) {
      startRecording()
      return
    }
    
    try {
      setIsProcessing(true)
      setCallStatus('processing')
      
      const audioBlob = new Blob(chunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm'
      })
      
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('user_id', getUserId())
      
      const response = await fetch('/api/voice', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      chunksRef.current = []
      
      if (data.userText) {
        setMessages(prev => [...prev, { role: 'user', content: data.userText }])
      }
      
      if (data.aiText) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.aiText }])
        setIsProcessing(false)
        setCallStatus('speaking')
        setIsSpeaking(true)
        
        speakArabic(data.aiText, () => {
          setIsSpeaking(false)
          setCallStatus('listening')
          startRecording()
        })
      } else {
        setIsProcessing(false)
        startRecording()
      }
    } catch (err: any) {
      console.error('❌ Processing error:', err)
      setIsProcessing(false)
      startRecording()
    }
  }

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return 'جاري الاتصال...'
      case 'recording':
        return 'استمع إليك...'
      case 'speaking':
        return 'المساعد يتحدث...'
      case 'processing':
        return 'جاري المعالجة...'
      case 'error':
        return 'حدث خطأ في الاتصال.'
      default:
        return 'جاهز'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-xl flex flex-col h-[90vh] overflow-hidden rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#006341] to-[#00A878] text-white">
          <h2 className="text-xl font-bold">المساعد الذكي للوزارة</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Call Status */}
        <div className="p-2 text-center text-sm bg-gray-100 text-gray-700">
          {getStatusText()} {isRecording && <span className="animate-pulse">●</span>}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                  msg.role === 'user'
                    ? 'bg-green-100 text-gray-800 border border-green-200'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <span className="block text-xs font-semibold mb-1 text-gray-500">
                  {msg.role === 'user' ? 'أنت' : 'المساعد'}
                </span>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Status Indicator */}
        <div className="p-4 bg-gray-100 flex items-center justify-center">
          {isProcessing ? (
            <div className="flex items-center text-gray-600">
              <span className="ml-2">جاري المعالجة...</span>
              <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : isSpeaking ? (
            <div className="flex items-center text-green-600">
              <span className="ml-2">المساعد يتحدث...</span>
              <svg className="animate-pulse h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M9.383 2.057a1 1 0 01.217.223l2 2a1 1 0 01.14 1.076l-1.5 3a1 1 0 01-1.674.03l-2-2a1 1 0 01-.03-1.674l3-1.5a1 1 0 011.076.14zM10 18a8 8 0 100-16 8 8 0 000 16zM10 11a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
              </svg>
            </div>
          ) : isRecording ? (
            <div className="flex items-center text-blue-600">
              <span className="ml-2">
                {voiceDetected ? '🗣️ أتحدث...' : '🔇 انتظر صوتك...'}
              </span>
              <svg className={`h-5 w-5 text-blue-600 ${voiceDetected ? 'animate-pulse' : 'animate-bounce'}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07A7.001 7.001 0 0017 8a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7.001 7.001 0 006 6.93V17a1 1 0 102 0v-2.07z" clipRule="evenodd"></path>
              </svg>
            </div>
          ) : (
            <div className="flex items-center text-gray-400">
              <span className="ml-2">جاهز</span>
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
