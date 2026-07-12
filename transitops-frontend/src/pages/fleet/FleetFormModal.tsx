import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Vehicle } from '@/types'

const schema = z.object({
  regNumber: z.string().min(4, 'Registration number is required'),
  name: z.string().min(2, 'Vehicle name is required'),
  type: z.enum(['Truck', 'Van', 'Trailer', 'Pickup']),
  capacityKg: z.number().positive('Capacity must be greater than 0'),
  acquisitionCost: z.number().nonnegative(),
  insuranceExpiry: z.string().min(1, 'Required'),
  registrationExpiry: z.string().min(1, 'Required'),
})

interface FleetFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (vehicle: Omit<Vehicle, 'id' | 'status' | 'assignedDriverId' | 'odometerKm' | 'lastServiceDate' | 'gpsStatus' | 'riskScore'>) => void
  existingRegNumbers: string[]
  initial?: Vehicle | null
}

export function FleetFormModal({ open, onClose, onSubmit, existingRegNumbers, initial }: FleetFormModalProps) {
  const [form, setForm] = useState({
    regNumber: '',
    name: '',
    type: 'Truck' as Vehicle['type'],
    capacityKg: 1500,
    acquisitionCost: 800000,
    insuranceExpiry: '',
    registrationExpiry: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setErrors({})
      if (initial) {
        setForm({
          regNumber: initial.regNumber,
          name: initial.name,
          type: initial.type,
          capacityKg: initial.capacityKg,
          acquisitionCost: initial.acquisitionCost,
          insuranceExpiry: initial.insuranceExpiry.slice(0, 10),
          registrationExpiry: initial.registrationExpiry.slice(0, 10),
        })
      } else {
        setForm({ regNumber: '', name: '', type: 'Truck', capacityKg: 1500, acquisitionCost: 800000, insuranceExpiry: '', registrationExpiry: '' })
      }
    }
  }, [open, initial])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const result = schema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message
      })
      setErrors(fieldErrors)
      return
    }
    const isDuplicate = existingRegNumbers
      .filter((r) => r !== initial?.regNumber)
      .some((r) => r.toLowerCase() === form.regNumber.toLowerCase())
    if (isDuplicate) {
      setErrors({ regNumber: 'A vehicle with this registration number already exists' })
      return
    }
    onSubmit(result.data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit vehicle' : 'Add vehicle'}
      description="Vehicles with expired documents or active retirement status are automatically excluded from dispatch."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit as any}>
            {initial ? 'Save changes' : 'Add vehicle'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Input
          label="Registration number"
          value={form.regNumber}
          onChange={(e) => setForm({ ...form, regNumber: e.target.value })}
          error={errors.regNumber}
          placeholder="GJ01 AB 1234"
        />
        <Input
          label="Vehicle name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          placeholder="Tata Ace"
        />
        <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Vehicle['type'] })}>
          <option>Truck</option>
          <option>Van</option>
          <option>Trailer</option>
          <option>Pickup</option>
        </Select>
        <Input
          label="Capacity (kg)"
          type="number"
          value={form.capacityKg}
          onChange={(e) => setForm({ ...form, capacityKg: Number(e.target.value) })}
          error={errors.capacityKg}
        />
        <Input
          label="Acquisition cost (₹)"
          type="number"
          value={form.acquisitionCost}
          onChange={(e) => setForm({ ...form, acquisitionCost: Number(e.target.value) })}
          error={errors.acquisitionCost}
        />
        <div />
        <Input
          label="Insurance expiry"
          type="date"
          value={form.insuranceExpiry}
          onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })}
          error={errors.insuranceExpiry}
        />
        <Input
          label="Registration expiry"
          type="date"
          value={form.registrationExpiry}
          onChange={(e) => setForm({ ...form, registrationExpiry: e.target.value })}
          error={errors.registrationExpiry}
        />
      </form>
    </Modal>
  )
}
