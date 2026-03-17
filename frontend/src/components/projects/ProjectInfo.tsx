import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { ProjectForm } from './ProjectForm'
import { useDeleteProject } from '../../hooks/useProjects'
import type { Project } from '../../types/project'

interface ProjectInfoProps {
  project: Project
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const navigate = useNavigate()
  const deleteProject = useDeleteProject()

  function handleDelete() {
    deleteProject.mutate(project.id, {
      onSuccess: () => {
        navigate('/projects')
      },
    })
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-gray-900 truncate">{project.name}</h2>
        {project.description && (
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEditForm(true)}
          title="Modifier le projet"
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
          Modifier
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          title="Supprimer le projet"
        >
          <Trash2 className="w-4 h-4" aria-hidden="true" />
          Supprimer
        </Button>
      </div>

      <ProjectForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        project={project}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
