import { apiClient } from './client'
import type { KanbanColumn, CreateColumnPayload, UpdateColumnPayload } from '../types/column'

export async function getColumns(projectId: number): Promise<KanbanColumn[]> {
  const response = await apiClient.get<KanbanColumn[]>(`/projects/${projectId}/columns`)
  return response.data
}

export async function createColumn(projectId: number, data: CreateColumnPayload): Promise<KanbanColumn> {
  const response = await apiClient.post<KanbanColumn>(`/projects/${projectId}/columns`, data)
  return response.data
}

export async function updateColumn(
  projectId: number,
  colId: number,
  data: UpdateColumnPayload,
): Promise<KanbanColumn> {
  const response = await apiClient.patch<KanbanColumn>(
    `/projects/${projectId}/columns/${colId}`,
    data,
  )
  return response.data
}

export async function deleteColumn(projectId: number, colId: number): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/columns/${colId}`)
}

export async function reorderColumns(
  projectId: number,
  orderedIds: number[],
): Promise<KanbanColumn[]> {
  const response = await apiClient.post<KanbanColumn[]>(
    `/projects/${projectId}/columns/reorder`,
    { ordered_ids: orderedIds },
  )
  return response.data
}
