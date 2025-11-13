export default function Hero() {
  return (
    <section className="relative bg-gradient-to-l from-primary to-secondary text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            معاً نبني مستقبل الموارد البشرية
          </h2>
          <p className="text-xl mb-8 leading-relaxed">
            نسعى لتمكين القوى العاملة وتحقيق التنمية المستدامة من خلال تقديم خدمات متميزة وبرامج داعمة
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-accent text-dark px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition">
              الخدمات الإلكترونية
            </button>
            <button className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              منصة قوى
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249 250 251)"/>
        </svg>
      </div>
    </section>
  )
}

