/**
 * Email Templates for HRSD/Qiwa Platform
 * All templates in Arabic with Official Ministry branding
 */

// Official HRSD Ministry Colors
const HRSD_COLORS = {
  primary: '#158285',    // Official HRSD Genoa (Teal)
  dark: '#053321',       // Official HRSD Zuccini (Dark Green)
  white: '#FFFFFF'
}

// Base HTML wrapper with HRSD/Qiwa branding
const emailWrapper = (content: string, preheader: string = '') => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Arial', 'Tahoma', sans-serif; 
      background-color: #f5f5f5;
      direction: rtl;
      text-align: right;
    }
    .email-container { 
      max-width: 600px; 
      margin: 20px auto; 
      background-color: white; 
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header { 
      background: linear-gradient(135deg, ${HRSD_COLORS.primary} 0%, ${HRSD_COLORS.primary} 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo-img {
      max-width: 180px;
      height: auto;
      margin: 0 auto 15px;
    }
    .header-title {
      color: white;
      font-size: 24px;
      font-weight: bold;
      margin: 10px 0 0 0;
    }
    .content { 
      padding: 40px 30px;
      line-height: 1.8;
      color: #333;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .button { 
      display: inline-block;
      background: linear-gradient(135deg, ${HRSD_COLORS.primary} 0%, ${HRSD_COLORS.primary} 100%);
      color: white !important;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
    }
    .footer { 
      background-color: ${HRSD_COLORS.dark};
      color: white;
      padding: 30px 20px;
      text-align: center;
      font-size: 14px;
    }
    .footer-title {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .info-box {
      background-color: #f8f9fa;
      border-right: 4px solid ${HRSD_COLORS.primary};
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .highlight {
      color: ${HRSD_COLORS.primary};
      font-weight: bold;
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0px;overflow:hidden;">${preheader}</div>` : ''}
  <div class="email-container">
    <div class="header">
      <img src="https://qiwa.sa/qiwalogofor-afrad.png" alt="Qiwa Logo" class="logo-img" />
      <div class="header-title">منصة قوى</div>
      <div style="color: white; font-size: 14px; margin-top: 5px;">وزارة الموارد البشرية والتنمية الاجتماعية</div>
    </div>
    ${content}
    <div class="footer">
      <div class="footer-title">وزارة الموارد البشرية والتنمية الاجتماعية</div>
      <div style="font-size: 12px; margin-top: 10px; opacity: 0.9;">
        المملكة العربية السعودية
      </div>
      <div style="font-size: 12px; margin-top: 15px; opacity: 0.8;">
        هذه رسالة تلقائية، الرجاء عدم الرد عليها
      </div>
    </div>
  </div>
</body>
</html>
`

/**
 * Ticket Opened Email Template
 */
export const ticketOpenedTemplate = (params: {
  userName: string
  ticketNumber: string
  ticketTitle: string
  ticketCategory: string
}) => {
  const content = `
    <div class="content">
      <div class="greeting">مرحباً ${params.userName}،</div>
      
      <p>تم فتح تذكرة دعم جديدة في حسابك على منصة قوى.</p>
      
      <div class="info-box">
        <p style="margin: 5px 0;"><strong>رقم التذكرة:</strong> <span class="highlight">#${params.ticketNumber}</span></p>
        <p style="margin: 5px 0;"><strong>العنوان:</strong> ${params.ticketTitle}</p>
        <p style="margin: 5px 0;"><strong>التصنيف:</strong> ${params.ticketCategory}</p>
      </div>
      
      <p>سيتم معالجة طلبك في أقرب وقت ممكن. يمكنك متابعة حالة التذكرة من خلال حسابك.</p>
      
      <center>
        <a href="https://qiwa.sa/individuals/chatbot" class="button">عرض التذكرة</a>
      </center>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        شكراً لاستخدامك منصة قوى
      </p>
    </div>
  `

  return {
    subject: `تم فتح تذكرة دعم #${params.ticketNumber}`,
    html: emailWrapper(content, `تذكرة جديدة: ${params.ticketTitle}`)
  }
}

/**
 * Ticket Closed Email Template
 */
export const ticketClosedTemplate = (params: {
  userName: string
  ticketNumber: string
  ticketTitle: string
  resolution?: string
}) => {
  const content = `
    <div class="content">
      <div class="greeting">مرحباً ${params.userName}،</div>
      
      <p>تم إغلاق تذكرة الدعم الخاصة بك بنجاح.</p>
      
      <div class="info-box">
        <p style="margin: 5px 0;"><strong>رقم التذكرة:</strong> <span class="highlight">#${params.ticketNumber}</span></p>
        <p style="margin: 5px 0;"><strong>العنوان:</strong> ${params.ticketTitle}</p>
        ${params.resolution ? `<p style="margin: 5px 0;"><strong>الحل:</strong> ${params.resolution}</p>` : ''}
      </div>
      
      <p>نأمل أن يكون الحل المقدم قد ساعدك. إذا كان لديك أي استفسار آخر، لا تتردد في التواصل معنا.</p>
      
      <center>
        <a href="https://qiwa.sa/individuals/chatbot" class="button">زيارة حسابي</a>
      </center>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        نشكرك على ثقتك بخدماتنا
      </p>
    </div>
  `

  return {
    subject: `تم إغلاق تذكرة الدعم #${params.ticketNumber}`,
    html: emailWrapper(content, `تم حل تذكرتك بنجاح`)
  }
}

/**
 * Contract Expiring Email Template
 */
export const contractExpiringTemplate = (params: {
  userName: string
  employerName: string
  position: string
  endDate: string
  daysRemaining: number
}) => {
  const urgency = params.daysRemaining <= 7 ? 'عاجل' : 'تنبيه'
  const urgencyColor = params.daysRemaining <= 7 ? '#DC2626' : '#F59E0B'

  const content = `
    <div class="content">
      <div class="greeting">مرحباً ${params.userName}،</div>
      
      <p style="background-color: ${urgencyColor}15; border-right: 4px solid ${urgencyColor}; padding: 15px; border-radius: 4px;">
        <strong style="color: ${urgencyColor};">⚠️ ${urgency}:</strong> عقد العمل الخاص بك على وشك الانتهاء
      </p>
      
      <div class="info-box">
        <p style="margin: 5px 0;"><strong>جهة العمل:</strong> ${params.employerName}</p>
        <p style="margin: 5px 0;"><strong>المسمى الوظيفي:</strong> ${params.position}</p>
        <p style="margin: 5px 0;"><strong>تاريخ الانتهاء:</strong> ${params.endDate}</p>
        <p style="margin: 5px 0;"><strong>المتبقي:</strong> <span class="highlight">${params.daysRemaining} يوم</span></p>
      </div>
      
      <p>نوصي بالتواصل مع جهة عملك لتجديد العقد أو اتخاذ الإجراءات اللازمة قبل انتهاء المدة.</p>
      
      <center>
        <a href="https://qiwa.sa/individuals/contracts" class="button">عرض تفاصيل العقد</a>
      </center>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        منصة قوى - خدمة استباقية لحمايتك
      </p>
    </div>
  `

  return {
    subject: `${urgency}: عقد العمل ينتهي خلال ${params.daysRemaining} يوم`,
    html: emailWrapper(content, `عقدك ينتهي قريباً - اتخذ الإجراء`)
  }
}

/**
 * Profile Incomplete Email Template
 */
export const profileIncompleteTemplate = (params: {
  userName: string
  missingFields: string[]
}) => {
  const content = `
    <div class="content">
      <div class="greeting">مرحباً ${params.userName}،</div>
      
      <p>لاحظنا أن ملفك الشخصي على منصة قوى غير مكتمل. إكمال معلوماتك الشخصية سيساعدك في الحصول على خدمات أفضل وأسرع.</p>
      
      <div class="info-box">
        <p style="margin: 5px 0; font-weight: bold;">الحقول المطلوبة:</p>
        <ul style="margin: 10px 0; padding-right: 20px;">
          ${params.missingFields.map(field => `<li>${field}</li>`).join('')}
        </ul>
      </div>
      
      <p>إكمال هذه المعلومات سيستغرق دقائق معدودة فقط.</p>
      
      <center>
        <a href="https://qiwa.sa/individuals/profile" class="button">إكمال الملف الشخصي</a>
      </center>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        منصة قوى - معك لخدمة أفضل
      </p>
    </div>
  `

  return {
    subject: 'أكمل ملفك الشخصي على منصة قوى',
    html: emailWrapper(content, 'ملفك غير مكتمل')
  }
}

/**
 * Certificate Issued Email Template
 */
export const certificateIssuedTemplate = (params: {
  userName: string
  certificateType: string
  issueDate: string
}) => {
  const content = `
    <div class="content">
      <div class="greeting">مرحباً ${params.userName}،</div>
      
      <p>تم إصدار شهادة جديدة لك بنجاح من منصة قوى.</p>
      
      <div class="info-box">
        <p style="margin: 5px 0;"><strong>نوع الشهادة:</strong> <span class="highlight">${params.certificateType}</span></p>
        <p style="margin: 5px 0;"><strong>تاريخ الإصدار:</strong> ${params.issueDate}</p>
      </div>
      
      <p>يمكنك تحميل الشهادة أو مشاركتها مباشرة من حسابك.</p>
      
      <center>
        <a href="https://qiwa.sa/individuals/certificates" class="button">عرض الشهادة</a>
      </center>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        تم الإصدار بواسطة المساعد الذكي
      </p>
    </div>
  `

  return {
    subject: `تم إصدار شهادة: ${params.certificateType}`,
    html: emailWrapper(content, 'شهادة جديدة جاهزة')
  }
}
