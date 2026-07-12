import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User, Role } from '@/types'
import { DEMO_ACCOUNTS } from '@/lib/constants'
import { initials } from '@/lib/utils'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string, role: Role) => Promise<boolean>
  loginWithGoogle: (role: Role) => Promise<boolean>
  logout: () => void
  updateProfile: (name: string, email: string) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const STORAGE_KEY = 'transitops.session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setUser(JSON.parse(raw))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  async function login(email: string, password: string, role: Role): Promise<boolean> {
    setLoading(true)
    setError(null)
    // Simulated network latency + backend validation against /api/auth/login
    await new Promise((r) => setTimeout(r, 500))
    const account = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase())
    if (!account || account.password !== password) {
      setError('Invalid email or password. Try one of the demo accounts below.')
      setLoading(false)
      return false
    }
    if (account.role !== role) {
      setError(`This account is registered as ${account.role.replace('_', ' ')}, not the role selected.`)
      setLoading(false)
      return false
    }
    const sessionUser: User = {
      id: `user-${account.email}`,
      name: account.name,
      email: account.email,
      role: account.role,
      avatarInitials: initials(account.name),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser))
    setUser(sessionUser)
    setLoading(false)
    return true
  }

  async function loginWithGoogle(role: Role): Promise<boolean> {
    setLoading(true)
    setError(null)
    await new Promise((r) => setTimeout(r, 600))
    const sessionUser: User = {
      id: 'user-google-demo',
      name: 'Google Demo User',
      email: 'demo.google.user@gmail.com',
      role,
      avatarInitials: 'GU',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser))
    setUser(sessionUser)
    setLoading(false)
    return true
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  function updateProfile(name: string, email: string) {
    if (!user) return
    const updated: User = {
      ...user,
      name,
      email,
      avatarInitials: initials(name),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setUser(updated)
  }

  const value = useMemo(() => ({ user, loading, error, login, loginWithGoogle, logout, updateProfile }), [user, loading, error])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
