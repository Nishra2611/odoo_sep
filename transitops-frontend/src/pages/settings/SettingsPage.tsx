import { useState, useEffect } from 'react'
import { Sun, Moon, ShieldCheck, Bell, Building2, Users, ScrollText, Plug, KeyRound } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/context/ToastContext'
import { ROLE_LABELS, NAV_ITEMS } from '@/lib/constants'
import { AUDIT_LOGS } from '@/lib/mockData'
import { formatDateTime } from '@/lib/utils'
import type { AuditLogEntry } from '@/types'

const SECTIONS = [
  { key: 'profile', label: 'Profile' },
  { key: 'security', label: 'Security' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'company', label: 'Company' },
  { key: 'rbac', label: 'Roles & permissions' },
  { key: 'audit', label: 'Audit log' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'appearance', label: 'Appearance' },
]

export function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const { theme, toggle } = useTheme()
  const { push } = useToast()
  const [section, setSection] = useState('profile')
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: false, expiryAlerts: true, dispatchAlerts: true })

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  function handleSaveProfile() {
    if (!name.trim() || !email.trim()) {
      push('Name and email are required', 'error')
      return
    }
    updateProfile(name, email)
    push('Profile changes saved')
  }

  function handleUpdatePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      push('All fields are required', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      push('New passwords do not match', 'error')
      return
    }
    push('Password updated successfully')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const auditColumns: Column<AuditLogEntry>[] = [
    { key: 'time', header: 'Timestamp', sortValue: (a) => a.createdAt, render: (a) => formatDateTime(a.createdAt) },
    { key: 'entity', header: 'Entity', render: (a) => `${a.entityType} · ${a.entityId}` },
    { key: 'action', header: 'Action', render: (a) => a.action.replace(/_/g, ' ') },
    { key: 'reason', header: 'Reason', render: (a) => a.reason ?? '—' },
    { key: 'by', header: 'Performed by', render: (a) => a.performedBy },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account, company profile, permissions and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
        <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                section === s.key ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div>
          {section === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile settings</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={user?.avatarInitials ?? '—'} className="h-14 w-14 text-base" />
                  <div>
                    <p className="font-medium text-ink">{user?.name}</p>
                    <p className="text-xs text-slate-500">{user ? ROLE_LABELS[user.role] : ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Button onClick={handleSaveProfile}>Save changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Current password" type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  <div />
                  <Input label="New password" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <Input label="Confirm new password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">Two-factor authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => push('Two-factor setup started', 'info')}>
                    Enable
                  </Button>
                </div>
                <div>
                  <Button onClick={handleUpdatePassword}>Update password</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification preferences</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {(
                  [
                    ['email', 'Email notifications', 'Receive updates and alerts by email'],
                    ['sms', 'SMS notifications', 'Receive critical alerts via SMS'],
                    ['expiryAlerts', 'Compliance expiry alerts', 'Notify before licenses, insurance or permits expire'],
                    ['dispatchAlerts', 'Dispatch rejection alerts', 'Notify when a dispatch attempt is rejected'],
                  ] as const
                ).map(([key, label, desc]) => (
                  <label key={key} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                    <input
                      type="checkbox"
                      checked={notifPrefs[key]}
                      onChange={(e) => setNotifPrefs({ ...notifPrefs, [key]: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </label>
                ))}
                <div>
                  <Button onClick={() => push('Notification preferences saved')}>
                    <Bell className="h-3.5 w-3.5" /> Save preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'company' && (
            <Card>
              <CardHeader>
                <CardTitle>Company profile</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Company name" defaultValue="Demo Logistics Pvt Ltd" />
                  <Input label="GSTIN" defaultValue="24AAAAA0000A1Z5" />
                  <Input label="Registered address" defaultValue="Ahmedabad, Gujarat" className="col-span-2" />
                  <Input label="Fleet size" defaultValue="22 vehicles" />
                  <Input label="Subscription plan" defaultValue="Growth — ₹499/vehicle/month" disabled />
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <p className="flex-1 text-sm text-slate-600">Fleet categories: Truck, Van, Trailer, Pickup</p>
                </div>
                <div>
                  <Button onClick={() => push('Company profile updated')}>Save changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'rbac' && (
            <Card>
              <CardHeader>
                <CardTitle>Roles & permissions</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70">
                        <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">Module</th>
                        {Object.values(ROLE_LABELS).map((label) => (
                          <th key={label} className="px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {NAV_ITEMS.map((item) => (
                        <tr key={item.key} className="border-b border-slate-100 last:border-0">
                          <td className="px-5 py-3 font-medium text-ink">{item.label}</td>
                          {(Object.keys(ROLE_LABELS) as (keyof typeof ROLE_LABELS)[]).map((role) => (
                            <td key={role} className="px-3 py-3 text-center">
                              {item.roles.includes(role) ? (
                                <ShieldCheck className="mx-auto h-3.5 w-3.5 text-go" />
                              ) : (
                                <span className="mx-auto block h-1 w-1 rounded-full bg-slate-200" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-xs text-slate-500">Permissions are enforced server-side on every protected API — this view is read-only.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {section === 'audit' && (
            <Card>
              <CardHeader>
                <CardTitle>Audit log</CardTitle>
                <ScrollText className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <DataTable columns={auditColumns} data={AUDIT_LOGS} rowKey={(a) => a.id} emptyTitle="No audit records yet" />
              </CardContent>
            </Card>
          )}

          {section === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  { name: 'Google OAuth', desc: 'Sign in with Google for faster onboarding', connected: true },
                  { name: 'Resend (Email)', desc: 'Transactional emails: welcome, late-ticket alerts', connected: true },
                  { name: 'WhatsApp Business API', desc: 'Send compliance and dispatch alerts via WhatsApp', connected: false },
                  { name: 'GPS / Telematics provider', desc: 'Live vehicle location feed', connected: false },
                ].map((i) => (
                  <div key={i.name} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                    <Plug className="h-4 w-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{i.name}</p>
                      <p className="text-xs text-slate-500">{i.desc}</p>
                    </div>
                    <Button
                      variant={i.connected ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => push(i.connected ? `${i.name} disconnected` : `${i.name} connected`, i.connected ? 'info' : 'success')}
                    >
                      {i.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {section === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                  {theme === 'dark' ? <Moon className="h-4 w-4 text-slate-500" /> : <Sun className="h-4 w-4 text-slate-500" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">Theme</p>
                    <p className="text-xs text-slate-500">Currently using {theme} mode</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggle}>
                    Switch to {theme === 'dark' ? 'light' : 'dark'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
