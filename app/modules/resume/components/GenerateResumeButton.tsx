'use client'

/**
 * Generate Resume Button Component
 * Allows users to generate and download their ATS-friendly PDF resume
 */

import { useState } from 'react'
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface GenerateResumeButtonProps {
  userId: string
  className?: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function GenerateResumeButton({ userId, className = '' }: GenerateResumeButtonProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [pdfUrl, setPdfUrl] = useState<string>('')

  const handleGenerate = async () => {
    if (!userId) {
      setErrorMessage('معرف المستخدم غير متوفر')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMessage('')
    setPdfUrl('')

    try {
      const response = await fetch('/api/modules/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          templateStyle: 'modern'
        })
      })

      const data = await response.json()

      if (data.success && data.pdfUrl) {
        setPdfUrl(data.pdfUrl)
        setStatus('success')

        // Auto-download after short delay
        setTimeout(() => {
          downloadPDF(data.pdfUrl, data.fileName || 'resume.html')
        }, 500)
      } else {
        setErrorMessage(data.error || 'فشل إنشاء السيرة الذاتية')
        setStatus('error')
      }
    } catch (error: any) {
      console.error('Resume generation failed:', error)
      setErrorMessage(error.message || 'حدث خطأ أثناء إنشاء السيرة الذاتية')
      setStatus('error')
    }
  }

  const downloadPDF = (url: string, filename: string) => {
    // Create download link
    const link = document.createElement('a')
    link.href = url
    link.download = filename.replace('.pdf', '.html') // It's HTML for now
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownload = () => {
    if (pdfUrl) {
      downloadPDF(pdfUrl, 'resume.html')
    }
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Main Button */}
      <button
        onClick={status === 'success' ? handleDownload : handleGenerate}
        disabled={status === 'loading'}
        className={`
          flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium
          transition-all duration-200 ease-in-out
          ${status === 'loading'
            ? 'bg-gray-400 cursor-not-allowed'
            : status === 'success'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : status === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {status === 'loading' && (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>جاري إنشاء السيرة الذاتية...</span>
          </>
        )}

        {status === 'success' && (
          <>
            <Download className="w-5 h-5" />
            <span>تحميل السيرة الذاتية</span>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-5 h-5" />
            <span>حاول مرة أخرى</span>
          </>
        )}

        {status === 'idle' && (
          <>
            <FileText className="w-5 h-5" />
            <span>إنشاء سيرة ذاتية PDF</span>
          </>
        )}
      </button>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>تم إنشاء السيرة الذاتية بنجاح!</span>
        </div>
      )}

      {status === 'error' && errorMessage && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Template Info */}
      {status === 'idle' && (
        <p className="text-sm text-gray-500 text-center">
          سيتم إنشاء سيرة ذاتية احترافية متوافقة مع أنظمة ATS
        </p>
      )}
    </div>
  )
}

export default GenerateResumeButton

