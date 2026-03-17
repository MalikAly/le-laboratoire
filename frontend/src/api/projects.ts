import { apiClient } from './client'
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '../types/project'

export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>('/projects')
  return response.data
}

export async function getProject(id: number): Promise<Project> {
  const response = await apiClient.get<Project>(`/projects/${id}`)
  return response.data
}

export async function createProject(data: CreateProjectPayload): Promise<Project> {
  const response = await apiClient.post<Project>('/projects', data)
  return response.data
}

export async function updateProject(id: number, data: UpdateProjectPayload): Promise<Project> {
  const response = await apiClient.patch<Project>(`/projects/${id}`, data)
  return response.data
}

export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete(`/projects/${id}`)
}
