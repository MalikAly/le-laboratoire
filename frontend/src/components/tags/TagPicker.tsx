import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useTags } from '../../hooks/useTags'
import { TagBadge } from './TagBadge'
import { cn } from '../../lib/cn'

interface TagPickerProps {
  projectId: number
  selectedTagIds: number[]
  onChange: (tagIds: number[]) => void
}

export function TagPicker({ projectId, selectedTagIds, onChange }: TagPickerProps) {
  const { data: tags } = useTags(projectId)
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

  function toggleTag(tagId: number) {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  const selectedTags = tags?.filter((t) => selectedTagIds.includes(t.id)) ?? []

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 min-h-[36px] w-full px-3 py-1.5 rounded-md border border-gray-300',
          'text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors',
        )}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedTags.length === 0 ? (
            <span className="text-gray-400">Choisir des tags...</span>
          ) : (
            selectedTags.map((tag) => <TagBadge key={tag.id} tag={tag} />)
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full rounded-lg bg-white shadow-lg border border-gray-200 py-1 max-h-52 overflow-y-auto">
          {!tags || tags.length === 0 ? (
            <p className="text-sm text-gray-400 px-3 py-2">Aucun tag disponible.</p>
          ) : (
            tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 text-left"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-sm text-gray-700">{tag.name}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
