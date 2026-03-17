import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getProjectTasks,
  getTask,
  createTask,
  updateTask,
  moveTask,
  deleteTask,
  setTaskTags,
} from '../api/tasks'
import { queryKeys } from '../lib/queryKeys'
import type { Task, CreateTaskPayload, UpdateTaskPayload, MoveTaskPayload, TaskFilters } from '../types/task'

export function useProjectTasks(projectId: number, filters?: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks.byProject(projectId, filters as Record<string, unknown> | undefined),
    queryFn: () => getProjectTasks(projectId, filters),
    enabled: projectId > 0,
  })
}

export function useTask(taskId: number | null) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId ?? 0),
    queryFn: () => getTask(taskId!),
    enabled: taskId !== null && taskId > 0,
  })
}

export function useCreateTask(objectiveId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskPayload) => createTask(objectiveId, data),
    onSuccess: (_task, _variables) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tâche créée')
    },
    onError: () => {
      toast.error('Impossible de créer la tâche')
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: UpdateTaskPayload }) =>
      updateTask(taskId, data),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(task.id) })
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: () => {
      toast.error('Impossible de mettre à jour la tâche')
    },
  })
}

export function useMoveTask(projectId: number, filters?: TaskFilters) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: number; data: MoveTaskPayload }) =>
      moveTask(taskId, data),
    onMutate: async (variables) => {
      const queryKey = queryKeys.tasks.byProject(projectId, filters as Record<string, unknown> | undefined)
      await queryClient.cancelQueries({ queryKey })
      const previousTasks = queryClient.getQueryData<Task[]>(queryKey)
      queryClient.setQueryData<Task[]>(
        queryKeys.tasks.byProject(projectId, undefined),
        (old) => {
          if (!old) return old
          return old.map((t) =>
            t.id === variables.taskId
              ? { ...t, column_id: variables.data.column_id, position: variables.data.position }
              : t,
          )
        },
      )
      return { previousTasks }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          queryKeys.tasks.byProject(projectId, filters as Record<string, unknown> | undefined),
          context.previousTasks,
        )
      }
      toast.error('Impossible de déplacer la tâche')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId, undefined) })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (taskId: number) => deleteTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tâche supprimée')
    },
    onError: () => {
      toast.error('Impossible de supprimer la tâche')
    },
  })
}

export function useSetTaskTags() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, tagIds }: { taskId: number; tagIds: number[] }) =>
      setTaskTags(taskId, tagIds),
    onSuccess: (task) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(task.id) })
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: () => {
      toast.error('Impossible de mettre à jour les tags')
    },
  })
}
