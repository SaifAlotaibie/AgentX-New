'use client'

/**
 * Upload Resume Form Component
 * Allows users to upload their resume for parsing and profile update
 */

import { useState, useRef } from 'react'
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'

interface UploadResumeFormProps {
  userId: string
  className?: string
  onComplete?: (result: any) => void
}

type Status = 'idle' | 'uploading' | 'reviewing' | 'applying' | 'success' | 'error'

interface ProposedChanges {
  profile: Record<string, any>
  resume: Record<string, any>
  newExperiences: any[]
  newCourses: any[]
}

export function UploadResumeForm({ userId, className = '', onComplete }: UploadResumeFormProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [proposedChanges, setProposedChanges] = useState<ProposedChanges | null>(null)
  const [summary, setSummary] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      if (!validTypes.includes(selectedFile.type)) {
        setErrorMessage('يرجى رفع ملف PDF أو DOCX أو TXT')
        return
      }
      
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage('حجم الملف يجب أن يكون أقل من 5 ميجابايت')
        return
      }
      
      setFile(selectedFile)
      setErrorMessage('')
    }
  }

  const handleUpload = async () => {
    if (!userId) {
      setErrorMessage('معرف المستخدم غير متوفر')
      return
    }

    if (!file && !textInput.trim()) {
      setErrorMessage('يرجى رفع ملف أو إدخال نص السيرة الذاتية')
      return
    }

    setStatus('uploading')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('userId', userId)
      
      if (file) {
        formData.append('file', file)
      } else if (textInput.trim()) {
        formData.append('textContent', textInput.trim())
      }

      const response = await fetch('/api/modules/resume/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setSessionId(data.sessionId)
        setProposedChanges(data.proposedChanges)
        setSummary(data.message || '')
        setStatus('reviewing')
      } else {
        setErrorMessage(data.error || 'فشل معالجة السيرة الذاتية')
        setStatus('error')
      }
    } catch (error: any) {
      console.error('Upload failed:', error)
      setErrorMessage(error.message || 'حدث خطأ أثناء رفع الملف')
      setStatus('error')
    }
  }

  const handleConfirm = async () => {
    if (!sessionId || !proposedChanges) {
      setErrorMessage('لا توجد تغييرات للتأكيد')
      return
    }

    setStatus('applying')

    try {
      const response = await fetch('/api/modules/resume/confirm-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          confirmedChanges: proposedChanges
        })
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        onComplete?.(data)
      } else {
        setErrorMessage(data.error || 'فشل تطبيق التغييرات')
        setStatus('error')
      }
    } catch (error: any) {
      console.error('Confirm failed:', error)
      setErrorMessage(error.message || 'حدث خطأ أثناء تطبيق التغييرات')
      setStatus('error')
    }
  }

  const handleCancel = () => {
    setStatus('idle')
    setFile(null)
    setTextInput('')
    setSessionId('')
    setProposedChanges(null)
    setSummary('')
    setErrorMessage('')
  }

  const countChanges = () => {
    if (!proposedChanges) return 0
    return (
      Object.keys(proposedChanges.profile).length +
      Object.keys(proposedChanges.resume).length +
      proposedChanges.newExperiences.length +
      proposedChanges.newCourses.length
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Section */}
      {(status === 'idle' || status === 'error') && (
        <>
          {/* File Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors duration-200
              ${file ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {file ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <FileText className="w-6 h-6" />
                <span>{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                  }}
                  className="ml-2 p-1 hover:bg-green-200 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-gray-500">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">اضغط لرفع ملف</p>
                <p className="text-sm">PDF, DOCX, TXT (حد أقصى 5MB)</p>
              </div>
            )}
          </div>

          {/* Or Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-500 text-sm">أو</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Text Input */}
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="الصق محتوى سيرتك الذاتية هنا..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir="rtl"
          />

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file && !textInput.trim()}
            className={`
              w-full py-3 rounded-lg font-medium transition-colors
              ${(!file && !textInput.trim())
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            تحليل السيرة الذاتية
          </button>
        </>
      )}

      {/* Loading State */}
      {status === 'uploading' && (
        <div className="text-center py-8">
          <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">جاري تحليل السيرة الذاتية...</p>
          <p className="text-sm text-gray-400">قد يستغرق هذا بضع ثوانٍ</p>
        </div>
      )}

      {/* Review Changes */}
      {status === 'reviewing' && proposedChanges && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              ✅ تم تحليل السيرة الذاتية بنجاح
            </h3>
            <p className="text-blue-700">{summary}</p>
          </div>

          {/* Changes Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-700">التغييرات المقترحة:</h4>
            
            {Object.keys(proposedChanges.profile).length > 0 && (
              <div className="text-sm">
                <span className="font-medium">الملف الشخصي:</span>
                <span className="mr-2 text-gray-600">
                  {Object.keys(proposedChanges.profile).join('، ')}
                </span>
              </div>
            )}
            
            {Object.keys(proposedChanges.resume).length > 0 && (
              <div className="text-sm">
                <span className="font-medium">السيرة الذاتية:</span>
                <span className="mr-2 text-gray-600">
                  {Object.keys(proposedChanges.resume).join('، ')}
                </span>
              </div>
            )}
            
            {proposedChanges.newExperiences.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">خبرات عمل جديدة:</span>
                <span className="mr-2 text-gray-600">
                  {proposedChanges.newExperiences.length}
                </span>
              </div>
            )}
            
            {proposedChanges.newCourses.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">دورات جديدة:</span>
                <span className="mr-2 text-gray-600">
                  {proposedChanges.newCourses.length}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <CheckCircle className="w-5 h-5 inline-block mr-2" />
              تأكيد التحديثات ({countChanges()})
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Applying State */}
      {status === 'applying' && (
        <div className="text-center py-8">
          <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-green-600" />
          <p className="text-gray-600">جاري تطبيق التغييرات...</p>
        </div>
      )}

      {/* Success State */}
      {status === 'success' && (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
          <h3 className="text-xl font-semibold text-green-700 mb-2">
            تم تحديث ملفك الشخصي بنجاح!
          </h3>
          <p className="text-gray-600 mb-6">
            تم استيراد بيانات السيرة الذاتية إلى ملفك الشخصي
          </p>
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            رفع سيرة ذاتية أخرى
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}

export default UploadResumeForm


