import { useState, useMemo, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { KanbanColumn } from './KanbanColumn'
import { KanbanDragOverlay } from './KanbanDragOverlay'
import { useMoveTask } from '../../hooks/useTasks'
import { createTask } from '../../api/tasks'
import { queryKeys } from '../../lib/queryKeys'
import { Button } from '../ui/Button'
import type { KanbanColumn as KanbanColumnType } from '../../types/column'
import type { Task } from '../../types/task'
import type { Objective } from '../../types/objective'

interface KanbanBoardProps {
  projectId: number
  columns: KanbanColumnType[]
  tasks: Task[]
  objectives: Objective[]
  onTaskClick: (id: number) => void
  onOpenColumnManager: () => void
}

export function KanbanBoard({
  projectId,
  columns,
  tasks,
  objectives,
  onTaskClick,
  onOpenColumnManager,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [localTasks, setLocalTasks] = useState<Task[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const moveTask = useMoveTask(projectId)
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const columnMap = useMemo(() => {
    const map = new Map<number, KanbanColumnType>()
    for (const col of columns) {
      map.set(col.id, col)
    }
    return map
  }, [columns])

  const displayTasks = isDragging ? localTasks : tasks

  const columnTaskMap = useMemo(() => {
    const map = new Map<number, Task[]>()
    for (const col of columns) {
      map.set(col.id, [])
    }
    for (const task of displayTasks) {
      const colTasks = map.get(task.column_id)
      if (colTasks) {
        colTasks.push(task)
      }
    }
    for (const [, colTasks] of map) {
      colTasks.sort((a, b) => a.position - b.position)
    }
    return map
  }, [columns, displayTasks])

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id)
      if (task) {
        setActiveTask(task)
        setLocalTasks([...tasks])
        setIsDragging(true)
      }
    },
    [tasks],
  )

  const onDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = active.id as number
      const overId = over.id

      setLocalTasks((prev) => {
        const activeItem = prev.find((t) => t.id === activeId)
        if (!activeItem) return prev

        let targetColumnId: number | null = null

        if (typeof overId === 'string' && overId.startsWith('column-')) {
          targetColumnId = parseInt(overId.replace('column-', ''), 10)
        } else {
          const overTask = prev.find((t) => t.id === overId)
          if (overTask) {
            targetColumnId = overTask.column_id
          }
        }

        if (targetColumnId === null || targetColumnId === activeItem.column_id) return prev

        return prev.map((t) =>
          t.id === activeId ? { ...t, column_id: targetColumnId! } : t,
        )
      })
    },
    [],
  )

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveTask(null)
      setIsDragging(false)

      if (!over) return

      const activeId = active.id as number
      const overId = over.id

      const activeItem = localTasks.find((t) => t.id === activeId)
      if (!activeItem) return

      let targetColumnId = activeItem.column_id

      if (typeof overId === 'string' && overId.startsWith('column-')) {
        targetColumnId = parseInt(overId.replace('column-', ''), 10)
      } else {
        const overTask = localTasks.find((t) => t.id === overId)
        if (overTask) {
          targetColumnId = overTask.column_id
        }
      }

      const tasksInTargetColumn = localTasks
        .filter((t) => t.column_id === targetColumnId && t.id !== activeId)
        .sort((a, b) => a.position - b.position)

      let position = tasksInTargetColumn.length

      if (typeof overId !== 'string') {
        const overIndex = tasksInTargetColumn.findIndex((t) => t.id === overId)
        if (overIndex !== -1) {
          position = overIndex
        }
      }

      moveTask.mutate({ taskId: activeId, data: { column_id: targetColumnId, position } })
    },
    [localTasks, moveTask],
  )

  async function handleAddTask(columnId: number, title: string, objectiveId: number) {
    const colTasks = columnTaskMap.get(columnId) ?? []
    const position = colTasks.length
    try {
      await createTask(objectiveId, { title, column_id: columnId, position })
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId, undefined) })
    } catch {
      // error handled by interceptor toast
    }
  }

  const activeColumn = activeTask ? (columnMap.get(activeTask.column_id) ?? null) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={columnTaskMap.get(column.id) ?? []}
            objectives={objectives}
            onTaskClick={onTaskClick}
            onAddTask={handleAddTask}
            onEditColumn={() => onOpenColumnManager()}
            onDeleteColumn={() => onOpenColumnManager()}
          />
        ))}
        <div className="shrink-0 flex items-start pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenColumnManager}
            className="text-gray-500 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Ajouter une colonne
          </Button>
        </div>
      </div>

      <DragOverlay>
        <KanbanDragOverlay task={activeTask} column={activeColumn} />
      </DragOverlay>
    </DndContext>
  )
}
