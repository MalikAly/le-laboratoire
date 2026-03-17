export interface Objective {
  id: number
  project_id: number
  name: string
  description: string | null
  created_at: string
}

export interface CreateObjectivePayload {
  name: string
  description?: string
}

export interface UpdateObjectivePayload {
  name?: string
  description?: string
}
