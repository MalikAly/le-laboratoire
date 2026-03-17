import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects'
import type { Project } from '../../types/project'

const schema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(200, 'Le nom est trop long (200 caractères max)'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface ProjectFormProps {
  isOpen: boolean
  onClose: () => void
  project?: Project
}

export function ProjectForm({ isOpen, onClose, project }: ProjectFormProps) {
  const isEdit = project !== undefined
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        name: project?.name ?? '',
        description: project?.description ?? '',
      })
    }
  }, [isOpen, project, reset])

  async function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      description: values.description || undefined,
    }
    if (isEdit && project) {
      await updateProject.mutateAsync({ id: project.id, data: payload })
    } else {
      await createProject.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Modifier le projet' : 'Nouveau projet'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nom du projet"
          placeholder="Mon super projet"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Description optionnelle..."
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            {...register('description')}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting || createProject.isPending || updateProject.isPending}
          >
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
