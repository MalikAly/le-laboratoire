import { KanbanCard } from './KanbanCard'
import type { Task } from '../../types/task'
import type { KanbanColumn } from '../../types/column'

interface KanbanDragOverlayProps {
  task: Task | null
  column: KanbanColumn | null
}

export function KanbanDragOverlay({ task, column }: KanbanDragOverlayProps) {
  if (!task || !column) return null

  return (
    <KanbanCard
      task={task}
      column={column}
      onTaskClick={() => undefined}
      isDragOverlay
    />
  )
}
