import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { PlusCircle, Wrench, MoreVertical, CheckCircle2, Ban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { BarChartCard } from '@/components/ui/ChartCards'
import { useData } from '@/context/DataContext'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import type { MaintenanceLog, MaintenanceStatus, Vehicle } from '@/types'

const PAGE_SIZE = 8

export function MaintenancePage() {
  const { push } = useToast()
  const {
    vehicles,
    maintenanceLogs: logs,
    scheduleMaintenance,
    completeMaintenance,
    cancelMaintenance,
    vehicleById,
  } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | MaintenanceStatus>('ALL')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({ vehicleId: '', serviceType: 'Preventive' as MaintenanceLog['serviceType'], workshop: '', cost: 5000, notes: '' })

  const filtered = useMemo(
    () =>
      logs.filter((l) => {
        const vehicle = vehicleById(l.vehicleId)
        const matchesSearch = vehicle?.regNumber.toLowerCase().includes(search.toLowerCase()) || l.workshop.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [logs, search, statusFilter],
  )

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const kpis = useMemo(() => {
    const inShop = vehicles.filter((v) => v.status === 'IN_SHOP').length
    const scheduled = logs.filter((l) => l.status === 'SCHEDULED').length
    const awaitingApproval = logs.filter((l) => l.status === 'AWAITING_APPROVAL').length
    const totalSpend = logs.reduce((sum, l) => sum + l.cost, 0)
    return { inShop, scheduled, awaitingApproval, totalSpend }
  }, [logs, vehicles])

  const costByType = useMemo(() => {
    const buckets: Record<string, number> = {}
    logs.forEach((l) => {
      buckets[l.serviceType] = (buckets[l.serviceType] ?? 0) + l.cost
    })
    return Object.entries(buckets).map(([serviceType, cost]) => ({ serviceType, cost }))
  }, [logs])

  function handleSchedule(e: FormEvent) {
    e.preventDefault()
    if (!form.vehicleId) {
      push('Select a vehicle to schedule maintenance for', 'error')
      return
    }
    const vehicle = vehicleById(form.vehicleId)
    scheduleMaintenance({
      vehicleId: form.vehicleId,
      serviceType: form.serviceType,
      workshop: form.workshop || 'To be confirmed',
      cost: form.cost,
      notes: form.notes,
    })
    push(`Maintenance scheduled for ${vehicle?.regNumber} — vehicle marked unavailable for dispatch`)
    setFormOpen(false)
    setForm({ vehicleId: '', serviceType: 'Preventive', workshop: '', cost: 5000, notes: '' })
  }

  function handleComplete(log: MaintenanceLog) {
    completeMaintenance(log.id)
    push(`Maintenance completed — ${vehicleById(log.vehicleId)?.regNumber} is available for dispatch again`)
  }

  function handleCancel(log: MaintenanceLog) {
    cancelMaintenance(log.id)
    push('Maintenance work order cancelled', 'info')
  }

  const columns: Column<MaintenanceLog>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (l) => {
        const v = vehicleById(l.vehicleId)
        return (
          <div>
            <p className="font-mono text-xs font-semibold">{v?.regNumber}</p>
            <p className="text-[11px] text-slate-400">{v?.name}</p>
          </div>
        )
      },
    },
    { key: 'type', header: 'Service type', render: (l) => l.serviceType },
    { key: 'workshop', header: 'Workshop', render: (l) => l.workshop },
    { key: 'mechanic', header: 'Mechanic', render: (l) => l.mechanic },
    { key: 'cost', header: 'Cost', sortValue: (l) => l.cost, render: (l) => formatCurrency(l.cost) },
    { key: 'serviceDate', header: 'Service date', sortValue: (l) => l.serviceDate, render: (l) => formatDate(l.serviceDate) },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} kind="maintenance" /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (l) => (
        <Dropdown
          trigger={
            <button className="rounded-md p-1.5 hover:bg-slate-100" aria-label="Row actions" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
            </button>
          }
        >
          {l.status !== 'COMPLETED' && l.status !== 'CANCELLED' && (
            <>
              <DropdownItem onClick={() => handleComplete(l)}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark completed
              </DropdownItem>
              <DropdownItem onClick={() => handleCancel(l)} danger>
                <Ban className="h-3.5 w-3.5" /> Cancel work order
              </DropdownItem>
            </>
          )}
          {(l.status === 'COMPLETED' || l.status === 'CANCELLED') && <p className="px-2.5 py-2 text-xs text-slate-400">No actions available</p>}
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Maintenance</h1>
          <p className="text-sm text-slate-500">Vehicles in the shop are automatically excluded from trip dispatch.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" /> Schedule maintenance
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Vehicles in shop" value={kpis.inShop} icon={Wrench} accent="signal" />
        <KpiCard label="Scheduled" value={kpis.scheduled} icon={Wrench} accent="route" />
        <KpiCard label="Awaiting approval" value={kpis.awaitingApproval} icon={Wrench} accent="ink" />
        <KpiCard label="Total spend" value={formatCurrency(kpis.totalSpend)} icon={Wrench} accent="alert" />
      </div>

      <BarChartCard title="Maintenance cost by service type" data={costByType} dataKey="cost" xKey="serviceType" color="#2F6FED" />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by vehicle or workshop…" className="w-72" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-48">
            <option value="ALL">All statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="AWAITING_APPROVAL">Awaiting approval</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
        <CardContent className="px-0 pb-0">
          <DataTable columns={columns} data={paged} rowKey={(l) => l.id} emptyTitle="No maintenance records match your filters" />
        </CardContent>
        <Pagination page={page} pageCount={pageCount} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Schedule maintenance"
        description="Scheduling maintenance immediately marks the vehicle as in-shop and unavailable for dispatch."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSchedule as any}>
              Schedule
            </Button>
          </>
        }
      >
        <form onSubmit={handleSchedule} className="flex flex-col gap-4">
          <Select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
            <option value="">Select a vehicle…</option>
            {vehicles.filter((v) => v.status !== 'RETIRED' && v.status !== 'IN_SHOP').map((v) => (
              <option key={v.id} value={v.id}>
                {v.regNumber} · {v.name}
              </option>
            ))}
          </Select>
          <Select label="Service type" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value as any })}>
            <option>Preventive</option>
            <option>Corrective</option>
            <option>Inspection</option>
            <option>Tyre</option>
            <option>Engine</option>
            <option>Electrical</option>
          </Select>
          <Input label="Workshop" value={form.workshop} onChange={(e) => setForm({ ...form, workshop: e.target.value })} placeholder="e.g. Shree Auto Works" />
          <Input label="Estimated cost (₹)" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </form>
      </Modal>
    </div>
  )
}
