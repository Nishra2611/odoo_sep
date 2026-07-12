import { useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon, Command, LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { ROLE_LABELS } from '@/lib/constants'
import { COMPLIANCE_DOCUMENTS } from '@/lib/mockData'
import { daysUntil } from '@/lib/utils'

export function Topbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const alerts = COMPLIANCE_DOCUMENTS.filter((d) => d.status !== 'VALID').slice(0, 6)

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-5 backdrop-blur">
      <button
        onClick={onOpenPalette}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 hover:border-slate-300"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search vehicles, drivers, trips…</span>
        <span className="flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px]">
          <Command className="h-2.5 w-2.5" />K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={toggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <Dropdown
          trigger={
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {alerts.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-alert" />
              )}
            </button>
          }
        >
          <div className="max-h-80 w-72 overflow-y-auto scrollbar-thin">
            <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Compliance alerts</p>
            {alerts.length === 0 && <p className="px-2.5 py-3 text-xs text-slate-400">No pending alerts</p>}
            {alerts.map((a) => (
              <div key={a.id} className="flex flex-col gap-0.5 rounded-md px-2.5 py-2 hover:bg-slate-50">
                <p className="text-xs font-medium text-ink">{a.entityLabel}</p>
                <p className="text-[11px] text-slate-500">
                  {a.type.replace(/_/g, ' ')} — {a.status === 'EXPIRED' ? `expired ${Math.abs(daysUntil(a.expiryDate))}d ago` : `expires in ${daysUntil(a.expiryDate)}d`}
                </p>
              </div>
            ))}
          </div>
        </Dropdown>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-100">
              <Avatar initials={user?.avatarInitials ?? '—'} />
              <div className="hidden text-left sm:block">
                <p className="text-xs font-medium leading-tight text-ink">{user?.name}</p>
                <p className="text-[11px] leading-tight text-slate-400">{user ? ROLE_LABELS[user.role] : ''}</p>
              </div>
            </button>
          }
        >
          <DropdownItem onClick={() => navigate('/profile')}>
            <UserIcon className="h-3.5 w-3.5" /> Profile
          </DropdownItem>
          <DropdownItem onClick={() => navigate('/settings')}>
            <SettingsIcon className="h-3.5 w-3.5" /> Settings
          </DropdownItem>
          <DropdownItem onClick={logout} danger>
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  )
}
