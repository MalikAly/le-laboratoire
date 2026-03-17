import { apiClient } from './client'
import type { Objective, CreateObjectivePayload, UpdateObjectivePayload } from '../types/objective'

export async function getObjectives(projectId: number): Promise<Objective[]> {
  const response = await apiClient.get<Objective[]>(`/projects/${projectId}/objectives`)
  return response.data
}

export async function createObjective(
  projectId: number,
  data: CreateObjectivePayload,
): Promise<Objective> {
  const response = await apiClient.post<Objective>(`/projects/${projectId}/objectives`, data)
  return response.data
}

export async function updateObjective(
  projectId: number,
  objId: number,
  data: UpdateObjectivePayload,
): Promise<Objective> {
  const response = await apiClient.patch<Objective>(
    `/projects/${projectId}/objectives/${objId}`,
    data,
  )
  return response.data
}

export async function deleteObjective(projectId: number, objId: number): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/objectives/${objId}`)
}
