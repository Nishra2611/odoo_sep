import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Route, Wrench, Users, Gauge, PlusCircle, ClipboardList, AlertTriangle } from 'lucide-react'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { DonutChartCard, BarChartCard } from '@/components/ui/ChartCards'
import { VEHICLES, DRIVERS, TRIPS, MAINTENANCE_LOGS, vehicleById, driverById } from '@/lib/mockData'
import { formatDateTime } from '@/lib/utils'
import type { Trip } from '@/types'
import { useAuth } from '@/context/AuthContext'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const kpis = useMemo(() => {
    const available = VEHICLES.filter((v) => v.status === 'AVAILABLE').length
    const active = VEHICLES.filter((v) => v.status === 'ON_TRIP').length
    const inShop = VEHICLES.filter((v) => v.status === 'IN_SHOP').length
    const activeTrips = TRIPS.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'DISPATCHED').length
    const pendingTrips = TRIPS.filter((t) => t.status === 'DRAFT').length
    const driversOnDuty = DRIVERS.filter((d) => d.status === 'ON_TRIP' || d.status === 'AVAILABLE').length
    const utilization = Math.round(((active + inShop) / VEHICLES.length) * 100)
    return { available, active, inShop, activeTrips, pendingTrips, driversOnDuty, utilization }
  }, [])

  const recentTrips = useMemo(() => [...TRIPS].slice(0, 8), [])

  const fleetSplit = [
    { name: 'Available', value: VEHICLES.filter((v) => v.status === 'AVAILABLE').length },
    { name: 'On Trip', value: VEHICLES.filter((v) => v.status === 'ON_TRIP').length },
    { name: 'In Shop', value: VEHICLES.filter((v) => v.status === 'IN_SHOP').length },
    { name: 'Retired', value: VEHICLES.filter((v) => v.status === 'RETIRED').length },
  ]

  const maintenanceByMonth = useMemo(() => {
    const buckets: Record<string, number> = {}
    MAINTENANCE_LOGS.forEach((m) => {
      const d = new Date(m.serviceDate)
      const key = d.toLocaleDateString('en-IN', { month: 'short' })
      buckets[key] = (buckets[key] ?? 0) + m.cost
    })
    return Object.entries(buckets).map(([month, cost]) => ({ month, cost }))
  }, [])

  const columns: Column<Trip>[] = [
    { key: 'tripCode', header: 'Trip', render: (t) => <span className="font-mono text-xs font-medium">{t.tripCode}</span> },
    { key: 'route', header: 'Route', render: (t) => t.route },
    { key: 'vehicle', header: 'Vehicle', render: (t) => vehicleById(t.vehicleId)?.regNumber ?? '—' },
    { key: 'driver', header: 'Driver', render: (t) => driverById(t.driverId)?.name ?? '—' },
    { key: 'departure', header: 'Departure', render: (t) => formatDateTime(t.departureTime) },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} kind="trip" /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Operations overview</h1>
          <p className="text-sm text-slate-500">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}. Here's how the fleet looks right now.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/maintenance')}>
            <Wrench className="h-3.5 w-3.5" /> Schedule maintenance
          </Button>
          <Button onClick={() => navigate('/trips')}>
            <PlusCircle className="h-3.5 w-3.5" /> New trip
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Available vehicles" value={kpis.available} icon={Truck} accent="go" />
        <KpiCard label="Active trips" value={kpis.activeTrips} icon={Route} accent="route" />
        <KpiCard label="In maintenance" value={kpis.inShop} icon={Wrench} accent="signal" />
        <KpiCard label="Drivers on duty" value={kpis.driversOnDuty} icon={Users} accent="ink" />
        <KpiCard label="Pending trips" value={kpis.pendingTrips} icon={ClipboardList} accent="ink" />
        <KpiCard label="Fleet utilization" value={`${kpis.utilization}%`} icon={Gauge} accent="route" delta={4} trend="up" />
        <KpiCard
          label="Compliance alerts"
          value={VEHICLES.filter((v) => v.riskScore > 70).length}
          icon={AlertTriangle}
          accent="alert"
        />
        <KpiCard label="Total fleet size" value={VEHICLES.length} icon={Truck} accent="ink" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarChartCard title="Maintenance spend by month" data={maintenanceByMonth} dataKey="cost" xKey="month" />
        </div>
        <DonutChartCard title="Fleet status split" data={fleetSplit} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent trips</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate('/trips')}>
            View all
          </Button>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <DataTable columns={columns} data={recentTrips} rowKey={(t) => t.id} onRowClick={() => navigate('/trips')} />
        </CardContent>
      </Card>
    </div>
  )
}
