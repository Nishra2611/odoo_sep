import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { PlusCircle, ShieldAlert, FileWarning, MoreVertical, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { FileUpload } from '@/components/ui/FileUpload'
import { LineChartCard } from '@/components/ui/ChartCards'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { SAFETY_INCIDENTS as INITIAL_INCIDENTS, COMPLIANCE_DOCUMENTS, vehicleById, driverById } from '@/lib/mockData'
import { formatDate, daysUntil } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import { SEVERITY_STYLES } from '@/lib/constants'
import type { SafetyIncident, IncidentSeverity } from '@/types'

export function SafetyPage() {
  const { push } = useToast()
  const [tab, setTab] = useState<'incidents' | 'compliance'>('incidents')
  const [incidents, setIncidents] = useState<SafetyIncident[]>(INITIAL_INCIDENTS)
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState<'ALL' | IncidentSeverity>('ALL')
  const [logOpen, setLogOpen] = useState(false)
  const [form, setForm] = useState({ type: 'Violation' as SafetyIncident['type'], severity: 'MODERATE' as IncidentSeverity, location: '', description: '' })

  const kpis = useMemo(() => {
    const open = incidents.filter((i) => i.status === 'OPEN' || i.status === 'INVESTIGATING').length
    const critical = incidents.filter((i) => i.severity === 'CRITICAL').length
    const expiredDocs = COMPLIANCE_DOCUMENTS.filter((d) => d.status === 'EXPIRED').length
    const expiringSoon = COMPLIANCE_DOCUMENTS.filter((d) => d.status === 'EXPIRING_SOON').length
    return { open, critical, expiredDocs, expiringSoon }
  }, [incidents])

  const trendData = useMemo(() => {
    const buckets: Record<string, number> = {}
    incidents.forEach((i) => {
      const key = new Date(i.date).toLocaleDateString('en-IN', { month: 'short' })
      buckets[key] = (buckets[key] ?? 0) + 1
    })
    return Object.entries(buckets).map(([month, count]) => ({ month, count }))
  }, [incidents])

  const filteredIncidents = incidents.filter((i) => {
    const matchesSearch = i.location.toLowerCase().includes(search.toLowerCase()) || i.type.toLowerCase().includes(search.toLowerCase())
    const matchesSeverity = severityFilter === 'ALL' || i.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  const incidentColumns: Column<SafetyIncident>[] = [
    { key: 'type', header: 'Type', render: (i) => i.type },
    { key: 'vehicle', header: 'Vehicle', render: (i) => vehicleById(i.vehicleId)?.regNumber ?? '—' },
    { key: 'driver', header: 'Driver', render: (i) => driverById(i.driverId)?.name ?? '—' },
    { key: 'severity', header: 'Severity', render: (i) => <StatusBadge status={i.severity} kind="severity" /> },
    { key: 'location', header: 'Location', render: (i) => i.location },
    { key: 'date', header: 'Date', sortValue: (i) => i.date, render: (i) => formatDate(i.date) },
    { key: 'status', header: 'Status', render: (i) => <Badge className="bg-slate-100 text-slate-600 border-slate-300">{i.status}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (i) => (
        <Dropdown
          trigger={
            <button className="rounded-md p-1.5 hover:bg-slate-100" aria-label="Row actions" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
            </button>
          }
        >
          {i.status !== 'CLOSED' && (
            <DropdownItem
              onClick={() => {
                setIncidents((is) => is.map((x) => (x.id === i.id ? { ...x, status: 'RESOLVED' } : x)))
                push(`Incident marked resolved`)
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark resolved
            </DropdownItem>
          )}
        </Dropdown>
      ),
    },
  ]

  const complianceColumns: Column<(typeof COMPLIANCE_DOCUMENTS)[number]>[] = [
    { key: 'entity', header: 'Entity', render: (d) => d.entityLabel },
    { key: 'type', header: 'Document type', render: (d) => d.type.replace(/_/g, ' ') },
    { key: 'expiry', header: 'Expiry date', sortValue: (d) => d.expiryDate, render: (d) => formatDate(d.expiryDate) },
    {
      key: 'daysLeft',
      header: 'Days remaining',
      sortValue: (d) => daysUntil(d.expiryDate),
      render: (d) => (daysUntil(d.expiryDate) < 0 ? `${Math.abs(daysUntil(d.expiryDate))}d overdue` : `${daysUntil(d.expiryDate)}d`),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => (
        <Badge
          className={
            d.status === 'VALID'
              ? 'bg-go-soft text-go border-go/30'
              : d.status === 'EXPIRING_SOON'
              ? 'bg-signal-soft text-signal-dim border-signal/30'
              : 'bg-alert-soft text-alert border-alert/30'
          }
        >
          {d.status.replace('_', ' ')}
        </Badge>
      ),
    },
  ]

  function logIncident(e: FormEvent) {
    e.preventDefault()
    if (!form.location || !form.description) {
      push('Location and description are required', 'error')
      return
    }
    const incident: SafetyIncident = {
      id: `inc-new-${Date.now()}`,
      vehicleId: null,
      driverId: null,
      type: form.type,
      severity: form.severity,
      status: 'OPEN',
      date: new Date().toISOString(),
      location: form.location,
      description: form.description,
      correctiveAction: 'Pending review',
    }
    setIncidents((is) => [incident, ...is])
    push('Incident logged and assigned for investigation')
    setLogOpen(false)
    setForm({ type: 'Violation', severity: 'MODERATE', location: '', description: '' })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Safety & Compliance</h1>
          <p className="text-sm text-slate-500">Incidents, violations, inspections and document compliance across the fleet.</p>
        </div>
        <Button onClick={() => setLogOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" /> Log incident
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Open incidents" value={kpis.open} icon={ShieldAlert} accent="alert" />
        <KpiCard label="Critical severity" value={kpis.critical} icon={ShieldAlert} accent="alert" />
        <KpiCard label="Expired documents" value={kpis.expiredDocs} icon={FileWarning} accent="alert" />
        <KpiCard label="Expiring within 30 days" value={kpis.expiringSoon} icon={FileWarning} accent="signal" />
      </div>

      <LineChartCard title="Incident trend" data={trendData} dataKey="count" xKey="month" color="#E5484D" />

      <Tabs
        tabs={[
          { key: 'incidents', label: 'Incidents & violations' },
          { key: 'compliance', label: 'Compliance documents' },
        ]}
        active={tab}
        onChange={(k) => setTab(k as any)}
      />

      {tab === 'incidents' ? (
        <Card>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by location or type…" className="w-72" />
            <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as any)} className="w-40">
              <option value="ALL">All severities</option>
              <option value="LOW">Low</option>
              <option value="MODERATE">Moderate</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </div>
          <CardContent className="px-0 pb-0">
            <DataTable columns={incidentColumns} data={filteredIncidents} rowKey={(i) => i.id} emptyTitle="No incidents match your filters" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="px-0 pb-0 pt-4">
            <DataTable columns={complianceColumns} data={COMPLIANCE_DOCUMENTS} rowKey={(d) => d.id} emptyTitle="No compliance documents on file" />
          </CardContent>
        </Card>
      )}

      <Modal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        title="Log safety incident"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setLogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={logIncident as any}>
              Log incident
            </Button>
          </>
        }
      >
        <form onSubmit={logIncident} className="flex flex-col gap-4">
          <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
            <option>Accident</option>
            <option>Violation</option>
            <option>Near Miss</option>
            <option>Inspection Failure</option>
          </Select>
          <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as any })}>
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </Select>
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <FileUpload label="Upload evidence photos or reports" accept="image/*,.pdf" />
        </form>
      </Modal>
    </div>
  )
}
