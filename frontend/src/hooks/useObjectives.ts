import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getObjectives,
  createObjective,
  updateObjective,
  deleteObjective,
} from '../api/objectives'
import { queryKeys } from '../lib/queryKeys'
import type { CreateObjectivePayload, UpdateObjectivePayload } from '../types/objective'

export function useObjectives(projectId: number) {
  return useQuery({
    queryKey: queryKeys.objectives.byProject(projectId),
    queryFn: () => getObjectives(projectId),
    enabled: projectId > 0,
  })
}

export function useCreateObjective(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateObjectivePayload) => createObjective(projectId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.objectives.byProject(projectId) })
      toast.success('Objectif créé')
    },
    onError: () => {
      toast.error('Impossible de créer l\'objectif')
    },
  })
}

export function useUpdateObjective(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ objId, data }: { objId: number; data: UpdateObjectivePayload }) =>
      updateObjective(projectId, objId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.objectives.byProject(projectId) })
      toast.success('Objectif mis à jour')
    },
    onError: () => {
      toast.error('Impossible de mettre à jour l\'objectif')
    },
  })
}

export function useDeleteObjective(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (objId: number) => deleteObjective(projectId, objId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.objectives.byProject(projectId) })
      toast.success('Objectif supprimé')
    },
    onError: () => {
      toast.error('Impossible de supprimer l\'objectif')
    },
  })
}
