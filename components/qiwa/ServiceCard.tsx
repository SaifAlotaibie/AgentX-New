import Link from 'next/link'

interface ServiceCardProps {
  title: string
  description: string
  icon: string
  href: string
  color?: string
}

export default function ServiceCard({ title, description, icon, href, color = 'from-blue-500 to-blue-600' }: ServiceCardProps) {
  return (
    <Link href={href}>
      <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-[#20183b]/20 h-full">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl mb-4 shadow-md transform group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        
        <h3 className="text-lg font-bold mb-2" style={{ color: '#20183b' }}>
          {title}
        </h3>
        
        <p className="text-sm leading-relaxed" style={{ color: '#4b515a' }}>
          {description}
        </p>
        
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold" style={{ color: '#20183b' }}>
          <span>اذهب للخدمة</span>
          <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}


