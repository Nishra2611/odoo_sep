import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Search, CornerDownLeft } from 'lucide-react'
import * as Icons from 'lucide-react'
import { NAV_ITEMS } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuth()

  const items = useMemo(() => {
    const nav = NAV_ITEMS.filter((n) => !user || n.roles.includes(user.role)).map((n) => ({
      id: n.key,
      label: `Go to ${n.label}`,
      onSelect: () => navigate(n.path),
      icon: n.icon,
    }))
    if (!query) return nav
    return nav.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()))
  }, [query, user, navigate])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, items.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && items[activeIdx]) {
        items[activeIdx].onSelect()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, items, activeIdx, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4">
      <div className="fixed inset-0 bg-ink/50 animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-panel animate-fade-in overflow-hidden">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIdx(0)
            }}
            placeholder="Jump to a module…"
            className="flex-1 text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">Esc</kbd>
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5 scrollbar-thin">
          {items.length === 0 && <p className="px-3 py-6 text-center text-xs text-slate-400">No matches</p>}
          {items.map((item, i) => {
            const Icon = (Icons as any)[item.icon] ?? Icons.Circle
            return (
              <button
                key={item.id}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => {
                  item.onSelect()
                  onClose()
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                  activeIdx === i ? 'bg-slate-100 text-ink' : 'text-slate-600'
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-slate-400" />
                <span className="flex-1">{item.label}</span>
                {activeIdx === i && <CornerDownLeft className="h-3 w-3 text-slate-400" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}
