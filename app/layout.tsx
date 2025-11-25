import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'وزارة الموارد البشرية والتنمية الاجتماعية',
  description: 'البوابة الإلكترونية لوزارة الموارد البشرية والتنمية الاجتماعية',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": "وزارة الموارد البشرية والتنمية الاجتماعية",
    "alternateName": "Ministry of Human Resources and Social Development",
    "url": "https://www.hrsd.gov.sa",
    "logo": "https://www.hrsd.gov.sa/logo.png",
    "description": "البوابة الإلكترونية لوزارة الموارد البشرية والتنمية الاجتماعية في المملكة العربية السعودية",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SA",
      "addressLocality": "الرياض",
      "addressRegion": "الرياض"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+966-11-4777777",
      "contactType": "customer service",
      "areaServed": "SA",
      "availableLanguage": ["ar", "en"]
    },
    "sameAs": [
      "https://twitter.com/HRSD_SA",
      "https://www.youtube.com/user/HRSDSA"
    ]
  }

  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `tailwind.config={theme:{extend:{colors:{primary:'#006341',secondary:'#00A878',accent:'#F7B32B',dark:'#1a1a1a'}}}}` }} />

        {/* SEO: Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      </head>
      <body suppressHydrationWarning style={{ fontFamily: 'Cairo, sans-serif', margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
