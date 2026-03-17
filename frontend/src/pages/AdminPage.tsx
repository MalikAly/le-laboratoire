import { useState } from 'react'
import { Shield, Plus } from 'lucide-react'
import { useUsers, useDeleteUser } from '../hooks/useUsers'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { UserTable } from '../components/admin/UserTable'
import { UserForm } from '../components/admin/UserForm'

export function AdminPage() {
  const { user: currentUser } = useAuth()
  const { data: users, isLoading, isError } = useUsers()
  const deleteUser = useDeleteUser()
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50">
            <Shield className="w-5 h-5 text-indigo-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Administration</h2>
            <p className="text-sm text-gray-500 mt-0.5">Gestion des utilisateurs</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4" aria-hidden="true" />
          Créer un utilisateur
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="flex justify-center py-12">
          <p className="text-sm text-red-600">
            Impossible de charger les utilisateurs. Veuillez réessayer.
          </p>
        </div>
      )}

      {!isLoading && !isError && users && currentUser && (
        <UserTable
          users={users}
          currentUserId={currentUser.id}
          onDelete={(id) => deleteUser.mutate(id)}
        />
      )}

      <UserForm isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} />
    </div>
  )
}
