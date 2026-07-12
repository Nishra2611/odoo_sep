import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[38px] w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-ink placeholder:text-slate-400 focus:border-ink focus:ring-1 focus:ring-ink outline-none transition-colors"
      />
    </div>
  )
}
