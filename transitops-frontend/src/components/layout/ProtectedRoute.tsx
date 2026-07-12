import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { NAV_ITEMS } from '@/lib/constants'
import type { ReactNode } from 'react'
import { ShieldOff } from 'lucide-react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const matchingNav = NAV_ITEMS.find((n) => location.pathname.startsWith(n.path))
  if (matchingNav && !matchingNav.roles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-alert-soft">
          <ShieldOff className="h-5 w-5 text-alert" />
        </div>
        <div>
          <p className="font-display font-semibold text-ink">You don't have access to this module</p>
          <p className="mt-1 text-sm text-slate-500">Your role doesn't include permission for this page. Contact your fleet manager if you need access.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
