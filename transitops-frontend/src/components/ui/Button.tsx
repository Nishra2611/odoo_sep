import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
          variant === 'primary' && 'bg-ink text-white hover:bg-ink/85 active:bg-ink',
          variant === 'secondary' && 'bg-signal text-ink hover:bg-signal/90',
          variant === 'outline' && 'border border-slate-300 text-ink bg-white hover:bg-slate-50',
          variant === 'ghost' && 'text-ink hover:bg-slate-100',
          variant === 'danger' && 'bg-alert text-white hover:bg-alert/90',
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'md' && 'h-[38px] px-4 text-sm',
          size === 'lg' && 'h-11 px-5 text-sm',
          size === 'icon' && 'h-9 w-9',
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
