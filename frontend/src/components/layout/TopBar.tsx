import { useLocation } from 'react-router-dom'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Avatar } from '../ui/Avatar'
import { DropdownMenu } from '../ui/DropdownMenu'

function getPageTitle(pathname: string): string {
  if (pathname === '/projects') return 'Projets'
  if (pathname.startsWith('/projects/')) return 'Projet'
  if (pathname === '/admin') return 'Administration'
  return 'Le Laboratoire'
}

export function TopBar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = getPageTitle(location.pathname)

  const menuItems = [
    ...(user?.is_admin
      ? [{ label: 'Administration', icon: Settings, onClick: () => {}, variant: 'default' as const }]
      : []),
    {
      label: 'Se deconnecter',
      icon: LogOut,
      onClick: logout,
      variant: 'danger' as const,
    },
  ]

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-200 shrink-0">
      <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      {user && (
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors">
              <Avatar name={user.username} size="sm" />
              <span className="text-sm font-medium text-gray-700">{user.username}</span>
            </button>
          }
          items={menuItems}
        />
      )}
    </header>
  )
}
