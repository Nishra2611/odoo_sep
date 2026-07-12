import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { Trip, Vehicle, Driver } from '@/types'
import { daysUntil } from '@/lib/utils'

interface TripFormDrawerProps {
  open: boolean
  onClose: () => void
  onCreate: (trip: Omit<Trip, 'id' | 'tripCode' | 'status' | 'actualArrival'>) => void
  vehicles: Vehicle[]
  drivers: Driver[]
}

export function TripFormDrawer({ open, onClose, onCreate, vehicles, drivers }: TripFormDrawerProps) {
  const [form, setForm] = useState({
    pickup: '',
    destination: '',
    vehicleId: '',
    driverId: '',
    cargoDetails: '',
    cargoWeightKg: 500,
    estDistanceKm: 200,
    departureTime: '',
    priority: 'NORMAL' as Trip['priority'],
    notes: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setForm({
        pickup: '',
        destination: '',
        vehicleId: '',
        driverId: '',
        cargoDetails: '',
        cargoWeightKg: 500,
        estDistanceKm: 200,
        departureTime: '',
        priority: 'NORMAL',
        notes: '',
      })
      setValidationError(null)
    }
  }, [open])

  function validate(): string | null {
    if (!form.pickup || !form.destination) return 'Pickup and destination are required'
    if (!form.vehicleId) return 'Select a vehicle to save as draft, or dispatch directly once assigned'
    const vehicle = vehicles.find((v) => v.id === form.vehicleId)
    const driver = drivers.find((d) => d.id === form.driverId)
    if (vehicle) {
      if (vehicle.status === 'RETIRED') return `${vehicle.regNumber} is retired and cannot be dispatched`
      if (vehicle.status === 'IN_SHOP') return `${vehicle.regNumber} is currently in the shop`
      if (vehicle.status === 'ON_TRIP') return `${vehicle.regNumber} is already assigned to another trip`
      if (form.cargoWeightKg > vehicle.capacityKg) return `Cargo weight (${form.cargoWeightKg}kg) exceeds ${vehicle.regNumber}'s capacity (${vehicle.capacityKg}kg)`
    }
    if (driver) {
      if (driver.status === 'SUSPENDED') return `${driver.name} is suspended and cannot be assigned`
      if (driver.status === 'EXPIRED_LICENSE') return `${driver.name}'s license has expired`
      if (driver.status === 'ON_TRIP') return `${driver.name} is already assigned to another trip`
      if (daysUntil(driver.licenseExpiry) < 0) return `${driver.name}'s license expired ${Math.abs(daysUntil(driver.licenseExpiry))} days ago`
    }
    return null
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const error = validate()
    if (error) {
      setValidationError(error)
      return
    }
    onCreate({
      route: `${form.pickup} → ${form.destination}`,
      pickup: form.pickup,
      destination: form.destination,
      stops: [],
      driverId: form.driverId || null,
      vehicleId: form.vehicleId || null,
      estDistanceKm: form.estDistanceKm,
      estDurationMin: Math.round((form.estDistanceKm / 45) * 60),
      departureTime: form.departureTime || new Date().toISOString(),
      eta: form.departureTime || new Date().toISOString(),
      cargoDetails: form.cargoDetails,
      cargoWeightKg: form.cargoWeightKg,
      passengerCount: 0,
      priority: form.priority,
      notes: form.notes,
      fuelEstimateL: Number((form.estDistanceKm / 4.2).toFixed(1)),
    })
    onClose()
  }

  const eligibleVehicles = vehicles.filter((v) => v.status !== 'RETIRED')
  const eligibleDrivers = drivers.filter((d) => d.status !== 'SUSPENDED' && d.status !== 'EXPIRED_LICENSE')

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create trip"
      description="Dispatch validation runs the same checks as the backend's trip validator before confirming."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit as any}>
            Create trip
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Pickup" value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} required />
          <Input label="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
        </div>

        <Select label="Vehicle" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
          <option value="">Select a vehicle…</option>
          {eligibleVehicles.map((v) => (
            <option key={v.id} value={v.id} disabled={v.status !== 'AVAILABLE'}>
              {v.regNumber} · {v.name} ({v.status.replace('_', ' ')}) — {v.capacityKg}kg capacity
            </option>
          ))}
        </Select>

        <Select label="Driver" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
          <option value="">Select a driver…</option>
          {eligibleDrivers.map((d) => (
            <option key={d.id} value={d.id} disabled={d.status !== 'AVAILABLE'}>
              {d.name} ({d.status.replace('_', ' ')}) — license exp. {new Date(d.licenseExpiry).toLocaleDateString()}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cargo weight (kg)"
            type="number"
            value={form.cargoWeightKg}
            onChange={(e) => setForm({ ...form, cargoWeightKg: Number(e.target.value) })}
          />
          <Input
            label="Estimated distance (km)"
            type="number"
            value={form.estDistanceKm}
            onChange={(e) => setForm({ ...form, estDistanceKm: Number(e.target.value) })}
          />
        </div>

        <Input label="Cargo details" value={form.cargoDetails} onChange={(e) => setForm({ ...form, cargoDetails: e.target.value })} placeholder="e.g. FMCG cartons" />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Departure time" type="datetime-local" value={form.departureTime} onChange={(e) => setForm({ ...form, departureTime: e.target.value })} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Trip['priority'] })}>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>

        <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional delivery instructions…" />

        {validationError && (
          <div className="flex items-start gap-2 rounded-lg bg-alert-soft px-3 py-2.5 text-xs text-alert">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}
      </form>
    </Drawer>
  )
}
