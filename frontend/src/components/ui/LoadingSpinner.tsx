import { cn } from '../../lib/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Chargement en cours"
      className={cn(
        'rounded-full border-gray-200 border-t-indigo-600 animate-spin',
        sizeClasses[size],
        className,
      )}
    />
  )
}
