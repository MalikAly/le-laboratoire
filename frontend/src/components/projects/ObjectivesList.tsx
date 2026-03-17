import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useObjectives, useCreateObjective, useUpdateObjective, useDeleteObjective } from '../../hooks/useObjectives'
import { cn } from '../../lib/cn'
import type { Objective } from '../../types/objective'

interface ObjectivesListProps {
  projectId: number
}

interface ObjectiveItemProps {
  objective: Objective
  projectId: number
}

function ObjectiveItem({ objective, projectId }: ObjectiveItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(objective.name)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const updateObjective = useUpdateObjective(projectId)
  const deleteObjective = useDeleteObjective(projectId)

  function handleSaveEdit() {
    const trimmed = editName.trim()
    if (!trimmed) return
    updateObjective.mutate(
      { objId: objective.id, data: { name: trimmed } },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  function handleCancelEdit() {
    setEditName(objective.name)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gray-50">
        <input
          autoFocus
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit()
            if (e.key === 'Escape') handleCancelEdit()
          }}
          className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSaveEdit}
          disabled={updateObjective.isPending}
          className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md"
          title="Enregistrer"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancelEdit}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          title="Annuler"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-indigo-50 hover:shadow-sm transition-all group">
        <span className="flex-1 text-sm text-gray-700">{objective.name}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditName(objective.name)
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
        onConfirm={() => deleteObjective.mutate(objective.id)}
        title="Supprimer l'objectif"
        message={`Supprimer l'objectif "${objective.name}" ? Les tâches associées seront également supprimées.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  )
}

export function ObjectivesList({ projectId }: ObjectivesListProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const { data: objectives, isLoading } = useObjectives(projectId)
  const createObjective = useCreateObjective(projectId)

  function handleAddObjective() {
    const trimmed = newName.trim()
    if (!trimmed) return
    createObjective.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setNewName('')
          setShowAddForm(false)
        },
      },
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <button
        className="flex items-center gap-2 w-full text-left"
        onClick={() => setIsCollapsed((v) => !v)}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
        )}
        <span className="text-sm font-semibold text-gray-900">Objectifs</span>
        {objectives && objectives.length > 0 && (
          <span className="text-xs text-gray-500 ml-1">({objectives.length})</span>
        )}
      </button>

      <div className={cn('mt-3', isCollapsed && 'hidden')}>
        {isLoading && (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {objectives && objectives.length === 0 && !showAddForm && (
          <p className="text-xs text-gray-400 py-2 px-3">Aucun objectif pour ce projet.</p>
        )}
        {objectives && objectives.map((obj) => (
          <ObjectiveItem key={obj.id} objective={obj} projectId={projectId} />
        ))}

        {showAddForm && (
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-gray-50 mt-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddObjective()
                if (e.key === 'Escape') {
                  setNewName('')
                  setShowAddForm(false)
                }
              }}
              placeholder="Nom de l'objectif..."
              className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddObjective}
              disabled={createObjective.isPending || !newName.trim()}
              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md disabled:opacity-40"
              title="Ajouter"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setNewName('')
                setShowAddForm(false)
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
              title="Annuler"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {!showAddForm && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-gray-500"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            Ajouter un objectif
          </Button>
        )}
      </div>
    </div>
  )
}
