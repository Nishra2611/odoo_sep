import type { FormEvent } from 'react'
import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router-dom'
import { Truck, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ROLE_LABELS, DEMO_ACCOUNTS } from '@/lib/constants'
import type { Role } from '@/types'

export function LoginPage() {
  const { user, login, loginWithGoogle, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('FLEET_MANAGER')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ok = await login(email, password, role)
    if (ok) navigate('/dashboard')
  }

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const ok = await loginWithGoogle(tokenResponse.access_token, role)
      if (ok) navigate('/dashboard')
    },
    onError: () => console.error('Google Login Failed'),
  })

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between p-10 text-white lg:flex overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=2000&auto=format&fit=crop" alt="Fleet of trucks" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-ink/70 mix-blend-multiply" />
        </div>
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal">
            <Truck className="h-4 w-4 text-ink" />
          </div>
          <span className="font-display text-lg font-semibold">TransitOps</span>
        </div>
        <div className="relative z-10">
          <p className="font-display text-3xl font-semibold leading-tight">
            Every dispatch decision, <br /> enforced automatically.
          </p>
          <p className="mt-4 max-w-md text-sm text-white/90">
            Vehicle and driver eligibility, license expiry, and cargo limits are checked before a trip is
            ever dispatched — not after something goes wrong.
          </p>
        </div>
        <p className="relative z-10 font-mono text-[11px] text-white/60">TransitOps Control Console · v1.0</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
              <Truck className="h-4 w-4 text-signal" />
            </div>
            <span className="font-display text-lg font-semibold text-ink">TransitOps</span>
          </div>

          <h1 className="font-display text-xl font-semibold text-ink">Sign in to your console</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to access your fleet workspace.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-[30px] text-slate-400 hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-xs font-medium text-route hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && <p className="rounded-lg bg-alert-soft px-3 py-2 text-xs text-alert">{error}</p>}

            <Button type="submit" loading={loading} className="mt-1">
              <Mail className="h-3.5 w-3.5" /> Sign in
            </Button>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <div className="h-px flex-1 bg-slate-200" /> OR <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Button type="button" variant="outline" onClick={() => handleGoogle()} loading={loading}>
              Continue with Google
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Demo accounts</p>
            <ul className="mt-1.5 space-y-1">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.email} className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{ROLE_LABELS[a.role]}</span>
                  <span className="font-mono">{a.email} / {a.password}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
