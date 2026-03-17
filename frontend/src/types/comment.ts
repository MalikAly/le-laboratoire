import type { User } from './auth'

export interface Comment {
  id: number
  task_id: number
  author_id: number
  content: string
  created_at: string
  author: User
}

export interface CreateCommentPayload {
  content: string
}
