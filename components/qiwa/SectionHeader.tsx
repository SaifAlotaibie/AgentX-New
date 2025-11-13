interface SectionHeaderProps {
  title: string
  description?: string
  icon?: string
  color?: string
}

export default function SectionHeader({ title, description, icon, color = '#20183b' }: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${color}15` }}>
            {icon}
          </div>
        )}
        <h2 className="text-2xl font-bold" style={{ color }}>
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-sm" style={{ color: '#4b515a' }}>
          {description}
        </p>
      )}
    </div>
  )
}


