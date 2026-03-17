import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAttachments, uploadAttachment, deleteAttachment } from '../api/attachments'
import { queryKeys } from '../lib/queryKeys'

export function useAttachments(taskId: number) {
  return useQuery({
    queryKey: queryKeys.attachments.byTask(taskId),
    queryFn: () => getAttachments(taskId),
    enabled: taskId > 0,
  })
}

export function useUploadAttachment(taskId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(taskId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attachments.byTask(taskId) })
      toast.success('Fichier téléversé')
    },
    onError: () => {
      toast.error('Impossible de téléverser le fichier')
    },
  })
}

export function useDeleteAttachment(taskId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: number) => deleteAttachment(attachmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attachments.byTask(taskId) })
      toast.success('Fichier supprimé')
    },
    onError: () => {
      toast.error('Impossible de supprimer le fichier')
    },
  })
}
