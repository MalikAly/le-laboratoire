import { NavLink } from 'react-router-dom'
import { FolderKanban, Shield, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../lib/cn'

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex flex-col w-64 shrink-0 bg-slate-900 h-screen sticky top-0">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
          <FolderKanban className="w-4 h-4 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Le Laboratoire</p>
          <p className="text-xs text-slate-400 leading-tight">Gestion de projets</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigation principale">
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white',
            )
          }
        >
          <FolderKanban className="w-4 h-4 shrink-0" aria-hidden="true" />
          Projets
        </NavLink>

        {user?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )
            }
          >
            <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
            Administration
          </NavLink>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar name={user.username} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.username}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Se deconnecter"
              title="Se deconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
