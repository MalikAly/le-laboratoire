import { apiClient } from './client'
import type { Comment, CreateCommentPayload } from '../types/comment'

export async function getComments(taskId: number): Promise<Comment[]> {
  const response = await apiClient.get<Comment[]>(`/tasks/${taskId}/comments`)
  return response.data
}

export async function createComment(
  taskId: number,
  data: CreateCommentPayload,
): Promise<Comment> {
  const response = await apiClient.post<Comment>(`/tasks/${taskId}/comments`, data)
  return response.data
}

export async function updateComment(
  commentId: number,
  data: CreateCommentPayload,
): Promise<Comment> {
  const response = await apiClient.patch<Comment>(`/comments/${commentId}`, data)
  return response.data
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`)
}
