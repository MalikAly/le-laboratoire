export interface Project {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface CreateProjectPayload {
  name: string
  description?: string
}

export interface UpdateProjectPayload {
  name?: string
  description?: string
}
