import { useMemo, useState } from 'react'
import { PlusCircle, MoreVertical, Eye, Pencil, Trash2, UserPlus, Wrench, History, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Drawer } from '@/components/ui/Drawer'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { FleetFormModal } from './FleetFormModal'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useData } from '@/context/DataContext'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import type { Vehicle, VehicleStatus, MaintenanceLog } from '@/types'

const PAGE_SIZE = 8

export function FleetListPage() {
  const { push } = useToast()
  const {
    vehicles,
    drivers,
    maintenanceLogs,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    driverById,
    assignDriverToVehicle,
    scheduleMaintenance,
  } = useData()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | VehicleStatus>('ALL')
  const [typeFilter, setTypeFilter] = useState<'ALL' | Vehicle['type']>('ALL')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [deleting, setDeleting] = useState<Vehicle | null>(null)
  const [detail, setDetail] = useState<Vehicle | null>(null)

  // Assign Driver State
  const [assigningVehicle, setAssigningVehicle] = useState<Vehicle | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')

  // Maintenance State
  const [maintenancingVehicle, setMaintenancingVehicle] = useState<Vehicle | null>(null)
  const [maintenanceForm, setMaintenanceForm] = useState({
    serviceType: 'Preventive' as MaintenanceLog['serviceType'],
    workshop: '',
    cost: 5000,
    notes: '',
  })

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesSearch =
        v.regNumber.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter
      const matchesType = typeFilter === 'ALL' || v.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [vehicles, search, statusFilter, typeFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleAdd(data: Omit<Vehicle, 'id' | 'status' | 'assignedDriverId' | 'odometerKm' | 'lastServiceDate' | 'gpsStatus' | 'riskScore'>) {
    if (editing) {
      updateVehicle({ ...editing, ...data })
      push(`${data.regNumber} updated successfully`)
      setEditing(null)
    } else {
      addVehicle(data)
      push(`${data.regNumber} added to the fleet`)
    }
    setFormOpen(false)
  }

  function handleDelete() {
    if (!deleting) return
    if (deleting.status === 'ON_TRIP') {
      push('Cannot remove a vehicle that is currently on a trip', 'error')
      return
    }
    deleteVehicle(deleting.id)
    push(`${deleting.regNumber} removed from the fleet`, 'info')
    setDeleting(null)
  }

  function retireVehicle(v: Vehicle) {
    if (v.status === 'ON_TRIP') {
      push('This vehicle is on an active trip and cannot be retired right now', 'error')
      return
    }
    updateVehicle({ ...v, status: 'RETIRED' })
    push(`${v.regNumber} marked as retired`, 'info')
    if (detail?.id === v.id) {
      setDetail({ ...v, status: 'RETIRED' })
    }
  }

  const eligibleDrivers = useMemo(() => {
    if (!assigningVehicle) return []
    return drivers.filter(
      (d) => d.status === 'AVAILABLE' || d.id === assigningVehicle.assignedDriverId
    )
  }, [drivers, assigningVehicle])

  function handleAssignSave() {
    if (!assigningVehicle) return
    assignDriverToVehicle(assigningVehicle.id, selectedDriverId || null)
    push(`Driver assignment updated for ${assigningVehicle.regNumber}`)
    setAssigningVehicle(null)
  }

  function handleMaintenanceSave(e: React.FormEvent) {
    e.preventDefault()
    if (!maintenancingVehicle) return
    scheduleMaintenance({
      vehicleId: maintenancingVehicle.id,
      serviceType: maintenanceForm.serviceType,
      workshop: maintenanceForm.workshop || 'Fleet Depot Workshop',
      cost: Number(maintenanceForm.cost),
      notes: maintenanceForm.notes,
    })
    push(`Scheduled maintenance for ${maintenancingVehicle.regNumber}`)
    setMaintenancingVehicle(null)
  }

  const columns: Column<Vehicle>[] = [
    {
      key: 'regNumber',
      header: 'Registration',
      sortValue: (v) => v.regNumber,
      render: (v) => (
        <div>
          <p className="font-mono text-xs font-semibold">{v.regNumber}</p>
          <p className="text-[11px] text-slate-400">{v.name} · {v.type}</p>
        </div>
      ),
    },
    { key: 'capacity', header: 'Capacity', sortValue: (v) => v.capacityKg, render: (v) => `${formatNumber(v.capacityKg)} kg` },
    { key: 'odometer', header: 'Odometer', sortValue: (v) => v.odometerKm, render: (v) => `${formatNumber(v.odometerKm)} km` },
    { key: 'cost', header: 'Acquisition cost', sortValue: (v) => v.acquisitionCost, render: (v) => formatCurrency(v.acquisitionCost) },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} kind="vehicle" /> },
    { key: 'driver', header: 'Assigned driver', render: (v) => driverById(v.assignedDriverId)?.name ?? '—' },
    { key: 'lastService', header: 'Last service', render: (v) => formatDate(v.lastServiceDate) },
    { key: 'insurance', header: 'Insurance', render: (v) => formatDate(v.insuranceExpiry) },
    {
      key: 'risk',
      header: 'Risk score',
      sortValue: (v) => v.riskScore,
      render: (v) => (
        <div className="flex items-center gap-2 w-24">
          <ProgressBar value={v.riskScore} barClassName={v.riskScore > 70 ? '!bg-alert' : v.riskScore > 40 ? '!bg-signal' : '!bg-go'} />
          <span className="text-[11px] text-slate-500">{v.riskScore}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (v) => (
        <Dropdown
          trigger={
            <button className="rounded-md p-1.5 hover:bg-slate-100" aria-label="Row actions" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
            </button>
          }
        >
          <DropdownItem onClick={() => setDetail(v)}>
            <Eye className="h-3.5 w-3.5" /> View
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              setEditing(v)
              setFormOpen(true)
            }}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              setAssigningVehicle(v)
              setSelectedDriverId(v.assignedDriverId || '')
            }}
          >
            <UserPlus className="h-3.5 w-3.5" /> Assign driver
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              setMaintenancingVehicle(v)
              setMaintenanceForm({ serviceType: 'Preventive', workshop: '', cost: 5000, notes: '' })
            }}
          >
            <Wrench className="h-3.5 w-3.5" /> Schedule maintenance
          </DropdownItem>
          <DropdownItem onClick={() => setDetail(v)}>
            <History className="h-3.5 w-3.5" /> View history
          </DropdownItem>
          <DropdownItem onClick={() => setDeleting(v)} danger>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </DropdownItem>
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Fleet</h1>
          <p className="text-sm text-slate-500">{filtered.length} of {vehicles.length} vehicles</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <PlusCircle className="h-3.5 w-3.5" /> Add vehicle
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by registration or name…" className="w-72" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-44">
            <option value="ALL">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On trip</option>
            <option value="IN_SHOP">In shop</option>
            <option value="RETIRED">Retired</option>
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-36">
            <option value="ALL">All types</option>
            <option>Truck</option>
            <option>Van</option>
            <option>Trailer</option>
            <option>Pickup</option>
          </Select>
        </div>
        <CardContent className="px-0 pb-0">
          <DataTable columns={columns} data={paged} rowKey={(v) => v.id} onRowClick={(v) => setDetail(v)} emptyTitle="No vehicles match your filters" />
        </CardContent>
        <Pagination page={page} pageCount={pageCount} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>

      <FleetFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleAdd}
        existingRegNumbers={vehicles.map((v) => v.regNumber)}
        initial={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Remove vehicle"
        description={`Are you sure you want to remove ${deleting?.regNumber}? This cannot be undone.`}
        confirmLabel="Remove vehicle"
        danger
      />

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.regNumber ?? ''} description={detail?.name}>
        {detail && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                <Truck className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <StatusBadge status={detail.status} kind="vehicle" />
                <p className="mt-1 text-xs text-slate-500">GPS: {detail.gpsStatus.replace('_', ' ').toLowerCase()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Capacity" value={`${formatNumber(detail.capacityKg)} kg`} />
              <Field label="Odometer" value={`${formatNumber(detail.odometerKm)} km`} />
              <Field label="Acquisition cost" value={formatCurrency(detail.acquisitionCost)} />
              <Field label="Assigned driver" value={driverById(detail.assignedDriverId)?.name ?? '—'} />
              <Field label="Last service" value={formatDate(detail.lastServiceDate)} />
              <Field label="Insurance expiry" value={formatDate(detail.insuranceExpiry)} />
              <Field label="Registration expiry" value={formatDate(detail.registrationExpiry)} />
              <Field label="Risk score" value={`${detail.riskScore} / 100`} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Service history</p>
              <ul className="flex flex-col gap-2">
                {maintenanceLogs.filter((m: MaintenanceLog) => m.vehicleId === detail.id).slice(0, 5).map((m: MaintenanceLog) => (
                  <li key={m.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs">
                    <span>{m.serviceType} · {m.workshop}</span>
                    <span className="text-slate-400">{formatDate(m.serviceDate)}</span>
                  </li>
                ))}
                {maintenanceLogs.filter((m: MaintenanceLog) => m.vehicleId === detail.id).length === 0 && (
                  <p className="text-xs text-slate-400">No service records yet.</p>
                )}
              </ul>
            </div>
            {detail.status !== 'RETIRED' && (
              <Button variant="outline" size="sm" onClick={() => retireVehicle(detail)}>
                Mark as retired
              </Button>
            )}
          </div>
        )}
      </Drawer>

      {/* Assign Driver Modal */}
      <Modal
        open={!!assigningVehicle}
        onClose={() => setAssigningVehicle(null)}
        title={`Assign Driver to ${assigningVehicle?.regNumber}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAssigningVehicle(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAssignSave}>
              Save assignment
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Select
            label="Select Driver"
            value={selectedDriverId}
            onChange={(e) => setSelectedDriverId(e.target.value)}
          >
            <option value="">Unassigned</option>
            {eligibleDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.status.toLowerCase()})
              </option>
            ))}
          </Select>
          {assigningVehicle?.assignedDriverId && !selectedDriverId && (
            <p className="text-xs text-alert font-medium">
              Note: Saving will unassign the current driver.
            </p>
          )}
        </div>
      </Modal>

      {/* Schedule Maintenance Modal */}
      <Modal
        open={!!maintenancingVehicle}
        onClose={() => setMaintenancingVehicle(null)}
        title={`Schedule Maintenance for ${maintenancingVehicle?.regNumber}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setMaintenancingVehicle(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleMaintenanceSave as any}>
              Schedule service
            </Button>
          </>
        }
      >
        <form onSubmit={handleMaintenanceSave} className="flex flex-col gap-4">
          <Select
            label="Service Type"
            value={maintenanceForm.serviceType}
            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceType: e.target.value as any })}
          >
            <option>Preventive</option>
            <option>Corrective</option>
            <option>Inspection</option>
            <option>Tyre</option>
            <option>Engine</option>
            <option>Electrical</option>
          </Select>
          <Input
            label="Workshop"
            value={maintenanceForm.workshop}
            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, workshop: e.target.value })}
            placeholder="e.g. Main Depot Workshop"
          />
          <Input
            label="Estimated Cost (₹)"
            type="number"
            value={maintenanceForm.cost}
            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: Number(e.target.value) })}
          />
          <Textarea
            label="Notes"
            value={maintenanceForm.notes}
            onChange={(e) => setMaintenanceForm({ ...maintenanceForm, notes: e.target.value })}
            placeholder="Describe issues/notes..."
          />
        </form>
      </Modal>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>
  )
}
