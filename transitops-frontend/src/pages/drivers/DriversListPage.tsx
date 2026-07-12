import { useMemo, useState } from 'react'
import { PlusCircle, MoreVertical, Eye, Pencil, Ban, Trash2, ShieldCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Drawer } from '@/components/ui/Drawer'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { FileUpload } from '@/components/ui/FileUpload'
import { DriverFormModal } from './DriverFormModal'
import { useData } from '@/context/DataContext'
import { formatDate, initials } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import type { Driver, DriverStatus } from '@/types'

const PAGE_SIZE = 8

export function DriversListPage() {
  const { push } = useToast()
  const { drivers, safetyIncidents, vehicleById, addDriver, updateDriver, deleteDriver } = useData()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | DriverStatus>('ALL')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Driver | null>(null)
  const [suspending, setSuspending] = useState<Driver | null>(null)
  const [deleting, setDeleting] = useState<Driver | null>(null)
  const [detail, setDetail] = useState<Driver | null>(null)

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.licenseNumber.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [drivers, search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSave(data: Omit<Driver, 'id' | 'status' | 'assignedVehicleId' | 'safetyRating' | 'tripCompletionPct' | 'joinedDate' | 'certifications' | 'violationsCount' | 'attendancePct'>) {
    if (editing) {
      updateDriver({ ...editing, ...data })
      push(`${data.name}'s profile updated`)
      setEditing(null)
    } else {
      addDriver(data)
      push(`${data.name} added to the driver roster`)
    }
    setFormOpen(false)
  }

  function suspendDriver() {
    if (!suspending) return
    updateDriver({ ...suspending, status: 'SUSPENDED' })
    push(`${suspending.name} suspended — no new trips can be assigned`, 'error')
    setSuspending(null)
  }

  function reinstateDriver(d: Driver) {
    updateDriver({ ...d, status: 'AVAILABLE' })
    push(`${d.name} reinstated and available for dispatch`)
    if (detail?.id === d.id) {
      setDetail({ ...d, status: 'AVAILABLE' })
    }
  }

  const columns: Column<Driver>[] = [
    {
      key: 'name',
      header: 'Driver',
      sortValue: (d) => d.name,
      render: (d) => (
        <div className="flex items-center gap-2.5">
          <Avatar initials={initials(d.name)} className="bg-slate-700" />
          <div>
            <p className="font-medium">{d.name}</p>
            <p className="text-[11px] text-slate-400">{d.phone}</p>
          </div>
        </div>
      ),
    },
    { key: 'license', header: 'License', render: (d) => <span className="font-mono text-xs">{d.licenseNumber}</span> },
    { key: 'expiry', header: 'License expiry', sortValue: (d) => d.licenseExpiry, render: (d) => formatDate(d.licenseExpiry) },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} kind="driver" /> },
    { key: 'vehicle', header: 'Assigned vehicle', render: (d) => vehicleById(d.assignedVehicleId)?.regNumber ?? '—' },
    {
      key: 'safety',
      header: 'Safety rating',
      sortValue: (d) => d.safetyRating,
      render: (d) => (
        <div className="flex items-center gap-1.5">
          <ShieldCheck className={`h-3.5 w-3.5 ${d.safetyRating >= 4.2 ? 'text-go' : d.safetyRating >= 3.5 ? 'text-signal' : 'text-alert'}`} />
          {d.safetyRating.toFixed(1)}
        </div>
      ),
    },
    {
      key: 'completion',
      header: 'Trip completion',
      sortValue: (d) => d.tripCompletionPct,
      render: (d) => (
        <div className="flex items-center gap-2 w-24">
          <ProgressBar value={d.tripCompletionPct} />
          <span className="text-[11px] text-slate-500">{d.tripCompletionPct}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (d) => (
        <Dropdown
          trigger={
            <button className="rounded-md p-1.5 hover:bg-slate-100" aria-label="Row actions" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
            </button>
          }
        >
          <DropdownItem onClick={() => setDetail(d)}>
            <Eye className="h-3.5 w-3.5" /> View profile
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              setEditing(d)
              setFormOpen(true)
            }}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </DropdownItem>
          {d.status === 'SUSPENDED' ? (
            <DropdownItem onClick={() => reinstateDriver(d)}>
              <ShieldCheck className="h-3.5 w-3.5" /> Reinstate
            </DropdownItem>
          ) : (
            <DropdownItem onClick={() => setSuspending(d)} danger>
              <Ban className="h-3.5 w-3.5" /> Suspend
            </DropdownItem>
          )}
          <DropdownItem onClick={() => setDeleting(d)} danger>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </DropdownItem>
        </Dropdown>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Drivers</h1>
          <p className="text-sm text-slate-500">{filtered.length} of {drivers.length} drivers</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
        >
          <PlusCircle className="h-3.5 w-3.5" /> Add driver
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name or license…" className="w-72" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-48">
            <option value="ALL">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On trip</option>
            <option value="OFF_DUTY">Off duty</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="LEAVE">Leave</option>
            <option value="EXPIRED_LICENSE">Expired license</option>
          </Select>
        </div>
        <CardContent className="px-0 pb-0">
          <DataTable columns={columns} data={paged} rowKey={(d) => d.id} onRowClick={(d) => setDetail(d)} emptyTitle="No drivers match your filters" />
        </CardContent>
        <Pagination page={page} pageCount={pageCount} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>

      <DriverFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSave}
        initial={editing}
      />

      <ConfirmDialog
        open={!!suspending}
        onClose={() => setSuspending(null)}
        onConfirm={suspendDriver}
        title="Suspend driver"
        description={`${suspending?.name} will be immediately blocked from receiving new trip assignments. Continue?`}
        confirmLabel="Suspend driver"
        danger
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteDriver(deleting.id)
            push(`${deleting.name} removed from the roster`, 'info')
          }
          setDeleting(null)
        }}
        title="Remove driver"
        description={`Are you sure you want to remove ${deleting?.name}? This cannot be undone.`}
        confirmLabel="Remove driver"
        danger
      />

      <Drawer open={!!detail} onClose={() => setDetail(null)} title={detail?.name ?? ''} description={detail?.email}>
        {detail && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Avatar initials={initials(detail.name)} className="h-12 w-12 bg-slate-700 text-sm" />
              <div>
                <StatusBadge status={detail.status} kind="driver" />
                <p className="mt-1 text-xs text-slate-500">Joined {formatDate(detail.joinedDate)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Phone" value={detail.phone} />
              <Field label="Emergency contact" value={detail.emergencyContact} />
              <Field label="License number" value={detail.licenseNumber} />
              <Field label="License expiry" value={formatDate(detail.licenseExpiry)} />
              <Field label="Safety rating" value={`${detail.safetyRating.toFixed(1)} / 5.0`} />
              <Field label="Trip completion" value={`${detail.tripCompletionPct}%`} />
              <Field label="Attendance" value={`${detail.attendancePct}%`} />
              <Field label="Violations" value={String(detail.violationsCount)} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Certifications</p>
              <div className="flex flex-wrap gap-1.5">
                {detail.certifications.length === 0 && <p className="text-xs text-slate-400">No certifications on file.</p>}
                {detail.certifications.map((c) => (
                  <span key={c} className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recent incidents</p>
              <ul className="flex flex-col gap-2">
                {safetyIncidents.filter((i) => i.driverId === detail.id).slice(0, 3).map((i) => (
                  <li key={i.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs">
                    <span>{i.type}</span>
                    <span className="text-slate-400">{formatDate(i.date)}</span>
                  </li>
                ))}
                {safetyIncidents.filter((i) => i.driverId === detail.id).length === 0 && (
                  <p className="text-xs text-slate-400">No incidents on file.</p>
                )}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Documents</p>
              <FileUpload label="Upload license, ID or certification documents" accept="image/*,.pdf" />
            </div>
          </div>
        )}
      </Drawer>
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
