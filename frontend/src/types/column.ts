export interface KanbanColumn {
  id: number
  project_id: number
  name: string
  position: number
  color: string | null
}

export interface CreateColumnPayload {
  name: string
  color?: string
}

export interface UpdateColumnPayload {
  name?: string
  color?: string
}
