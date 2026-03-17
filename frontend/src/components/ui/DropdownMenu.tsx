import { useState, useRef, useEffect, type ReactNode } from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'

interface MenuItem {
  label: string
  onClick: () => void
  icon?: LucideIcon
  variant?: 'default' | 'danger'
}

interface DropdownMenuProps {
  trigger: ReactNode
  items: MenuItem[]
}

export function DropdownMenu({ trigger, items }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  function handleItemClick(item: MenuItem) {
    item.onClick()
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">{trigger}</div>
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-1"
          role="menu"
        >
          {items.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                role="menuitem"
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors cursor-pointer',
                  item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-100'
                    : 'text-gray-700 hover:bg-indigo-50',
                )}
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
