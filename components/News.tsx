export default function News() {
  const news = [
    {
      title: 'إطلاق برنامج دعم التوظيف للخريجين',
      date: '١٠ نوفمبر ٢٠٢٥',
      excerpt: 'أعلنت الوزارة عن إطلاق برنامج جديد لدعم توظيف الخريجين في القطاع الخاص',
      image: '/news1.jpg'
    },
    {
      title: 'تطوير منصة قوى بخدمات جديدة',
      date: '٨ نوفمبر ٢٠٢٥',
      excerpt: 'إضافة مجموعة من الخدمات الرقمية الجديدة لتسهيل إجراءات سوق العمل',
      image: '/news2.jpg'
    },
    {
      title: 'اتفاقية تعاون مع القطاع الخاص',
      date: '٥ نوفمبر ٢٠٢٥',
      excerpt: 'توقيع اتفاقيات تعاون لتعزيز التوطين في القطاعات الحيوية',
      image: '/news3.jpg'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark mb-4">آخر الأخبار</h2>
          <p className="text-gray-600 text-lg">تابع أحدث أخبار وفعاليات الوزارة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition">
              <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <svg className="w-20 h-20 text-white opacity-50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <div className="p-6">
                <p className="text-sm text-primary font-semibold mb-2">{item.date}</p>
                <h3 className="text-xl font-bold mb-2 text-dark">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.excerpt}</p>
                <button className="text-primary font-semibold hover:text-secondary transition flex items-center gap-2">
                  اقرأ المزيد
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

