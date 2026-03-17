import type { Tag } from './tag'
import type { User } from './auth'

export interface Task {
  id: number
  objective_id: number
  column_id: number
  title: string
  description: string | null
  due_date: string | null
  assignee_id: number | null
  position: number
  created_at: string
  updated_at: string
  tags: Tag[]
  assignee: User | null
}

export interface CreateTaskPayload {
  title: string
  description?: string
  column_id: number
  due_date?: string
  assignee_id?: number
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  due_date?: string | null
  assignee_id?: number | null
}

export interface MoveTaskPayload {
  column_id: number
  position: number
}

export interface TaskFilters {
  tag_id?: number
  assignee_id?: number
  column_id?: number
  due_before?: string
  due_after?: string
}
