import { type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface BadgeProps {
  color: string
  children: ReactNode
  className?: string
}

export function Badge({ color, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white',
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  )
}
