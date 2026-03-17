import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { SlideOver } from '../ui/SlideOver'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { TagPicker } from '../tags/TagPicker'
import { TagBadge } from '../tags/TagBadge'
import { TaskComments } from './TaskComments'
import { TaskAttachments } from './TaskAttachments'
import { useTask, useUpdateTask, useDeleteTask, useSetTaskTags } from '../../hooks/useTasks'
import { useUsers } from '../../hooks/useUsers'
import { moveTask } from '../../api/tasks'
import { queryKeys } from '../../lib/queryKeys'
import type { KanbanColumn } from '../../types/column'

interface TaskDetailPanelProps {
  projectId: number
  taskId: number | null
  columns: KanbanColumn[]
  onClose: () => void
}

export function TaskDetailPanel({ projectId, taskId, columns, onClose }: TaskDetailPanelProps) {
  const queryClient = useQueryClient()
  const { data: task, isLoading } = useTask(taskId)
  const { data: users } = useUsers()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const setTaskTags = useSetTaskTags()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description ?? '')
    }
  }, [task])

  function handleTitleBlur() {
    if (!task) return
    const trimmed = title.trim()
    if (!trimmed || trimmed === task.title) return
    updateTask.mutate({ taskId: task.id, data: { title: trimmed } })
  }

  function handleDescriptionBlur() {
    if (!task) return
    const trimmed = description.trim()
    const current = task.description ?? ''
    if (trimmed === current) return
    updateTask.mutate({ taskId: task.id, data: { description: trimmed || undefined } })
  }

  function handleColumnChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!task) return
    const colId = Number(e.target.value)
    if (colId === task.column_id) return
    moveTask(task.id, { column_id: colId, position: 0 })
      .then(() => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId, undefined) })
        void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(task.id) })
      })
      .catch(() => undefined)
  }

  function handleAssigneeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!task) return
    const val = e.target.value
    const assigneeId = val === '' ? null : Number(val)
    updateTask.mutate({ taskId: task.id, data: { assignee_id: assigneeId } })
  }

  function handleDueDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!task) return
    const val = e.target.value
    updateTask.mutate({ taskId: task.id, data: { due_date: val || null } })
  }

  function handleTagsChange(tagIds: number[]) {
    if (!task) return
    setTaskTags.mutate({ taskId: task.id, tagIds })
  }

  function handleDelete() {
    if (!task) return
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  const isOpen = taskId !== null

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Détail de la tâche" width="xl">
      {isLoading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {!isLoading && task && (
        <div className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              Titre
            </label>
            <div className="flex items-start gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
                className="flex-1 text-base font-semibold text-gray-900 border border-transparent rounded-md px-2 py-1 hover:border-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-colors"
              />
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                title="Supprimer la tâche"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Column / Status */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              Colonne
            </label>
            <select
              value={task.column_id}
              onChange={handleColumnChange}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              Assigné à
            </label>
            <select
              value={task.assignee_id ?? ''}
              onChange={handleAssigneeChange}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Non assigné</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              Date d'échéance
            </label>
            <input
              type="date"
              value={task.due_date ? task.due_date.slice(0, 10) : ''}
              onChange={handleDueDateChange}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              Tags
            </label>
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {task.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            )}
            {showTagPicker ? (
              <TagPicker
                projectId={projectId}
                selectedTagIds={task.tags.map((t) => t.id)}
                onChange={(ids) => {
                  handleTagsChange(ids)
                  setShowTagPicker(false)
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowTagPicker(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Modifier les tags
              </button>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              rows={4}
              placeholder="Ajouter une description..."
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <hr className="border-gray-200" />

          <TaskComments taskId={task.id} />

          <hr className="border-gray-200" />

          <TaskAttachments taskId={task.id} />
        </div>
      )}

      {!isLoading && !task && taskId !== null && (
        <div className="flex justify-center py-8">
          <p className="text-sm text-gray-500">Tâche introuvable.</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer la tâche"
        message="Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
      />
    </SlideOver>
  )
}
