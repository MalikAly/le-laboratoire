import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useComments, useCreateComment, useDeleteComment } from '../../hooks/useComments'
import { useAuth } from '../../contexts/AuthContext'
import { formatRelative } from '../../lib/dates'

interface TaskCommentsProps {
  taskId: number
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth()
  const { data: comments, isLoading } = useComments(taskId)
  const createComment = useCreateComment(taskId)
  const deleteComment = useDeleteComment(taskId)
  const [content, setContent] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  function handleSubmit() {
    if (!content.trim()) return
    createComment.mutate(
      { content: content.trim() },
      { onSuccess: () => setContent('') },
    )
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Commentaires</h3>

      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {comments && comments.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">Aucun commentaire pour l'instant.</p>
      )}

      <div className="flex flex-col gap-4 mb-4">
        {comments?.map((comment) => {
          const canDelete = user?.is_admin || user?.id === comment.author_id
          return (
            <div key={comment.id} className="flex gap-3">
              <Avatar name={comment.author.username} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-900">{comment.author.username}</span>
                  <span className="text-xs text-gray-400">{formatRelative(comment.created_at)}</span>
                  {canDelete && (
                    <button
                      onClick={() => setDeleteId(comment.id)}
                      className="ml-auto p-0.5 text-gray-300 hover:text-red-500 transition-colors"
                      title="Supprimer le commentaire"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
          }}
          placeholder="Ajouter un commentaire... (Ctrl+Entrée pour envoyer)"
          rows={3}
          className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim()}
          isLoading={createComment.isPending}
          className="self-end"
        >
          Envoyer
        </Button>
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId !== null) deleteComment.mutate(deleteId)
        }}
        title="Supprimer le commentaire"
        message="Êtes-vous sûr de vouloir supprimer ce commentaire ?"
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
