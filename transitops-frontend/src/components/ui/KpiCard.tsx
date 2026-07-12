import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  delta?: number
  trend?: 'up' | 'down' | 'flat'
  accent?: 'signal' | 'route' | 'go' | 'alert' | 'ink'
}

const ACCENTS = {
  signal: 'bg-signal-soft text-signal-dim',
  route: 'bg-route-soft text-route',
  go: 'bg-go-soft text-go',
  alert: 'bg-alert-soft text-alert',
  ink: 'bg-slate-100 text-ink',
}

export function KpiCard({ label, value, icon: Icon, delta, trend, accent = 'ink' }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', ACCENTS[accent])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-display text-2xl font-semibold text-ink">{value}</p>
        {delta !== undefined && trend && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-[11px] font-medium',
              trend === 'up' && 'text-go',
              trend === 'down' && 'text-alert',
              trend === 'flat' && 'text-slate-400',
            )}
          >
            {trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {trend === 'flat' && <Minus className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  )
}
