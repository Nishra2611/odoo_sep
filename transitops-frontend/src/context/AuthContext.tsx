import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User, Role } from '@/types'
import { initials } from '@/lib/utils'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string, role: Role) => Promise<boolean>
  loginWithGoogle: (accessToken: string, role: Role) => Promise<boolean>
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

  async function login(email: string, password: string, role: Role): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      if (data.user.role !== role) throw new Error(`Account role mismatch. Expected ${role}.`)

      const sessionUser: User = {
        ...data.user,
        avatarInitials: initials(data.user.name),
        token: data.token
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser))
      setUser(sessionUser)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function loginWithGoogle(accessToken: string, role: Role): Promise<boolean> {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Google login failed')

      const sessionUser: User = {
        ...data.user,
        avatarInitials: initials(data.user.name),
        token: data.token
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser))
      setUser(sessionUser)
      return true
    } catch (err: any) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
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
