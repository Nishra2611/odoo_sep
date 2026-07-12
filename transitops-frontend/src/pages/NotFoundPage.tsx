import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <Compass className="h-6 w-6 text-slate-400" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold text-ink">This route doesn't exist</p>
        <p className="mt-1 text-sm text-slate-500">Check the URL, or head back to your dashboard.</p>
      </div>
      <Link to="/dashboard">
        <Button size="sm">Back to dashboard</Button>
      </Link>
    </div>
  )
}
