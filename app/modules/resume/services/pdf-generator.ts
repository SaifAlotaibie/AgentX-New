/**
 * PDF Generator Service
 * Generates ATS-friendly PDF resumes from formatted data
 * 
 * Note: This uses HTML-to-PDF approach for server-side rendering
 * Install: npm install puppeteer (for server-side PDF generation)
 * Alternative: Uses HTML template with inline styles for maximum compatibility
 */

import { FormattedResumeData, ResumeTemplateStyle, ATSReport } from '../types'
import { db } from '@/lib/db/db'

/**
 * Generate HTML template for resume
 */
function generateResumeHTML(
  data: FormattedResumeData,
  template: ResumeTemplateStyle = 'modern',
  language: 'ar' | 'en' = 'ar'
): string {
  const isRTL = language === 'ar'
  const styles = getTemplateStyles(template, isRTL)

  return `
<!DOCTYPE html>
<html lang="${language}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.personalInfo.fullName} - Resume</title>
  <style>
    ${styles}
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header Section -->
    <header class="header">
      <h1 class="name">${data.personalInfo.fullName || 'الاسم'}</h1>
      <div class="contact-info">
        ${data.personalInfo.email ? `<span class="contact-item">${data.personalInfo.email}</span>` : ''}
        ${data.personalInfo.phone ? `<span class="contact-item">${data.personalInfo.phone}</span>` : ''}
        ${data.personalInfo.address ? `<span class="contact-item">${data.personalInfo.address}</span>` : ''}
      </div>
    </header>

    <!-- Professional Summary -->
    ${data.summary ? `
    <section class="section">
      <h2 class="section-title">${isRTL ? 'الملخص المهني' : 'PROFESSIONAL SUMMARY'}</h2>
      <p class="summary-text">${data.summary}</p>
    </section>
    ` : ''}

    <!-- Skills Section -->
    ${data.skills && data.skills.length > 0 ? `
    <section class="section">
      <h2 class="section-title">${isRTL ? 'المهارات' : 'SKILLS'}</h2>
      <div class="skills-container">
        ${data.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Work Experience Section -->
    ${data.experience && data.experience.length > 0 ? `
    <section class="section">
      <h2 class="section-title">${isRTL ? 'الخبرات العملية' : 'PROFESSIONAL EXPERIENCE'}</h2>
      ${data.experience.map(exp => `
        <div class="experience-item">
          <div class="experience-header">
            <h3 class="job-title">${exp.position}</h3>
            <span class="dates">${exp.startDate} - ${exp.endDate || (isRTL ? 'حتى الآن' : 'Present')}</span>
          </div>
          <p class="company-name">${exp.company}</p>
          ${exp.highlights && exp.highlights.length > 0 ? `
          <ul class="highlights">
            ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
          ` : ''}
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- Education Section -->
    ${data.education ? `
    <section class="section">
      <h2 class="section-title">${isRTL ? 'التعليم' : 'EDUCATION'}</h2>
      <p class="education-text">${data.education}</p>
    </section>
    ` : ''}

    <!-- Certifications & Courses Section -->
    ${(data.courses && data.courses.length > 0) || (data.certificates && data.certificates.length > 0) ? `
    <section class="section">
      <h2 class="section-title">${isRTL ? 'الشهادات والدورات التدريبية' : 'CERTIFICATIONS & TRAINING'}</h2>
      <ul class="certifications-list">
        ${data.courses?.map(course => `
          <li>${course.name} - ${course.institution} ${course.completionDate ? `(${course.completionDate})` : ''}</li>
        `).join('') || ''}
        ${data.certificates?.map(cert => `
          <li>${cert.type} (${cert.issueDate})</li>
        `).join('') || ''}
      </ul>
    </section>
    ` : ''}
  </div>
</body>
</html>
`
}

/**
 * Get CSS styles based on template type
 */
function getTemplateStyles(template: ResumeTemplateStyle, isRTL: boolean): string {
  const baseStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
      background: #fff;
      direction: ${isRTL ? 'rtl' : 'ltr'};
    }
    
    .resume-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #333;
    }
    
    .name {
      font-size: 24pt;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .contact-info {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 10pt;
      color: #555;
    }
    
    .contact-item {
      display: inline-block;
    }
    
    .contact-item:not(:last-child)::after {
      content: " | ";
      margin-${isRTL ? 'right' : 'left'}: 15px;
      color: #999;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }
    
    .summary-text {
      text-align: justify;
      color: #444;
    }
    
    .skills-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-tag {
      background: #f0f0f0;
      padding: 4px 12px;
      border-radius: 3px;
      font-size: 10pt;
      color: #333;
    }
    
    .experience-item {
      margin-bottom: 15px;
    }
    
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
    }
    
    .job-title {
      font-size: 11pt;
      font-weight: bold;
      color: #1a1a1a;
    }
    
    .dates {
      font-size: 10pt;
      color: #666;
    }
    
    .company-name {
      font-size: 10pt;
      color: #555;
      margin-bottom: 5px;
    }
    
    .highlights {
      margin-${isRTL ? 'right' : 'left'}: 20px;
      margin-top: 5px;
    }
    
    .highlights li {
      margin-bottom: 3px;
      font-size: 10pt;
      color: #444;
    }
    
    .education-text {
      color: #444;
    }
    
    .certifications-list {
      margin-${isRTL ? 'right' : 'left'}: 20px;
    }
    
    .certifications-list li {
      margin-bottom: 5px;
      font-size: 10pt;
      color: #444;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .resume-container {
        padding: 20px;
      }
    }
  `

  // Template-specific overrides
  switch (template) {
    case 'classic':
      return baseStyles + `
        .header { border-bottom: 3px double #333; }
        .section-title { border-bottom: 2px solid #333; }
        .skill-tag { background: transparent; border: 1px solid #333; }
      `
    case 'minimal':
      return baseStyles + `
        .header { border-bottom: none; }
        .section-title { border-bottom: none; font-weight: 600; }
        .skill-tag { background: transparent; padding: 0; }
        .skills-container { gap: 5px; }
        .skill-tag::after { content: " •"; color: #999; }
        .skill-tag:last-child::after { content: ""; }
      `
    case 'modern':
    default:
      return baseStyles
  }
}

/**
 * Generate PDF from HTML (server-side)
 * This returns the HTML for now - in production, you'd use Puppeteer or similar
 */
export async function generateResumePDF(
  formattedData: FormattedResumeData,
  template: ResumeTemplateStyle = 'modern',
  language: 'ar' | 'en' = 'ar'
): Promise<{ html: string; fileName: string }> {
  console.log('📄 Generating resume PDF...')

  const html = generateResumeHTML(formattedData, template, language)
  const fileName = `${formattedData.personalInfo.fullName?.replace(/\s+/g, '_') || 'Resume'}_${Date.now()}.pdf`

  console.log('✅ Resume HTML generated, filename:', fileName)

  return { html, fileName }
}

/**
 * Store generated resume metadata in database
 */
export async function logResumeGeneration(
  userId: string,
  templateStyle: ResumeTemplateStyle,
  fileUrl?: string
): Promise<void> {
  try {
    await db.from('agent_actions_log').insert({
      user_id: userId,
      action_type: 'resume_pdf_generated',
      input_json: { templateStyle },
      output_json: { fileUrl, generatedAt: new Date().toISOString() },
      success: true,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log resume generation:', error)
  }
}

/**
 * Validate ATS compliance of generated resume
 */
export function validateATSCompliance(data: FormattedResumeData): ATSReport {
  const issues: string[] = []
  const warnings: string[] = []

  // Check required fields
  if (!data.personalInfo.fullName) {
    issues.push('Missing name')
  }
  if (!data.personalInfo.email && !data.personalInfo.phone) {
    issues.push('Missing contact information (email or phone)')
  }

  // Check experience
  if (!data.experience || data.experience.length === 0) {
    warnings.push('No work experience listed')
  }

  // Check skills
  if (!data.skills || data.skills.length === 0) {
    warnings.push('No skills listed')
  }

  // Check summary
  if (!data.summary) {
    warnings.push('No professional summary')
  }

  // Calculate score
  const score = Math.max(0, 100 - (issues.length * 15) - (warnings.length * 5))

  return {
    score,
    issues,
    warnings,
    passed: score >= 70
  }
}

/**
 * Convert HTML to base64 data URL for download
 */
export function htmlToDataUrl(html: string): string {
  const base64 = Buffer.from(html).toString('base64')
  return `data:text/html;base64,${base64}`
}

