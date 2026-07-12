import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-slate-600">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-[38px] rounded-lg border border-slate-300 bg-white px-3 text-sm text-ink placeholder:text-slate-400',
            'focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-colors',
            error && 'border-alert focus:border-alert focus:ring-alert',
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
        {error && <p className="text-[11px] text-alert">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
