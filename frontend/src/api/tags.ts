import { apiClient } from './client'
import type { Tag, CreateTagPayload, UpdateTagPayload } from '../types/tag'

export async function getTags(projectId: number): Promise<Tag[]> {
  const response = await apiClient.get<Tag[]>(`/projects/${projectId}/tags`)
  return response.data
}

export async function createTag(projectId: number, data: CreateTagPayload): Promise<Tag> {
  const response = await apiClient.post<Tag>(`/projects/${projectId}/tags`, data)
  return response.data
}

export async function updateTag(
  projectId: number,
  tagId: number,
  data: UpdateTagPayload,
): Promise<Tag> {
  const response = await apiClient.patch<Tag>(`/projects/${projectId}/tags/${tagId}`, data)
  return response.data
}

export async function deleteTag(projectId: number, tagId: number): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/tags/${tagId}`)
}
