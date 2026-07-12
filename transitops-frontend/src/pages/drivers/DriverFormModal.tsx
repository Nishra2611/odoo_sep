import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Driver } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(8, 'Valid phone number is required'),
  email: z.string().email('Enter a valid email'),
  licenseNumber: z.string().min(4, 'License number is required'),
  licenseExpiry: z.string().min(1, 'Required'),
  emergencyContact: z.string().min(8, 'Required'),
})

interface DriverFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: z.infer<typeof schema>) => void
  initial?: Driver | null
}

export function DriverFormModal({ open, onClose, onSubmit, initial }: DriverFormModalProps) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '', emergencyContact: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setErrors({})
      if (initial) {
        setForm({
          name: initial.name,
          phone: initial.phone,
          email: initial.email,
          licenseNumber: initial.licenseNumber,
          licenseExpiry: initial.licenseExpiry.slice(0, 10),
          emergencyContact: initial.emergencyContact,
        })
      } else {
        setForm({ name: '', phone: '', email: '', licenseNumber: '', licenseExpiry: '', emergencyContact: '' })
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
    onSubmit(result.data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit driver' : 'Add driver'}
      description="Drivers with an expired license or suspended status are automatically blocked from new trip assignments."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit as any}>
            {initial ? 'Save changes' : 'Add driver'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} className="col-span-2" />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} error={errors.phone} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
        <Input label="License number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} error={errors.licenseNumber} />
        <Input label="License expiry" type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} error={errors.licenseExpiry} />
        <Input
          label="Emergency contact"
          value={form.emergencyContact}
          onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
          error={errors.emergencyContact}
          className="col-span-2"
        />
      </form>
    </Modal>
  )
}
