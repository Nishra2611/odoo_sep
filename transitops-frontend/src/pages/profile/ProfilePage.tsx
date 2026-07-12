import { Mail, Phone, ShieldCheck, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/context/AuthContext'
import { ROLE_LABELS } from '@/lib/constants'

export function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Your profile</h1>
        <p className="text-sm text-slate-500">Account details and role assignment.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar initials={user?.avatarInitials ?? '—'} className="h-16 w-16 text-lg" />
            <div>
              <p className="font-display text-lg font-semibold text-ink">{user?.name}</p>
              <Badge className="mt-1 bg-route-soft text-route border-route/30">
                <ShieldCheck className="h-3 w-3" /> {user ? ROLE_LABELS[user.role] : ''}
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-400">Email</p>
                <p className="text-sm font-medium text-ink">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3">
              <Phone className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-400">Phone</p>
                <p className="text-sm font-medium text-ink">Not set</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-400">Member since</p>
                <p className="text-sm font-medium text-ink">July 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-[11px] text-slate-400">Access level</p>
                <p className="text-sm font-medium text-ink">{user ? ROLE_LABELS[user.role] : ''}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
