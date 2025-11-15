import React from 'react'

export interface HRSDCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hoverable?: boolean
}

export const HRSDCard: React.FC<HRSDCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  const hoverClass = hoverable ? 'hover:shadow-hrsd-md hover:-translate-y-1 cursor-pointer transition-all duration-200' : ''
  
  return (
    <div
      className={`bg-white rounded-xl border border-border p-6 shadow-hrsd ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export interface HRSDCardHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

export const HRSDCardHeader: React.FC<HRSDCardHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
}) => {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-text-primary mb-1">{title}</h3>
          {subtitle && (
            <p className="text-sm text-text-secondary">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export const HRSDCardBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="text-text-secondary">{children}</div>
}

export const HRSDCardFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ 
  children,
  className = ''
}) => {
  return (
    <div className={`mt-6 pt-4 border-t border-border flex items-center gap-3 ${className}`}>
      {children}
    </div>
  )
}
