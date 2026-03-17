import { useState, useRef, useEffect } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { useTags } from '../../hooks/useTags'
import { useUsers } from '../../hooks/useUsers'
import { cn } from '../../lib/cn'
import type { TaskFilters } from '../../types/filters'

interface FilterBarProps {
  projectId: number
  filters: TaskFilters
  onChange: (filters: TaskFilters) => void
}

export function FilterBar({ projectId, filters, onChange }: FilterBarProps) {
  const { data: tags } = useTags(projectId)
  const { data: users } = useUsers()
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const tagDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false)
      }
    }
    if (tagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [tagDropdownOpen])

  const hasActiveFilters =
    filters.tag_id !== undefined ||
    filters.assignee_id !== undefined ||
    filters.due_before !== undefined

  const selectedTag = tags?.find((t) => t.id === filters.tag_id)
  const today = new Date().toISOString().split('T')[0]
  const isDueBeforeToday = filters.due_before === today

  function handleTagSelect(tagId: number) {
    const newTagId = filters.tag_id === tagId ? undefined : tagId
    onChange({ ...filters, tag_id: newTagId })
    setTagDropdownOpen(false)
  }

  function handleAssigneeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    onChange({ ...filters, assignee_id: val === '' ? undefined : Number(val) })
  }

  function handleOverdueChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...filters, due_before: e.target.checked ? today : undefined })
  }

  function clearAll() {
    onChange({})
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Tag filter */}
      <div ref={tagDropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setTagDropdownOpen((v) => !v)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border transition-colors',
            filters.tag_id !== undefined
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
              : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50',
          )}
        >
          {selectedTag ? (
            <>
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedTag.color }}
              />
              {selectedTag.name}
            </>
          ) : (
            'Tag'
          )}
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        </button>

        {tagDropdownOpen && (
          <div className="absolute z-50 top-full mt-1 w-48 rounded-lg bg-white shadow-lg border border-gray-200 py-1 max-h-52 overflow-y-auto">
            {!tags || tags.length === 0 ? (
              <p className="text-sm text-gray-400 px-3 py-2">Aucun tag disponible.</p>
            ) : (
              tags.map((tag) => {
                const isSelected = filters.tag_id === tag.id
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagSelect(tag.id)}
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

      {/* Assignee filter */}
      <select
        value={filters.assignee_id ?? ''}
        onChange={handleAssigneeChange}
        className={cn(
          'text-sm rounded-md border px-3 py-1.5 transition-colors bg-white',
          filters.assignee_id !== undefined
            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50',
        )}
      >
        <option value="">Assigné</option>
        {users?.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>

      {/* Overdue filter */}
      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isDueBeforeToday}
          onChange={handleOverdueChange}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        En retard
      </label>

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1.5 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          Effacer
        </button>
      )}
    </div>
  )
}
