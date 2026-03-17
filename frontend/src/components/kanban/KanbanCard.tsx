import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/cn'
import { formatDate } from '../../lib/dates'
import type { Task } from '../../types/task'
import type { KanbanColumn } from '../../types/column'

interface KanbanCardProps {
  task: Task
  column: KanbanColumn
  onTaskClick: (id: number) => void
  isDragOverlay?: boolean
}

export function KanbanCard({ task, column, onTaskClick, isDragOverlay = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task, columnId: task.column_id },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.due_date
    ? new Date(task.due_date) < new Date(new Date().toDateString())
    : false

  const borderColor = column.color ?? '#6366f1'

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: borderColor }}
      {...attributes}
      {...listeners}
      onClick={() => onTaskClick(task.id)}
      className={cn(
        'bg-white rounded-lg border border-gray-200 border-l-4 p-3 shadow-sm',
        'cursor-pointer hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-150',
        'select-none',
        isDragging && !isDragOverlay && 'opacity-40 cursor-grabbing',
        isDragOverlay && 'shadow-xl rotate-1 cursor-grabbing',
      )}
    >
      <p className="text-sm font-medium text-gray-900 leading-snug mb-2">{task.title}</p>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <Badge key={tag.id} color={tag.color}>
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        {task.due_date && (
          <div className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-red-600' : 'text-gray-400')}>
            <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{formatDate(task.due_date)}</span>
          </div>
        )}
        {!task.due_date && <span />}
        {task.assignee && (
          <Avatar name={task.assignee.username} size="sm" />
        )}
      </div>
    </div>
  )
}
