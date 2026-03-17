import { apiClient } from './client'
import type { User } from '../types/auth'

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users')
  return response.data
}

export async function createUser(data: {
  username: string
  email: string
  password: string
  is_admin?: boolean
}): Promise<User> {
  const response = await apiClient.post<User>('/users', data)
  return response.data
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}
