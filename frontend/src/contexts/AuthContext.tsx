import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, getCurrentUser } from '../api/auth'
import { setAccessToken, clearAccessToken } from '../api/client'
import type { User } from '../types/auth'

const TOKEN_STORAGE_KEY = 'labo_access_token'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!storedToken) {
      setIsLoading(false)
      return
    }
    setAccessToken(storedToken)
    getCurrentUser()
      .then((fetchedUser) => {
        setUser(fetchedUser)
      })
      .catch(() => {
        clearAccessToken()
        localStorage.removeItem(TOKEN_STORAGE_KEY)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiLogin({ username, password })
    setAccessToken(response.access_token)
    localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token)
    const fetchedUser = await getCurrentUser()
    setUser(fetchedUser)
  }, [])

  const logout = useCallback(() => {
    clearAccessToken()
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
