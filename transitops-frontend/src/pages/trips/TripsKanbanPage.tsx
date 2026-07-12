import { useMemo, useState, type DragEvent } from 'react'
import { PlusCircle, MapPin, Package, Clock, AlertTriangle, User2, Truck as TruckIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SearchInput } from '@/components/ui/SearchInput'
import { Select } from '@/components/ui/Select'
import { TripFormDrawer } from './TripFormDrawer'
import { useData } from '@/context/DataContext'
import { formatDateTime, daysUntil, cn } from '@/lib/utils'
import { useToast } from '@/context/ToastContext'
import type { Trip, TripStatus, Vehicle, Driver } from '@/types'
import { PRIORITY_STYLES } from '@/lib/constants'

const COLUMNS: { key: TripStatus; label: string }[] = [
  { key: 'DRAFT', label: 'Draft' },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
]

export function TripsKanbanPage() {
  const { push } = useToast()
  const { trips, vehicles, drivers, vehicleById, driverById, createTrip, moveTrip } = useData()
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | Trip['priority']>('ALL')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dragTripId, setDragTripId] = useState<string | null>(null)

  const filtered = useMemo(
    () =>
      trips.filter((t) => {
        const matchesSearch =
          t.tripCode.toLowerCase().includes(search.toLowerCase()) || t.route.toLowerCase().includes(search.toLowerCase())
        const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter
        return matchesSearch && matchesPriority
      }),
    [trips, search, priorityFilter],
  )

  function validateDispatch(trip: Trip): string | null {
    const vehicle = vehicleById(trip.vehicleId)
    const driver = driverById(trip.driverId)
    if (!vehicle) return 'Assign a vehicle before dispatching this trip'
    if (!driver) return 'Assign a driver before dispatching this trip'
    if (vehicle.status === 'RETIRED') return `${vehicle.regNumber} is retired and cannot be dispatched`
    if (vehicle.status === 'IN_SHOP') return `${vehicle.regNumber} is currently in the shop`
    if (vehicle.status === 'ON_TRIP') return `${vehicle.regNumber} is already assigned to another active trip`
    if (trip.cargoWeightKg > vehicle.capacityKg) return `Cargo weight exceeds ${vehicle.regNumber}'s capacity`
    if (driver.status === 'SUSPENDED') return `${driver.name} is suspended`
    if (driver.status === 'ON_TRIP') return `${driver.name} is already assigned to another active trip`
    if (daysUntil(driver.licenseExpiry) < 0) return `${driver.name}'s license has expired`
    return null
  }

  function handleMoveTrip(tripId: string, target: TripStatus) {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip || trip.status === target) return

    if (target === 'DISPATCHED') {
      const error = validateDispatch(trip)
      if (error) {
        push(`Dispatch rejected: ${error}`, 'error')
        return
      }
      push(`${trip.tripCode} dispatched successfully`)
    }

    if (target === 'COMPLETED') {
      push(`${trip.tripCode} marked completed — odometer and availability updated`)
    }

    if (target === 'CANCELLED' && (trip.status === 'DISPATCHED' || trip.status === 'IN_PROGRESS')) {
      push(`${trip.tripCode} cancelled — vehicle and driver released`, 'info')
    } else if (target === 'CANCELLED') {
      push(`${trip.tripCode} cancelled`, 'info')
    }

    moveTrip(tripId, target)
  }

  function onDrop(e: DragEvent<HTMLDivElement>, target: TripStatus) {
    e.preventDefault()
    if (dragTripId) handleMoveTrip(dragTripId, target)
    setDragTripId(null)
  }

  function handleCreateTrip(data: Omit<Trip, 'id' | 'tripCode' | 'status' | 'actualArrival'>) {
    createTrip(data)
    push(`Trip created as draft`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Trips</h1>
          <p className="text-sm text-slate-500">Drag a card between columns to progress its lifecycle. Invalid dispatches are rejected automatically.</p>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <PlusCircle className="h-3.5 w-3.5" /> New trip
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search trip code or route…" className="w-72" />
        <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as any)} className="w-40">
          <option value="ALL">All priorities</option>
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const colTrips = filtered.filter((t) => t.status === col.key)
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, col.key)}
              className="flex flex-col gap-3 rounded-xl bg-slate-100/60 p-3 min-h-[200px]"
            >
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{col.label}</p>
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] text-slate-500">{colTrips.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {colTrips.map((trip) => {
                  const vehicle = vehicleById(trip.vehicleId)
                  const driver = driverById(trip.driverId)
                  return (
                    <div
                      key={trip.id}
                      draggable
                      onDragStart={() => setDragTripId(trip.id)}
                      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-card active:cursor-grabbing"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-semibold text-ink">{trip.tripCode}</span>
                        <Badge className={PRIORITY_STYLES[trip.priority]}>{trip.priority}</Badge>
                      </div>
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-ink">
                        <MapPin className="h-3 w-3 text-slate-400" /> {trip.route}
                      </p>
                      <div className="mt-2 flex flex-col gap-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <TruckIcon className="h-3 w-3" /> {vehicle ? vehicle.regNumber : 'Unassigned vehicle'}
                        </span>
                        <span className="flex items-center gap-1">
                          <User2 className="h-3 w-3" /> {driver ? driver.name : 'Unassigned driver'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatDateTime(trip.departureTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" /> {trip.cargoWeightKg}kg
                        </span>
                      </div>
                      {col.key === 'DRAFT' && (
                        <button
                          onClick={() => moveTrip(trip.id, 'DISPATCHED')}
                          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md bg-ink py-1.5 text-[11px] font-medium text-white hover:bg-ink/85"
                        >
                          Dispatch
                        </button>
                      )}
                      {(col.key === 'DISPATCHED' || col.key === 'IN_PROGRESS') && (
                        <div className="mt-2.5 flex gap-1.5">
                          <button
                            onClick={() => moveTrip(trip.id, 'COMPLETED')}
                            className="flex-1 rounded-md bg-go py-1.5 text-[11px] font-medium text-white hover:bg-go/90"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => moveTrip(trip.id, 'CANCELLED')}
                            className="flex-1 rounded-md bg-alert py-1.5 text-[11px] font-medium text-white hover:bg-alert/90"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
                {colTrips.length === 0 && (
                  <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-6 text-center">
                    <AlertTriangle className="h-3.5 w-3.5 text-slate-300" />
                    <p className="text-[11px] text-slate-400">No trips here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <TripFormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onCreate={handleCreateTrip} vehicles={vehicles} drivers={drivers} />
    </div>
  )
}
