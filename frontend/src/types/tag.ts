export interface Tag {
  id: number
  name: string
  color: string
  project_id: number
}

export interface CreateTagPayload {
  name: string
  color: string
}

export interface UpdateTagPayload {
  name?: string
  color?: string
}
