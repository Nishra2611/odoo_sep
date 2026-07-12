import { cn } from '@/lib/utils'

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white',
        className,
      )}
    >
      {initials}
    </div>
  )
}
