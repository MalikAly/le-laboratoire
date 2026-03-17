import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getComments, createComment, deleteComment } from '../api/comments'
import { queryKeys } from '../lib/queryKeys'
import type { CreateCommentPayload } from '../types/comment'

export function useComments(taskId: number) {
  return useQuery({
    queryKey: queryKeys.comments.byTask(taskId),
    queryFn: () => getComments(taskId),
    enabled: taskId > 0,
  })
}

export function useCreateComment(taskId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCommentPayload) => createComment(taskId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
    },
    onError: () => {
      toast.error('Impossible d\'envoyer le commentaire')
    },
  })
}

export function useDeleteComment(taskId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.comments.byTask(taskId) })
      toast.success('Commentaire supprimé')
    },
    onError: () => {
      toast.error('Impossible de supprimer le commentaire')
    },
  })
}
