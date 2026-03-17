import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FolderKanban, Calendar } from 'lucide-react'
import { useProjects } from '../hooks/useProjects'
import { formatDate } from '../lib/dates'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ProjectForm } from '../components/projects/ProjectForm'
import type { Project } from '../types/project'

export function ProjectsPage() {
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const { data: projects, isLoading, isError } = useProjects()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-red-600">
          Impossible de charger les projets. Veuillez réessayer.
        </p>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Projets</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {projects?.length ?? 0} projet{(projects?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          Nouveau projet
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet"
          description="Commencez par créer votre premier projet pour organiser vos tâches."
          action={{ label: 'Créer un projet', onClick: () => setShowCreateModal(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: Project) => (
            <button
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="group text-left bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-indigo-400 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                  <FolderKanban className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                {project.name}
              </h3>
              {project.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{project.description}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-auto">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Créé le {formatDate(project.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <ProjectForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}
