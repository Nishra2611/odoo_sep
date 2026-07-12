import type { FormEvent } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Truck, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink">
            <Truck className="h-4 w-4 text-signal" />
          </div>
          <span className="font-display text-lg font-semibold text-ink">TransitOps</span>
        </div>

        {!sent ? (
          <>
            <h1 className="font-display text-xl font-semibold text-ink">Reset your password</h1>
            <p className="mt-1 text-sm text-slate-500">Enter your account email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <Input label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" loading={loading}>
                Send reset link
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-go-soft">
              <CheckCircle2 className="h-5 w-5 text-go" />
            </div>
            <div>
              <p className="font-display font-semibold text-ink">Check your inbox</p>
              <p className="mt-1 text-sm text-slate-500">We sent a reset link to {email || 'your email'}.</p>
            </div>
          </div>
        )}

        <Link to="/login" className="mt-6 flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-ink">
          <ArrowLeft className="h-3 w-3" /> Back to sign in
        </Link>
      </div>
    </div>
  )
}
