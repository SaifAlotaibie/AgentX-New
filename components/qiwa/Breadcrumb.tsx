import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: '#4b515a' }}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          )}
          {item.href ? (
            <Link href={item.href} className="hover:underline" style={{ color: '#0060ff' }}>
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold" style={{ color: '#20183b' }}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}


