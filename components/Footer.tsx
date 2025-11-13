export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">عن الوزارة</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-accent transition">رؤيتنا ورسالتنا</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition">الهيكل التنظيمي</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition">القيادات</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition">الاستراتيجية</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">الخدمات</h3>
            <ul className="space-y-2">
              <li><a href="/qiwa" className="text-gray-300 hover:text-accent transition">منصة قوى</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition">خدمات التوظيف</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition">التنمية الاجتماعية</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition">خدمات ذوي الإعاقة</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-accent transition">الأخبار</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition">الفعاليات</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition">التقارير</a></li>
              <li><a href="#" className="text-gray-300 hover:text-accent transition">الأنظمة واللوائح</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">الرقم الموحد: 19911</li>
              <li className="text-gray-300">البريد الإلكتروني:</li>
              <li><a href="mailto:info@hrsd.gov.sa" className="text-accent hover:text-yellow-400">info@hrsd.gov.sa</a></li>
              <li className="flex gap-4 mt-4">
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-accent transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-accent transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© ٢٠٢٥ وزارة الموارد البشرية والتنمية الاجتماعية. جميع الحقوق محفوظة.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-accent text-sm">سياسة الخصوصية</a>
              <a href="#" className="text-gray-400 hover:text-accent text-sm">الشروط والأحكام</a>
              <a href="#" className="text-gray-400 hover:text-accent text-sm">خريطة الموقع</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

