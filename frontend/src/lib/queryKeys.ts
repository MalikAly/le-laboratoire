export const queryKeys = {
  projects: {
    all: () => ['projects'] as const,
    detail: (id: number) => ['projects', id] as const,
  },
  columns: {
    byProject: (projectId: number) => ['columns', projectId] as const,
  },
  objectives: {
    byProject: (projectId: number) => ['objectives', projectId] as const,
  },
  tasks: {
    byProject: (projectId: number, filters?: Record<string, unknown>) =>
      ['tasks', projectId, filters] as const,
    detail: (id: number) => ['tasks', id] as const,
  },
  tags: {
    byProject: (projectId: number) => ['tags', projectId] as const,
  },
  comments: {
    byTask: (taskId: number) => ['comments', taskId] as const,
  },
  attachments: {
    byTask: (taskId: number) => ['attachments', taskId] as const,
  },
  users: {
    all: () => ['users'] as const,
  },
}
