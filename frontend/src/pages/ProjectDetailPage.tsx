import { useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Settings, Tag } from 'lucide-react'
import { useProject } from '../hooks/useProjects'
import { useColumns } from '../hooks/useColumns'
import { useObjectives } from '../hooks/useObjectives'
import { useProjectTasks } from '../hooks/useTasks'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
import { ProjectInfo } from '../components/projects/ProjectInfo'
import { ObjectivesList } from '../components/projects/ObjectivesList'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import { ColumnManager } from '../components/kanban/ColumnManager'
import { TaskDetailPanel } from '../components/tasks/TaskDetailPanel'
import { TagManager } from '../components/tags/TagManager'
import { FilterBar } from '../components/filters/FilterBar'
import type { TaskFilters } from '../types/filters'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const id = Number(projectId)
  const [searchParams, setSearchParams] = useSearchParams()
  const [showColumnManager, setShowColumnManager] = useState(false)
  const [showTagManager, setShowTagManager] = useState(false)

  const activeTaskId = searchParams.get('task') ? Number(searchParams.get('task')) : null

  const filters: TaskFilters = {
    tag_id: searchParams.get('tag_id') ? Number(searchParams.get('tag_id')) : undefined,
    assignee_id: searchParams.get('assignee_id')
      ? Number(searchParams.get('assignee_id'))
      : undefined,
    due_before: searchParams.get('due_before') ?? undefined,
  }

  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(id)
  const { data: columns, isLoading: columnsLoading } = useColumns(id)
  const { data: objectives } = useObjectives(id)
  const { data: tasks, isLoading: tasksLoading } = useProjectTasks(id, filters)

  function handleFiltersChange(newFilters: TaskFilters) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newFilters.tag_id !== undefined) {
        next.set('tag_id', String(newFilters.tag_id))
      } else {
        next.delete('tag_id')
      }
      if (newFilters.assignee_id !== undefined) {
        next.set('assignee_id', String(newFilters.assignee_id))
      } else {
        next.delete('assignee_id')
      }
      if (newFilters.due_before !== undefined) {
        next.set('due_before', newFilters.due_before)
      } else {
        next.delete('due_before')
      }
      return next
    })
  }

  function handleTaskClick(taskId: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('task', String(taskId))
      return next
    })
  }

  function handleCloseTask() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('task')
      return next
    })
  }

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-sm text-red-600">Projet introuvable ou erreur de chargement.</p>
        <Link
          to="/projects"
          className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux projets
        </Link>
      </div>
    )
  }

  const isLoading = columnsLoading || tasksLoading

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Retour aux projets
        </Link>

        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <ProjectInfo project={project} />
          </div>
          <div>
            <ObjectivesList projectId={id} />
          </div>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3 py-3 border-t border-gray-200">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowColumnManager(true)}
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
            Gérer les colonnes
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTagManager(true)}
          >
            <Tag className="w-4 h-4" aria-hidden="true" />
            Gérer les tags
          </Button>
          <div className="border-l border-gray-200 h-5 mx-1" />
          <FilterBar projectId={id} filters={filters} onChange={handleFiltersChange} />
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <KanbanBoard
            projectId={id}
            columns={columns ?? []}
            tasks={tasks ?? []}
            objectives={objectives ?? []}
            onTaskClick={handleTaskClick}
            onOpenColumnManager={() => setShowColumnManager(true)}
          />
        )}
      </div>

      {/* Task detail panel */}
      <TaskDetailPanel
        projectId={id}
        taskId={activeTaskId}
        columns={columns ?? []}
        onClose={handleCloseTask}
      />

      {/* Column manager modal */}
      <ColumnManager
        projectId={id}
        isOpen={showColumnManager}
        onClose={() => setShowColumnManager(false)}
      />

      {/* Tag manager modal */}
      <TagManager
        projectId={id}
        isOpen={showTagManager}
        onClose={() => setShowTagManager(false)}
      />
    </div>
  )
}
