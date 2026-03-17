import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { KanbanCard } from './KanbanCard'
import { DropdownMenu } from '../ui/DropdownMenu'
import { cn } from '../../lib/cn'
import type { KanbanColumn as KanbanColumnType } from '../../types/column'
import type { Task } from '../../types/task'
import type { Objective } from '../../types/objective'

interface KanbanColumnProps {
  column: KanbanColumnType
  tasks: Task[]
  objectives: Objective[]
  onTaskClick: (id: number) => void
  onAddTask: (columnId: number, title: string, objectiveId: number) => void
  onEditColumn: (column: KanbanColumnType) => void
  onDeleteColumn: (column: KanbanColumnType) => void
}

export function KanbanColumn({
  column,
  tasks,
  objectives,
  onTaskClick,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<number>(
    objectives[0]?.id ?? 0,
  )

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', columnId: column.id },
  })

  const dotColor = column.color ?? '#6366f1'

  function handleAddTask() {
    const trimmed = newTitle.trim()
    if (!trimmed || !selectedObjectiveId) return
    onAddTask(column.id, trimmed, selectedObjectiveId)
    setNewTitle('')
    setShowAddForm(false)
  }

  const menuItems = [
    {
      label: 'Modifier',
      icon: Pencil,
      onClick: () => onEditColumn(column),
      variant: 'default' as const,
    },
    {
      label: 'Supprimer',
      icon: Trash2,
      onClick: () => onDeleteColumn(column),
      variant: 'danger' as const,
    },
  ]

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold text-gray-800 truncate">{column.name}</span>
          <span className="text-xs text-gray-400 shrink-0">({tasks.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAddForm(true)}
            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Ajouter une tâche"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
          <DropdownMenu
            trigger={
              <button
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Options de la colonne"
              >
                <MoreVertical className="w-4 h-4" aria-hidden="true" />
              </button>
            }
            items={menuItems}
          />
        </div>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={cn(
            'flex flex-col gap-2 p-2 flex-1 min-h-[120px] transition-colors',
            isOver && 'bg-indigo-50',
          )}
        >
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              column={column}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </SortableContext>

      {showAddForm && (
        <div className="p-2 border-t border-gray-200">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask()
              if (e.key === 'Escape') {
                setNewTitle('')
                setShowAddForm(false)
              }
            }}
            placeholder="Titre de la tâche..."
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {objectives.length > 0 && (
            <select
              value={selectedObjectiveId}
              onChange={(e) => setSelectedObjectiveId(Number(e.target.value))}
              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {objectives.map((obj) => (
                <option key={obj.id} value={obj.id}>
                  {obj.name}
                </option>
              ))}
            </select>
          )}
          {objectives.length === 0 && (
            <p className="text-xs text-amber-600 mb-2">
              Aucun objectif disponible. Créez d'abord un objectif.
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              disabled={!newTitle.trim() || !selectedObjectiveId}
              className="flex-1 text-xs bg-indigo-600 text-white rounded-md px-3 py-1.5 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Ajouter
            </button>
            <button
              onClick={() => {
                setNewTitle('')
                setShowAddForm(false)
              }}
              className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
