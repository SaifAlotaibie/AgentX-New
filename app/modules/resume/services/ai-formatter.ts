/**
 * AI Resume Formatter Service
 * Uses OpenAI GPT-4 to optimize resume content for ATS systems
 */

import OpenAI from 'openai'
import { AggregatedResumeData, FormattedResumeData } from '../types'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Format resume data using GPT-4 for ATS optimization
 */
export async function formatResumeForATS(
  rawData: AggregatedResumeData,
  language: 'ar' | 'en' = 'ar'
): Promise<FormattedResumeData> {
  console.log('🤖 Formatting resume with AI for ATS optimization...')

  const prompt = language === 'ar' 
    ? buildArabicPrompt(rawData)
    : buildEnglishPrompt(rawData)

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: language === 'ar'
            ? `أنت خبير في كتابة السير الذاتية المتوافقة مع أنظمة تتبع المتقدمين (ATS).
               مهمتك تنسيق وتحسين محتوى السيرة الذاتية لتكون احترافية وسهلة القراءة.
               أرجع الناتج كـ JSON فقط بدون أي نص إضافي.`
            : `You are an expert resume writer specializing in ATS-friendly formats.
               Your task is to format and optimize resume content for professional presentation.
               Return the output as JSON only without any additional text.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for consistent formatting
      max_tokens: 2000
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const formatted = JSON.parse(content) as FormattedResumeData

    console.log('✅ AI formatting complete')
    return formatted

  } catch (error: any) {
    console.error('❌ AI formatting failed:', error.message)
    
    // Fallback: Return cleaned-up version of raw data
    return createFallbackFormat(rawData)
  }
}

/**
 * Build Arabic prompt for resume formatting
 */
function buildArabicPrompt(data: AggregatedResumeData): string {
  return `
قم بتنسيق البيانات التالية لإنشاء سيرة ذاتية احترافية متوافقة مع أنظمة ATS:

البيانات الحالية:
${JSON.stringify(data, null, 2)}

المطلوب:
1. تحسين النبذة التعريفية لتكون مختصرة ومؤثرة (3-4 جمل)
2. تنظيم المهارات بشكل احترافي
3. إضافة نقاط إنجاز لكل خبرة عمل (2-3 نقاط)
4. التأكد من صيغة التواريخ (MM/YYYY)

أرجع JSON بالتنسيق التالي:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "address": ""
  },
  "summary": "نبذة تعريفية محسنة",
  "skills": ["مهارة 1", "مهارة 2"],
  "experience": [
    {
      "company": "اسم الشركة",
      "position": "المسمى الوظيفي",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY أو Present",
      "highlights": ["إنجاز 1", "إنجاز 2"]
    }
  ],
  "education": "المؤهل الأكاديمي",
  "courses": [{"name": "", "institution": "", "completionDate": ""}],
  "certificates": [{"type": "", "issueDate": ""}]
}
`
}

/**
 * Build English prompt for resume formatting
 */
function buildEnglishPrompt(data: AggregatedResumeData): string {
  return `
Format the following data to create a professional ATS-compatible resume:

Current Data:
${JSON.stringify(data, null, 2)}

Requirements:
1. Improve the summary to be concise and impactful (3-4 sentences)
2. Organize skills professionally
3. Add achievement bullet points for each work experience (2-3 points)
4. Ensure date format is MM/YYYY

Return JSON in this format:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "address": ""
  },
  "summary": "Improved professional summary",
  "skills": ["skill 1", "skill 2"],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "highlights": ["Achievement 1", "Achievement 2"]
    }
  ],
  "education": "Education details",
  "courses": [{"name": "", "institution": "", "completionDate": ""}],
  "certificates": [{"type": "", "issueDate": ""}]
}
`
}

/**
 * Create fallback format when AI fails
 */
function createFallbackFormat(data: AggregatedResumeData): FormattedResumeData {
  console.log('⚠️ Using fallback formatting (no AI)')

  return {
    personalInfo: data.personalInfo,
    summary: data.summary || 'محترف متمرس يبحث عن فرص جديدة للنمو والتطور المهني.',
    skills: data.skills || [],
    experience: data.experience.map(exp => ({
      company: exp.company,
      position: exp.position,
      startDate: formatDate(exp.startDate),
      endDate: exp.endDate ? formatDate(exp.endDate) : 'Present',
      highlights: [
        `العمل كـ ${exp.position} في ${exp.company}`,
        'المساهمة في تحقيق أهداف الفريق'
      ]
    })),
    education: data.education || '',
    courses: data.courses,
    certificates: data.certificates
  }
}

/**
 * Format date to MM/YYYY
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  
  try {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${year}`
  } catch {
    return dateStr
  }
}

/**
 * Generate ATS-optimized keywords from job title and skills
 */
export function generateATSKeywords(
  jobTitle: string,
  skills: string[]
): string[] {
  const keywords = new Set<string>()

  // Add job title variations
  if (jobTitle) {
    keywords.add(jobTitle)
    // Add common variations (e.g., "مطور" -> "مبرمج")
  }

  // Add all skills
  skills.forEach(skill => keywords.add(skill))

  // Add common ATS keywords based on industry
  const commonKeywords = [
    'إدارة المشاريع',
    'العمل الجماعي',
    'التواصل الفعال',
    'حل المشكلات',
    'التفكير التحليلي'
  ]

  commonKeywords.forEach(kw => keywords.add(kw))

  return Array.from(keywords)
}


