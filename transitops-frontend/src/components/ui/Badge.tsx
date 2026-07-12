import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap', className)}>
      {children}
    </span>
  )
}

export function StatusDot({ className }: { className?: string }) {
  return <span className={cn('h-1.5 w-1.5 rounded-full', className)} />
}
