import { useState } from 'react'
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '../../hooks/useTags'
import { cn } from '../../lib/cn'
import type { Tag } from '../../types/tag'

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

interface TagManagerProps {
  projectId: number
  isOpen: boolean
  onClose: () => void
}

interface TagItemProps {
  tag: Tag
  projectId: number
}

function TagItem({ tag, projectId }: TagItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(tag.name)
  const [editColor, setEditColor] = useState(tag.color)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const updateTag = useUpdateTag(projectId)
  const deleteTag = useDeleteTag(projectId)

  function handleSave() {
    if (!editName.trim()) return
    updateTag.mutate(
      { tagId: tag.id, data: { name: editName.trim(), color: editColor } },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  function handleCancelEdit() {
    setEditName(tag.name)
    setEditColor(tag.color)
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
        <div className="flex flex-wrap gap-2 mb-3">
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
        <div className="mb-3">
          <label className="text-xs text-gray-500 mb-1 block">Couleur personnalisée</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={editColor}
              onChange={(e) => {
                const val = e.target.value
                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setEditColor(val)
              }}
              placeholder="#000000"
              className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={updateTag.isPending}
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
          style={{ backgroundColor: tag.color }}
          aria-hidden="true"
        />
        <span className="flex-1 text-sm text-gray-800">{tag.name}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditName(tag.name)
              setEditColor(tag.color)
              setIsEditing(true)
            }}
            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
            title="Modifier"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteTag.mutate(tag.id)}
        title="Supprimer le tag"
        message={`Supprimer le tag "${tag.name}" ? Il sera retiré de toutes les tâches.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  )
}

export function TagManager({ projectId, isOpen, onClose }: TagManagerProps) {
  const { data: tags, isLoading } = useTags(projectId)
  const createTag = useCreateTag(projectId)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  function handleCreate() {
    if (!newName.trim()) return
    createTag.mutate(
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
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les tags" size="md">
      <div className="flex flex-col gap-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}

        {!isLoading && (!tags || tags.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-4">
            Aucun tag. Créez votre premier tag ci-dessous.
          </p>
        )}

        {tags && tags.length > 0 && (
          <div className="flex flex-col gap-1">
            {tags.map((tag) => (
              <TagItem key={tag.id} tag={tag} projectId={projectId} />
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Ajouter un tag</p>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
            placeholder="Nom du tag..."
            className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex flex-wrap gap-2 mb-3">
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
          <div className="mb-3">
            <label className="text-xs text-gray-500 mb-1 block">Couleur personnalisée</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={newColor}
                onChange={(e) => {
                  const val = e.target.value
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setNewColor(val)
                }}
                placeholder="#000000"
                className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
            isLoading={createTag.isPending}
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
