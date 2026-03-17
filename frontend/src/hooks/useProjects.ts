import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getProjects, getProject, createProject, updateProject, deleteProject } from '../api/projects'
import { queryKeys } from '../lib/queryKeys'
import type { CreateProjectPayload, UpdateProjectPayload } from '../types/project'

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all(),
    queryFn: getProjects,
  })
}

export function useProject(id: number) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => getProject(id),
    enabled: !isNaN(id) && id > 0,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProjectPayload) => createProject(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
      toast.success('Projet créé avec succès')
    },
    onError: () => {
      toast.error('Impossible de créer le projet')
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectPayload }) =>
      updateProject(id, data),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(project.id) })
      toast.success('Projet mis à jour')
    },
    onError: () => {
      toast.error('Impossible de mettre à jour le projet')
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() })
      toast.success('Projet supprimé')
    },
    onError: () => {
      toast.error('Impossible de supprimer le projet')
    },
  })
}
