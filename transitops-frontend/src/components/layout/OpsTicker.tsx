import { useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useData } from '@/context/DataContext'

export function OpsTicker() {
  const { vehicles, drivers, trips, complianceDocuments } = useData()
  const items = useMemo(() => {
    const list: string[] = []
    const expiringDocs = complianceDocuments.filter((d) => d.status === 'EXPIRING_SOON' || d.status === 'EXPIRED')
    if (expiringDocs.length) list.push(`${expiringDocs.length} compliance document${expiringDocs.length > 1 ? 's' : ''} need attention this month`)
    const inShop = vehicles.filter((v) => v.status === 'IN_SHOP').length
    if (inShop) list.push(`${inShop} vehicle${inShop > 1 ? 's' : ''} currently in the shop`)
    const suspended = drivers.filter((d) => d.status === 'SUSPENDED' || d.status === 'EXPIRED_LICENSE').length
    if (suspended) list.push(`${suspended} driver${suspended > 1 ? 's' : ''} restricted from dispatch`)
    const delayed = trips.filter((t) => t.status === 'DELAYED').length
    if (delayed) list.push(`${delayed} trip${delayed > 1 ? 's' : ''} running delayed`)
    const active = trips.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'DISPATCHED').length
    list.push(`${active} trips currently active across the fleet`)
    const riskiest = [...vehicles].sort((a, b) => b.riskScore - a.riskScore)[0]
    if (riskiest) list.push(`Highest breakdown risk: ${riskiest.regNumber} at ${riskiest.riskScore}/100`)
    return list
  }, [vehicles, drivers, trips, complianceDocuments])

  const doubled = [...items, ...items]

  return (
    <div className="flex h-8 items-center gap-2 overflow-hidden border-b border-slate-line/60 bg-ink px-4 text-white">
      <AlertTriangle className="h-3 w-3 shrink-0 text-signal" />
      <div className="flex whitespace-nowrap animate-ticker font-mono text-[11px] tracking-tight text-white/80">
        {doubled.map((item, i) => (
          <span key={i} className="mx-6 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-signal" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
