import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-slate-300" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-ink transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
