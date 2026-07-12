import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { NAV_ITEMS } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user } = useAuth()
  const items = NAV_ITEMS.filter((n) => !user || n.roles.includes(user.role))

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col bg-ink text-white transition-all duration-200',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-signal">
          <Icons.Truck className="h-4 w-4 text-ink" />
        </div>
        {!collapsed && <span className="font-display text-[15px] font-semibold tracking-tight">TransitOps</span>}
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 px-2.5">
        {items.map((item) => {
          const Icon = (Icons as any)[item.icon] ?? Icons.Circle
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/90',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-2.5">
        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white/90"
        >
          <Icons.PanelLeftClose className={cn('h-4 w-4 shrink-0 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
