import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getTags, createTag, updateTag, deleteTag } from '../api/tags'
import { queryKeys } from '../lib/queryKeys'
import type { CreateTagPayload, UpdateTagPayload } from '../types/tag'

export function useTags(projectId: number) {
  return useQuery({
    queryKey: queryKeys.tags.byProject(projectId),
    queryFn: () => getTags(projectId),
    enabled: projectId > 0,
  })
}

export function useCreateTag(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTagPayload) => createTag(projectId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tags.byProject(projectId) })
      toast.success('Tag créé')
    },
    onError: () => {
      toast.error('Impossible de créer le tag')
    },
  })
}

export function useUpdateTag(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: number; data: UpdateTagPayload }) =>
      updateTag(projectId, tagId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tags.byProject(projectId) })
      toast.success('Tag mis à jour')
    },
    onError: () => {
      toast.error('Impossible de mettre à jour le tag')
    },
  })
}

export function useDeleteTag(projectId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tagId: number) => deleteTag(projectId, tagId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tags.byProject(projectId) })
      toast.success('Tag supprimé')
    },
    onError: () => {
      toast.error('Impossible de supprimer le tag')
    },
  })
}
