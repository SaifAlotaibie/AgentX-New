/**
 * Email Templates for HRSD/Qiwa Platform
 * Official HRSD Ministry Branding - Exact Match
 */

// Official HRSD Colors (from their website)
const HRSD_COLORS = {
  primary: '#00A99D',      // Official HRSD Teal/Turquoise
  secondary: '#F7941E',    // Official HRSD Orange accent
  dark: '#1E1E1E',         // Dark text
  green: '#8BC53F',        // Success green
  white: '#FFFFFF',
  lightBg: '#F8F9FA'
}

// Base HTML wrapper with HRSD Official branding
const emailWrapper = (content: string, preheader: string = '') => `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif; 
      background-color: #F5F7FA;
      direction: rtl;
      text-align: right;
      line-height: 1.6;
    }
    .email-wrapper {
      background-color: #F5F7FA;
      padding: 20px 0;
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: ${HRSD_COLORS.white}; 
      border-radius: 0;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    .header { 
      background: linear-gradient(135deg, ${HRSD_COLORS.primary} 0%, ${HRSD_COLORS.primary} 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    .logo-container {
      margin-bottom: 20px;
    }
    .logo-img {
      max-width: 200px;
      height: auto;
    }
    .ministry-name {
      color: ${HRSD_COLORS.white};
      font-size: 18px;
      font-weight: 600;
      margin-top: 15px;
      letter-spacing: 0.3px;
    }
    .ministry-name-en {
      color: rgba(255,255,255,0.95);
      font-size: 13px;
      margin-top: 8px;
      font-weight: 400;
    }
    .content { 
      padding: 45px 35px;
      background-color: ${HRSD_COLORS.white};
    }
    .greeting {
      font-size: 20px;
      color: ${HRSD_COLORS.dark};
      margin-bottom: 25px;
      font-weight: 600;
    }
    .content p {
      color: #4A5568;
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 20px;
    }
    .info-box {
      background: linear-gradient(to left, #F8FFFE 0%, #FFFFFF 100%);
      border-right: 4px solid ${HRSD_COLORS.primary};
      padding: 20px 25px;
      margin: 25px 0;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .info-box p {
      margin: 10px 0;
      color: ${HRSD_COLORS.dark};
      font-size: 15px;
    }
    .info-box strong {
      color: #2D3748;
      font-weight: 600;
    }
    .highlight {
      color: ${HRSD_COLORS.primary};
      font-weight: 700;
      font-size: 17px;
    }
    .button { 
      display: inline-block;
      background: ${HRSD_COLORS.primary};
      color: ${HRSD_COLORS.white} !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 25px 0;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,169,157,0.25);
    }
    .button:hover {
      background: #00938A;
      box-shadow: 0 6px 16px rgba(0,169,157,0.35);
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .footer { 
      background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%);
      color: ${HRSD_COLORS.white};
      padding: 35px 30px;
      text-align: center;
    }
    .footer-logo {
      max-width: 160px;
      margin-bottom: 20px;
      opacity: 0.9;
    }
    .footer-title {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 12px;
      color: ${HRSD_COLORS.white};
    }
    .footer-subtitle {
      font-size: 13px;
      margin: 8px 0;
      opacity: 0.85;
      color: rgba(255,255,255,0.9);
    }
    .footer-note {
      font-size: 12px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.15);
      opacity: 0.75;
      color: rgba(255,255,255,0.8);
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #E2E8F0, transparent);
      margin: 25px 0;
    }
    .badge {
      display: inline-block;
      background: ${HRSD_COLORS.secondary};
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0px;overflow:hidden;font-size:1px;color:#F5F7FA;line-height:1px;max-width:0px;opacity:0;">${preheader}</div>` : ''}
  <div class="email-wrapper">
    <div class="email-container">
      <div class="header">
        <div class="logo-container">
          <img src="https://i.imgur.com/MxslkIu.png" alt="شعار وزارة الموارد البشرية والتنمية الاجتماعية" class="logo-img" />
        </div>
        <div class="ministry-name">وزارة الموارد البشرية والتنمية الاجتماعية</div>
        <div class="ministry-name-en">Ministry of Human Resources and Social Development</div>
      </div>
      ${content}
      <div class="footer">
        <div class="footer-title">وزارة الموارد البشرية والتنمية الاجتماعية</div>
        <div class="footer-subtitle">المملكة العربية السعودية</div>
        <div class="footer-subtitle">Kingdom of Saudi Arabia</div>
        <div class="footer-note">
          هذه رسالة تلقائية من نظام قوى، الرجاء عدم الرد عليها مباشرة.<br>
          للتواصل، يرجى زيارة منصة قوى أو الموقع الرسمي للوزارة.
        </div>
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
      
      <p>تم فتح تذكرة دعم جديدة في حسابك على منصة قوى بنجاح.</p>
      
      <div class="info-box">
        <p><strong>رقم التذكرة:</strong> <span class="highlight">#${params.ticketNumber}</span></p>
        <p><strong>العنوان:</strong> ${params.ticketTitle}</p>
        <p><strong>التصنيف:</strong> ${params.ticketCategory}</p>
        <p><strong>الحالة:</strong> <span class="badge">قيد المعالجة</span></p>
      </div>

      <p>سيتم معالجة طلبك في أقرب وقت ممكن من قبل فريق الدعم المختص. يمكنك متابعة حالة التذكرة وتحديثاتها من خلال حسابك على منصة قوى.</p>
      
      <div class="cta-container">
        <a href="https://qiwa.sa/individuals/chatbot" class="button">عرض تفاصيل التذكرة</a>
      </div>

      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #718096;">
        💡 <strong>نصيحة:</strong> للحصول على رد أسرع، تأكد من إضافة جميع التفاصيل المطلوبة في وصف التذكرة.
      </p>
    </div>
  `

  return {
    subject: `✅ تم فتح تذكرة دعم #${params.ticketNumber} - منصة قوى`,
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
      
      <p>نود إعلامك بأنه تم إغلاق تذكرة الدعم الخاصة بك بنجاح.</p>
      
      <div class="info-box">
        <p><strong>رقم التذكرة:</strong> <span class="highlight">#${params.ticketNumber}</span></p>
        <p><strong>العنوان:</strong> ${params.ticketTitle}</p>
        ${params.resolution ? `<p><strong>الحل المقدم:</strong> ${params.resolution}</p>` : ''}
        <p><strong>الحالة:</strong> <span class="badge" style="background:#8BC53F;">مُغلقة</span></p>
      </div>
      
      <p>نأمل أن يكون الحل المقدم قد ساعدك في حل مشكلتك. إذا كان لديك أي استفسار آخر أو تحتاج إلى مساعدة إضافية، لا تتردد في التواصل معنا من خلال فتح تذكرة جديدة.</p>
      
      <div class="cta-container">
        <a href="https://qiwa.sa/individuals/chatbot" class="button">زيارة حسابي على قوى</a>
      </div>

      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #718096; text-align: center;">
        نشكرك على ثقتك بخدمات منصة قوى 🙏
      </p>
    </div>
  `

  return {
    subject: `✅ تم إغلاق تذكرة الدعم #${params.ticketNumber} - منصة قوى`,
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
  const urgencyBg = params.daysRemaining <= 7 ? '#FEE2E2' : '#FEF3C7'

  const content = `
    <div class="content">
      <div class="greeting">مرحباً ${params.userName}،</div>
      
      <div style="background-color: ${urgencyBg}; border-right: 4px solid ${urgencyColor}; padding: 20px 25px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0; color: ${urgencyColor}; font-weight: 700; font-size: 18px;">
          ⚠️ ${urgency}: عقد العمل الخاص بك على وشك الانتهاء
        </p>
      </div>
      
      <p>نود تنبيهك بأن عقد العمل الخاص بك سينتهي قريباً. يُرجى اتخاذ الإجراء المناسب في أقرب وقت.</p>
      
      <div class="info-box">
        <p><strong>جهة العمل:</strong> ${params.employerName}</p>
        <p><strong>المسمى الوظيفي:</strong> ${params.position}</p>
        <p><strong>تاريخ انتهاء العقد:</strong> ${params.endDate}</p>
        <p><strong>الأيام المتبقية:</strong> <span class="highlight">${params.daysRemaining} يوم</span></p>
      </div>
      
      <p><strong>الإجراءات الموصى بها:</strong></p>
      <ul style="color: #4A5568; margin-right: 20px; line-height: 2;">
        <li>التواصل مع صاحب العمل لتجديد العقد</li>
        <li>مراجعة شروط وبنود العقد الجديد</li>
        <li>التأكد من تحديث بياناتك على منصة قوى</li>
      </ul>
      
      <div class="cta-container">
        <a href="https://qiwa.sa/individuals/contracts" class="button">عرض تفاصيل العقد</a>
      </div>

      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #718096;">
        منصة قوى - خدمة استباقية لحمايتك وتسهيل إجراءاتك 🛡️
      </p>
    </div>
  `

  return {
    subject: `⚠️ ${urgency}: عقد العمل ينتهي خلال ${params.daysRemaining} يوم - منصة قوى`,
    html: emailWrapper(content, `عقدك ينتهي قريباً - اتخذ الإجراء المناسب`)
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
      
      <p>لاحظنا أن ملفك الشخصي على منصة قوى غير مكتمل. إكمال معلوماتك الشخصية سيساعدك في:</p>
      
      <ul style="color: #4A5568; margin-right: 20px; line-height: 2;">
        <li>الحصول على خدمات أفضل وأسرع</li>
        <li>تلقي توصيات وظيفية مناسبة لك</li>
        <li>الاستفادة من جميع مزايا المنصة</li>
      </ul>
      
      <div class="info-box">
        <p style="font-weight: 700; margin-bottom: 15px; color: ${HRSD_COLORS.primary};">📋 الحقول المطلوبة لإكمال ملفك:</p>
        <ul style="margin-right: 20px; color: #2D3748;">
          ${params.missingFields.map(field => `<li style="margin: 8px 0;">${field}</li>`).join('')}
        </ul>
      </div>
      
      <p>إكمال هذه المعلومات سيستغرق دقائق معدودة فقط ✨</p>
      
      <div class="cta-container">
        <a href="https://qiwa.sa/individuals/profile" class="button">إكمال الملف الشخصي الآن</a>
      </div>

      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #718096; text-align: center;">
        منصة قوى - معك لخدمة أفضل 💼
      </p>
    </div>
  `

  return {
    subject: '📝 أكمل ملفك الشخصي على منصة قوى للاستفادة الكاملة',
    html: emailWrapper(content, 'ملفك الشخصي غير مكتمل')
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
      
      <p style="font-size: 18px; color: ${HRSD_COLORS.primary}; font-weight: 600;">
        🎉 تهانينا! تم إصدار شهادتك بنجاح
      </p>
      
      <p>يسرنا إعلامك بأنه تم إصدار شهادة جديدة لك من منصة قوى.</p>
      
      <div class="info-box">
        <p><strong>نوع الشهادة:</strong> <span class="highlight">${params.certificateType}</span></p>
        <p><strong>تاريخ الإصدار:</strong> ${params.issueDate}</p>
        <p><strong>الجهة المصدرة:</strong> وزارة الموارد البشرية والتنمية الاجتماعية</p>
      </div>
      
      <p>يمكنك الآن:</p>
      <ul style="color: #4A5568; margin-right: 20px; line-height: 2;">
        <li>تحميل الشهادة بصيغة PDF</li>
        <li>مشاركتها مع الجهات المعنية</li>
        <li>طباعتها للاستخدام الرسمي</li>
      </ul>
      
      <div class="cta-container">
        <a href="https://qiwa.sa/individuals/certificates" class="button">عرض وتحميل الشهادة</a>
      </div>

      <div class="divider"></div>
      
      <p style="font-size: 14px; color: #718096; text-align: center;">
        تم الإصدار بواسطة المساعد الذكي على منصة قوى 🤖
      </p>
    </div>
  `

  return {
    subject: `🎉 تم إصدار شهادة: ${params.certificateType} - منصة قوى`,
    html: emailWrapper(content, 'شهادة جديدة جاهزة للتحميل')
  }
}
