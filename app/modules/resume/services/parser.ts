/**
 * Resume Parser Service
 * Parses uploaded resume files (PDF/DOCX) and extracts structured data using AI
 */

import OpenAI from 'openai'
import { ExtractedResumeData, WorkExperience, Course } from '../types'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Main function: Parse resume file and extract structured data
 */
export async function parseResumeFile(
  fileContent: string,
  fileType: 'pdf' | 'docx' | 'text'
): Promise<ExtractedResumeData> {
  console.log('📄 Parsing resume file, type:', fileType)

  // For text content, send directly to AI
  // In production, you'd use pdf-parse or mammoth for binary files
  const extractedData = await parseWithAI(fileContent)

  console.log('✅ Resume parsed successfully')
  return extractedData
}

/**
 * Use GPT-4 to parse resume text into structured data
 */
async function parseWithAI(resumeText: string): Promise<ExtractedResumeData> {
  console.log('🤖 Sending resume to AI for parsing...')

  const prompt = `
أنت خبير في تحليل السير الذاتية. استخرج المعلومات المنظمة من نص السيرة الذاتية التالي:

نص السيرة الذاتية:
"""
${resumeText.slice(0, 8000)} ${resumeText.length > 8000 ? '...(تم اختصار النص)' : ''}
"""

استخرج المعلومات وأرجع JSON بالتنسيق التالي:
{
  "personalInfo": {
    "fullName": "الاسم الكامل أو null",
    "email": "البريد الإلكتروني أو null",
    "phone": "رقم الهاتف أو null",
    "address": "العنوان أو null",
    "nationality": "الجنسية أو null"
  },
  "summary": "الملخص المهني أو null",
  "skills": ["مهارة 1", "مهارة 2"],
  "experienceYears": 0,
  "education": "التعليم أو null",
  "experience": [
    {
      "company": "اسم الشركة",
      "position": "المسمى الوظيفي",
      "startDate": "YYYY-MM أو تقريبي",
      "endDate": "YYYY-MM أو null إذا حالي",
      "description": "وصف مختصر"
    }
  ],
  "courses": [
    {
      "name": "اسم الدورة",
      "institution": "الجهة المانحة",
      "completionDate": "YYYY-MM"
    }
  ]
}

تعليمات مهمة:
- استخرج فقط المعلومات الموجودة فعلياً في النص
- استخدم null للحقول غير الموجودة
- احسب سنوات الخبرة من تواريخ العمل
- استخرج جميع المهارات المذكورة (تقنية وشخصية)
- تأكد من صحة تنسيق JSON
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'أنت محلل سير ذاتية متخصص. أرجع فقط JSON صالح بدون أي نص إضافي.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Very low for consistent extraction
      max_tokens: 2000
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(content)

    // Validate and clean the parsed data
    return validateExtractedData(parsed)

  } catch (error: any) {
    console.error('❌ AI parsing failed:', error.message)

    // Return empty structure on failure
    return getEmptyExtractedData()
  }
}

/**
 * Validate and clean extracted data
 */
function validateExtractedData(data: any): ExtractedResumeData {
  return {
    personalInfo: {
      fullName: data.personalInfo?.fullName || null,
      email: data.personalInfo?.email || null,
      phone: data.personalInfo?.phone || null,
      address: data.personalInfo?.address || null,
      nationality: data.personalInfo?.nationality || null
    },
    summary: data.summary || null,
    skills: Array.isArray(data.skills) ? data.skills.filter(Boolean) : [],
    experienceYears: typeof data.experienceYears === 'number' ? data.experienceYears : 0,
    education: data.education || null,
    experience: Array.isArray(data.experience)
      ? data.experience.map(validateExperience).filter(Boolean)
      : [],
    courses: Array.isArray(data.courses)
      ? data.courses.map(validateCourse).filter(Boolean)
      : []
  }
}

/**
 * Validate work experience entry
 */
function validateExperience(exp: any): WorkExperience | null {
  if (!exp || !exp.company) return null

  return {
    company: exp.company || '',
    position: exp.position || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || null,
    description: exp.description || ''
  }
}

/**
 * Validate course entry
 */
function validateCourse(course: any): Course | null {
  if (!course || !course.name) return null

  return {
    name: course.name || '',
    institution: course.institution || '',
    completionDate: course.completionDate || ''
  }
}

/**
 * Get empty extracted data structure
 */
function getEmptyExtractedData(): ExtractedResumeData {
  return {
    personalInfo: {
      fullName: undefined,
      email: undefined,
      phone: undefined,
      address: undefined,
      nationality: undefined
    },
    summary: undefined,
    skills: [],
    experienceYears: 0,
    education: undefined,
    experience: [],
    courses: []
  }
}

/**
 * Extract text from PDF using basic methods
 * In production, use pdf-parse library
 */
export async function extractTextFromPDF(base64Content: string): Promise<string> {
  // Placeholder: In production, use pdf-parse or similar
  // For now, we assume the content is already text
  console.log('📄 Extracting text from PDF...')

  try {
    // Decode base64 if needed
    const decoded = Buffer.from(base64Content, 'base64').toString('utf-8')
    return decoded
  } catch {
    return base64Content
  }
}

/**
 * Extract text from DOCX
 * In production, use mammoth library
 */
export async function extractTextFromDOCX(base64Content: string): Promise<string> {
  // Placeholder: In production, use mammoth
  console.log('📄 Extracting text from DOCX...')

  try {
    const decoded = Buffer.from(base64Content, 'base64').toString('utf-8')
    return decoded
  } catch {
    return base64Content
  }
}

/**
 * Sanitize resume text to prevent prompt injection
 */
export function sanitizeResumeText(text: string): string {
  if (!text) return ''

  // Remove potential prompt injection attempts
  const dangerous = [
    'ignore previous instructions',
    'new instructions:',
    'system:',
    'assistant:',
    'تجاهل التعليمات',
    'تعليمات جديدة'
  ]

  let cleaned = text
  dangerous.forEach(phrase => {
    cleaned = cleaned.replace(new RegExp(phrase, 'gi'), '')
  })

  // Limit length to prevent token abuse
  return cleaned.slice(0, 15000)
}

/**
 * Detect file type from content or extension
 */
export function detectFileType(
  fileName: string,
  mimeType?: string
): 'pdf' | 'docx' | 'text' | 'unknown' {
  const ext = fileName.toLowerCase().split('.').pop()

  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return 'pdf'
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return 'docx'
  }

  if (mimeType?.startsWith('text/') || ext === 'txt') {
    return 'text'
  }

  return 'unknown'
}


