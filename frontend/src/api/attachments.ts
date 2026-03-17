import { apiClient } from './client'
import { API_BASE_URL } from '../lib/constants'
import { getAccessToken } from './client'
import type { Attachment } from '../types/attachment'

export async function getAttachments(taskId: number): Promise<Attachment[]> {
  const response = await apiClient.get<Attachment[]>(`/tasks/${taskId}/attachments`)
  return response.data
}

export async function uploadAttachment(taskId: number, file: File): Promise<Attachment> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<Attachment>(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function deleteAttachment(attachmentId: number): Promise<void> {
  await apiClient.delete(`/attachments/${attachmentId}`)
}

export function getDownloadUrl(attachmentId: number): string {
  const token = getAccessToken()
  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${API_BASE_URL}/attachments/${attachmentId}/download${tokenParam}`
}
