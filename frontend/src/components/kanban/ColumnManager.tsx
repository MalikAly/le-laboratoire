import { useState } from 'react'
import { Pencil, Trash2, ChevronUp, ChevronDown, Check, X, Plus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import {
  useColumns,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
  useReorderColumns,
} from '../../hooks/useColumns'
import { cn } from '../../lib/cn'
import type { KanbanColumn } from '../../types/column'

const PRESET_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
]

interface ColumnManagerProps {
  projectId: number
  isOpen: boolean
  onClose: () => void
}

interface ColumnItemProps {
  column: KanbanColumn
  isFirst: boolean
  isLast: boolean
  projectId: number
  onMoveUp: () => void
  onMoveDown: () => void
}

function ColumnItem({ column, isFirst, isLast, projectId, onMoveUp, onMoveDown }: ColumnItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(column.name)
  const [editColor, setEditColor] = useState(column.color ?? PRESET_COLORS[0])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const updateColumn = useUpdateColumn(projectId)
  const deleteColumn = useDeleteColumn(projectId)

  function handleSave() {
    if (!editName.trim()) return
    updateColumn.mutate(
      { colId: column.id, data: { name: editName.trim(), color: editColor } },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  function handleCancelEdit() {
    setEditName(column.name)
    setEditColor(column.color ?? PRESET_COLORS[0])
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50">
        <input
          autoFocus
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancelEdit()
          }}
          className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-2 mb-3">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setEditColor(c)}
              className={cn(
                'w-6 h-6 rounded-full transition-transform',
                editColor === c && 'ring-2 ring-offset-2 ring-gray-600 scale-110',
              )}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={updateColumn.isPending}
            className="p-1 text-green-600 hover:bg-green-100 rounded-md"
            title="Enregistrer"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-gray-400 hover:bg-gray-100 rounded-md"
            title="Annuler"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-indigo-50 hover:shadow-sm transition-all group">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: column.color ?? '#6366f1' }}
          aria-hidden="true"
        />
        <span className="flex-1 text-sm text-gray-800">{column.name}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
            title="Monter"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
            title="Descendre"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setEditName(column.name)
              setEditColor(column.color ?? PRESET_COLORS[0])
              setIsEditing(true)
            }}
            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Modifier"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteColumn.mutate(column.id)}
        title="Supprimer la colonne"
        message={`Supprimer la colonne "${column.name}" ? Les tâches qu'elle contient seront également supprimées.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  )
}

export function ColumnManager({ projectId, isOpen, onClose }: ColumnManagerProps) {
  const { data: columns, isLoading } = useColumns(projectId)
  const createColumn = useCreateColumn(projectId)
  const reorderColumns = useReorderColumns(projectId)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  const sorted = columns ? [...columns].sort((a, b) => a.position - b.position) : []

  function handleReorder(fromIndex: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= sorted.length) return
    const reordered = [...sorted]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    reorderColumns.mutate(reordered.map((c) => c.id))
  }

  function handleCreate() {
    if (!newName.trim()) return
    createColumn.mutate(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: () => {
          setNewName('')
          setNewColor(PRESET_COLORS[0])
        },
      },
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les colonnes" size="md">
      <div className="flex flex-col gap-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}

        {!isLoading && sorted.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Aucune colonne. Créez votre première colonne ci-dessous.
          </p>
        )}

        {sorted.length > 0 && (
          <div className="flex flex-col gap-1">
            {sorted.map((col, idx) => (
              <ColumnItem
                key={col.id}
                column={col}
                projectId={projectId}
                isFirst={idx === 0}
                isLast={idx === sorted.length - 1}
                onMoveUp={() => handleReorder(idx, 'up')}
                onMoveDown={() => handleReorder(idx, 'down')}
              />
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Ajouter une colonne</p>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
            placeholder="Nom de la colonne..."
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2 mb-3">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={cn(
                  'w-6 h-6 rounded-full transition-transform',
                  newColor === c && 'ring-2 ring-offset-2 ring-gray-600 scale-110',
                )}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
            isLoading={createColumn.isPending}
            disabled={!newName.trim()}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Ajouter
          </Button>
        </div>
      </div>
    </Modal>
  )
}
