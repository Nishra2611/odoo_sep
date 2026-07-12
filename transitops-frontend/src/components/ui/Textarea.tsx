import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={areaId} className="text-xs font-medium text-slate-600">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={cn(
            'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 min-h-[80px]',
            'focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-colors',
            error && 'border-alert',
            className,
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-alert">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
