import { cn } from '@/lib/utils'

interface TabsProps {
  tabs: { key: string; label: string }[]
  active: string
  onChange: (key: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'relative px-3.5 py-2.5 text-sm font-medium transition-colors',
            active === tab.key ? 'text-ink' : 'text-slate-500 hover:text-ink',
          )}
        >
          {tab.label}
          {active === tab.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-signal" />}
        </button>
      ))}
    </div>
  )
}
