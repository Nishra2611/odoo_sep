import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { KpiCard } from '@/components/ui/KpiCard'
import { LineChartCard, BarChartCard, DonutChartCard } from '@/components/ui/ChartCards'
import { Fuel, Wrench, ShieldAlert, Gauge } from 'lucide-react'
import { VEHICLES, TRIPS, MAINTENANCE_LOGS, FUEL_LOGS, SAFETY_INCIDENTS, DRIVERS, EXPENSES } from '@/lib/mockData'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'

export function AnalyticsPage() {
  const { push } = useToast()
  const [range, setRange] = useState('90')

  const utilizationTrend = useMemo(() => {
    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
    return months.map((m, i) => ({ month: m, utilization: 58 + i * 4 + (i % 2 === 0 ? 3 : -2) }))
  }, [])

  const tripPerformance = useMemo(() => {
    const buckets: Record<string, number> = {}
    TRIPS.forEach((t) => {
      buckets[t.status] = (buckets[t.status] ?? 0) + 1
    })
    return Object.entries(buckets).map(([name, value]) => ({ name: name.replace('_', ' '), value }))
  }, [])

  const fuelTrend = useMemo(() => {
    const buckets: Record<string, number> = {}
    FUEL_LOGS.forEach((f) => {
      const key = new Date(f.date).toLocaleDateString('en-IN', { month: 'short' })
      buckets[key] = (buckets[key] ?? 0) + f.totalCost
    })
    return Object.entries(buckets).map(([month, cost]) => ({ month, cost }))
  }, [])

  const maintenanceCostTrend = useMemo(() => {
    const buckets: Record<string, number> = {}
    MAINTENANCE_LOGS.forEach((m) => {
      const key = new Date(m.serviceDate).toLocaleDateString('en-IN', { month: 'short' })
      buckets[key] = (buckets[key] ?? 0) + m.cost
    })
    return Object.entries(buckets).map(([month, cost]) => ({ month, cost }))
  }, [])

  const driverPerformance = useMemo(
    () =>
      [...DRIVERS]
        .sort((a, b) => b.tripCompletionPct - a.tripCompletionPct)
        .slice(0, 8)
        .map((d) => ({ name: d.name.split(' ')[0], completion: d.tripCompletionPct })),
    [],
  )

  const safetyTrend = useMemo(() => {
    const buckets: Record<string, number> = {}
    SAFETY_INCIDENTS.forEach((i) => {
      const key = new Date(i.date).toLocaleDateString('en-IN', { month: 'short' })
      buckets[key] = (buckets[key] ?? 0) + 1
    })
    return Object.entries(buckets).map(([month, count]) => ({ month, count }))
  }, [])

  const kpis = useMemo(() => {
    const totalCost = MAINTENANCE_LOGS.reduce((s, m) => s + m.cost, 0) + FUEL_LOGS.reduce((s, f) => s + f.totalCost, 0) + EXPENSES.reduce((s, e) => s + e.amount, 0)
    const completedTrips = TRIPS.filter((t) => t.status === 'COMPLETED').length
    const onTimePct = Math.round((completedTrips / Math.max(1, TRIPS.filter((t) => t.status !== 'DRAFT' && t.status !== 'CANCELLED').length)) * 100)
    const utilization = Math.round((VEHICLES.filter((v) => v.status === 'ON_TRIP' || v.status === 'IN_SHOP').length / VEHICLES.length) * 100)
    return { totalCost, onTimePct, utilization, incidents: SAFETY_INCIDENTS.length }
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Analytics</h1>
          <p className="text-sm text-slate-500">Fleet-wide performance, cost, and safety trends.</p>
        </div>
        <div className="flex gap-2">
          <Select value={range} onChange={(e) => setRange(e.target.value)} className="w-40">
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 12 months</option>
          </Select>
          <Button variant="outline" onClick={() => push('Exporting analytics report as PDF…', 'info')}>
            <Download className="h-3.5 w-3.5" /> Export report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Total operating cost" value={formatCurrency(kpis.totalCost)} icon={Wrench} accent="ink" />
        <KpiCard label="On-time completion" value={`${kpis.onTimePct}%`} icon={Gauge} accent="go" delta={2} trend="up" />
        <KpiCard label="Fleet utilization" value={`${kpis.utilization}%`} icon={Fuel} accent="route" />
        <KpiCard label="Safety incidents logged" value={kpis.incidents} icon={ShieldAlert} accent="alert" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LineChartCard title="Fleet utilization trend" data={utilizationTrend} dataKey="utilization" xKey="month" color="#2F6FED" />
        <DonutChartCard title="Trip status distribution" data={tripPerformance} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard title="Fuel spend by month" data={fuelTrend} dataKey="cost" xKey="month" color="#F5A623" />
        <BarChartCard title="Maintenance cost by month" data={maintenanceCostTrend} dataKey="cost" xKey="month" color="#2FB67C" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard title="Top drivers by trip completion" data={driverPerformance} dataKey="completion" xKey="name" color="#2F6FED" />
        <LineChartCard title="Safety incident trend" data={safetyTrend} dataKey="count" xKey="month" color="#E5484D" />
      </div>
    </div>
  )
}
