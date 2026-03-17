import { useState, useRef } from 'react'
import { Paperclip, Trash2, Upload, Download, AlertCircle } from 'lucide-react'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '../../hooks/useAttachments'
import { getDownloadUrl } from '../../api/attachments'
import { cn } from '../../lib/cn'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

interface TaskAttachmentsProps {
  taskId: number
}

export function TaskAttachments({ taskId }: TaskAttachmentsProps) {
  const { data: attachments, isLoading } = useAttachments(taskId)
  const uploadAttachment = useUploadAttachment(taskId)
  const deleteAttachment = useDeleteAttachment(taskId)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setSizeError(false)
    if (file.size > MAX_FILE_SIZE) {
      setSizeError(true)
      return
    }
    uploadAttachment.mutate(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Pièces jointes</h3>

      {isLoading && (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {attachments && attachments.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <Paperclip className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">{att.filename}</p>
                <p className="text-xs text-gray-400">{formatBytes(att.file_size)}</p>
              </div>
              <a
                href={getDownloadUrl(att.id)}
                download={att.filename}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={() => setDeleteId(att.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {sizeError && (
        <div className="flex items-center gap-2 text-xs text-red-600 mb-3 p-2 bg-red-50 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Fichier trop volumineux. La taille maximale est de 10 Mo.
        </div>
      )}

      {uploadAttachment.isPending && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <LoadingSpinner size="sm" />
          Téléversement en cours...
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          dragOver
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50',
        )}
      >
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" aria-hidden="true" />
        <p className="text-sm text-gray-500">
          Glissez un fichier ici ou{' '}
          <span className="text-indigo-600 font-medium">cliquez pour parcourir</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Taille maximale : 10 Mo</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInput}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId !== null) deleteAttachment.mutate(deleteId)
        }}
        title="Supprimer la pièce jointe"
        message="Êtes-vous sûr de vouloir supprimer ce fichier ?"
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  )
}
