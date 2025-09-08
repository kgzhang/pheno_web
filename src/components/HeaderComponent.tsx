import React from 'react'
import { Loader2 } from 'lucide-react'

interface HeaderComponentProps {
  title: string
  description?: string
  loading?: boolean
  children?: React.ReactNode
  actions?: React.ReactNode
  left?: React.ReactNode
  className?: string
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({
  title,
  description,
  loading,
  children,
  actions,
  left,
  className = ''
}) => {
  return (
    <div
      className={`bg-background/80 backdrop-blur-sm px-6 py-3 border-b border-border sticky top-0 z-50 ${className}`}
    >
      <div className="flex justify-between items-center gap-3">
        {left && <div className="flex gap-2">{left}</div>}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-semibold text-foreground m-0">{title}</h1>
            {children}
          </div>
          {description && <p className="text-sm text-muted-foreground mt-2 mb-0">{description}</p>}
        </div>
        {actions && (
          <div className="flex gap-2 items-center">
            {loading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export default HeaderComponent
