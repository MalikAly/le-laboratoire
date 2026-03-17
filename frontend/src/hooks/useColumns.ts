import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} from '../api/columns'
import { queryKeys } from '../lib/queryKeys'
import type { CreateColumnPayload, UpdateColumnPayload } from '../types/column'

export function useColumns(projectId: number) {
  return useQuery({
    queryKey: queryKeys.columns.byProject(projectId),
    queryFn: () => getColumns(projectId),
    enabled: projectId > 0,
  })
}

export function useCreateColumn(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateColumnPayload) => createColumn(projectId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.columns.byProject(projectId) })
      toast.success('Colonne créée')
    },
    onError: () => {
      toast.error('Impossible de créer la colonne')
    },
  })
}

export function useUpdateColumn(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ colId, data }: { colId: number; data: UpdateColumnPayload }) =>
      updateColumn(projectId, colId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.columns.byProject(projectId) })
      toast.success('Colonne mise à jour')
    },
    onError: () => {
      toast.error('Impossible de mettre à jour la colonne')
    },
  })
}

export function useDeleteColumn(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (colId: number) => deleteColumn(projectId, colId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.columns.byProject(projectId) })
      toast.success('Colonne supprimée')
    },
    onError: () => {
      toast.error('Impossible de supprimer la colonne')
    },
  })
}

export function useReorderColumns(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: number[]) => reorderColumns(projectId, orderedIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.columns.byProject(projectId) })
    },
    onError: () => {
      toast.error('Impossible de réordonner les colonnes')
    },
  })
}
