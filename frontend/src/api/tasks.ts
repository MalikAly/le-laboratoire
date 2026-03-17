import { apiClient } from './client'
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  MoveTaskPayload,
  TaskFilters,
} from '../types/task'

export async function getTasks(objectiveId: number, filters?: TaskFilters): Promise<Task[]> {
  const response = await apiClient.get<Task[]>(`/objectives/${objectiveId}/tasks`, {
    params: filters,
  })
  return response.data
}

export async function getProjectTasks(projectId: number, filters?: TaskFilters): Promise<Task[]> {
  const response = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`, {
    params: filters,
  })
  return response.data
}

export async function getTask(taskId: number): Promise<Task> {
  const response = await apiClient.get<Task>(`/tasks/${taskId}`)
  return response.data
}

export async function createTask(objectiveId: number, data: CreateTaskPayload): Promise<Task> {
  const response = await apiClient.post<Task>(`/objectives/${objectiveId}/tasks`, data)
  return response.data
}

export async function updateTask(taskId: number, data: UpdateTaskPayload): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${taskId}`, data)
  return response.data
}

export async function moveTask(taskId: number, data: MoveTaskPayload): Promise<Task> {
  const response = await apiClient.put<Task>(`/tasks/${taskId}/move`, data)
  return response.data
}

export async function deleteTask(taskId: number): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}`)
}

export async function setTaskTags(taskId: number, tagIds: number[]): Promise<Task> {
  const response = await apiClient.put<Task>(`/tasks/${taskId}/tags`, { tag_ids: tagIds })
  return response.data
}
