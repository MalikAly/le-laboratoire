import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getUsers, createUser, deleteUser } from '../api/users'
import { queryKeys } from '../lib/queryKeys'

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all(),
    queryFn: getUsers,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      username: string
      email: string
      password: string
      is_admin?: boolean
    }) => createUser(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
      toast.success('Utilisateur créé')
    },
    onError: () => {
      toast.error('Impossible de créer l\'utilisateur')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })
      toast.success('Utilisateur supprimé')
    },
    onError: () => {
      toast.error('Impossible de supprimer l\'utilisateur')
    },
  })
}
