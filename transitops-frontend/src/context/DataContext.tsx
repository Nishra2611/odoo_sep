import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import type { Vehicle, Driver, Trip, MaintenanceLog, SafetyIncident, FuelLog, Expense, ComplianceDocument, TripStatus, VehicleStatus, DriverStatus } from '@/types'
import {
  VEHICLES as INITIAL_VEHICLES,
  DRIVERS as INITIAL_DRIVERS,
  TRIPS as INITIAL_TRIPS,
  MAINTENANCE_LOGS as INITIAL_MAINTENANCE,
  SAFETY_INCIDENTS as INITIAL_SAFETY,
  FUEL_LOGS as INITIAL_FUEL,
  EXPENSES as INITIAL_EXPENSES,
  COMPLIANCE_DOCUMENTS as INITIAL_COMPLIANCE,
} from '@/lib/mockData'
import { daysUntil } from '@/lib/utils'

interface DataContextValue {
  vehicles: Vehicle[]
  drivers: Driver[]
  trips: Trip[]
  maintenanceLogs: MaintenanceLog[]
  safetyIncidents: SafetyIncident[]
  fuelLogs: FuelLog[]
  expenses: Expense[]
  complianceDocuments: ComplianceDocument[]

  // Helpers
  vehicleById: (id: string | null) => Vehicle | null
  driverById: (id: string | null) => Driver | null

  // Actions
  addVehicle: (v: Omit<Vehicle, 'id' | 'status' | 'assignedDriverId' | 'odometerKm' | 'lastServiceDate' | 'gpsStatus' | 'riskScore'>) => void
  updateVehicle: (v: Vehicle) => void
  deleteVehicle: (id: string) => void
  addDriver: (d: Omit<Driver, 'id' | 'status' | 'assignedVehicleId' | 'safetyRating' | 'tripCompletionPct' | 'joinedDate' | 'certifications' | 'violationsCount' | 'attendancePct'>) => void
  updateDriver: (d: Driver) => void
  deleteDriver: (id: string) => void
  createTrip: (t: Omit<Trip, 'id' | 'tripCode' | 'status' | 'actualArrival'>) => void
  moveTrip: (tripId: string, status: TripStatus) => void
  scheduleMaintenance: (log: Omit<MaintenanceLog, 'id' | 'mechanic' | 'mileageKm' | 'serviceDate' | 'completionDate' | 'partsUsed' | 'warranty' | 'approved' | 'status'> & { vehicleId: string; notes?: string }) => void
  completeMaintenance: (logId: string) => void
  cancelMaintenance: (logId: string) => void
  logIncident: (incident: Omit<SafetyIncident, 'id' | 'status' | 'date' | 'correctiveAction'>) => void
  resolveIncident: (id: string) => void
  addExpense: (expense: Omit<Expense, 'id' | 'date' | 'approved'>) => void
  assignDriverToVehicle: (vehicleId: string, driverId: string | null) => void
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES)
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS)
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS)
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(INITIAL_MAINTENANCE)
  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncident[]>(INITIAL_SAFETY)
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(INITIAL_FUEL)
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES)
  const [complianceDocuments, setComplianceDocuments] = useState<ComplianceDocument[]>(INITIAL_COMPLIANCE)

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user?.token}`
  }

  useEffect(() => {
    if (!user?.token) return
    async function fetchData() {
      try {
        const [vehRes, drvRes, trpRes] = await Promise.all([
          fetch(`${API_URL}/vehicles`, { headers }),
          fetch(`${API_URL}/drivers`, { headers }),
          fetch(`${API_URL}/trips`, { headers }),
        ])
        if (vehRes.ok) setVehicles(await vehRes.json())
        if (drvRes.ok) setDrivers(await drvRes.json())
        if (trpRes.ok) setTrips(await trpRes.json())
      } catch (err) {
        console.error('Failed to fetch data from backend', err)
      }
    }
    fetchData()
  }, [user?.token])

  // Recalculates compliance document statuses whenever related dates change
  useEffect(() => {
    function complianceStatus(expiry: string): ComplianceDocument['status'] {
      const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (days < 0) return 'EXPIRED'
      if (days <= 30) return 'EXPIRING_SOON'
      return 'VALID'
    }

    setComplianceDocuments(() => {
      const docs: ComplianceDocument[] = []
      vehicles.forEach((v) => {
        docs.push({
          id: `cmp-veh-ins-${v.id}`,
          entityType: 'VEHICLE',
          entityId: v.id,
          entityLabel: `${v.regNumber} · ${v.name}`,
          type: 'INSURANCE',
          expiryDate: v.insuranceExpiry,
          status: complianceStatus(v.insuranceExpiry),
        })
        docs.push({
          id: `cmp-veh-reg-${v.id}`,
          entityType: 'VEHICLE',
          entityId: v.id,
          entityLabel: `${v.regNumber} · ${v.name}`,
          type: 'REGISTRATION',
          expiryDate: v.registrationExpiry,
          status: complianceStatus(v.registrationExpiry),
        })
      })
      drivers.forEach((d) => {
        docs.push({
          id: `cmp-drv-lic-${d.id}`,
          entityType: 'DRIVER',
          entityId: d.id,
          entityLabel: `${d.name} · ${d.licenseNumber}`,
          type: 'LICENSE',
          expiryDate: d.licenseExpiry,
          status: complianceStatus(d.licenseExpiry),
        })
      })
      // Keep static PUC documents for first few vehicles
      vehicles.slice(0, 14).forEach((v, index) => {
        const offsetDays = [10, -5, 45, 12, 90, 4, 30, -2, 60, 15, 80, -12, 100, 2][index % 14]
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + offsetDays)
        const expiryStr = expiry.toISOString()
        docs.push({
          id: `cmp-veh-puc-${v.id}`,
          entityType: 'VEHICLE',
          entityId: v.id,
          entityLabel: `${v.regNumber} · ${v.name}`,
          type: 'PUC',
          expiryDate: expiryStr,
          status: complianceStatus(expiryStr),
        })
      })
      return docs
    })
  }, [vehicles, drivers])

  function vehicleById(id: string | null) {
    if (!id) return null
    return vehicles.find((v) => v.id === id) ?? null
  }

  function driverById(id: string | null) {
    if (!id) return null
    return drivers.find((d) => d.id === id) ?? null
  }

  // Vehicles CRUD
  async function addVehicle(v: Omit<Vehicle, 'id' | 'status' | 'assignedDriverId' | 'odometerKm' | 'lastServiceDate' | 'gpsStatus' | 'riskScore'>) {
    const tempId = `veh-new-${Date.now()}`
    const newVehicle: Vehicle = {
      ...v,
      id: tempId,
      status: 'AVAILABLE',
      assignedDriverId: null,
      odometerKm: 0,
      lastServiceDate: new Date().toISOString(),
      gpsStatus: 'NOT_FITTED',
      riskScore: 10,
    }
    setVehicles((vs) => [newVehicle, ...vs])

    try {
      const res = await fetch(`${API_URL}/vehicles`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newVehicle)
      })
      if (!res.ok) throw new Error('Failed to create vehicle')
      const created = await res.json()
      setVehicles((vs) => vs.map((x) => (x.id === tempId ? created : x)))
    } catch (err) {
      console.error(err)
      setVehicles((vs) => vs.filter((x) => x.id !== tempId))
    }
  }

  function updateVehicle(v: Vehicle) {
    setVehicles((vs) => vs.map((x) => (x.id === v.id ? v : x)))
  }

  async function deleteVehicle(id: string) {
    // Unbind driver ref if dynamic deletion occurs
    setDrivers((ds) => ds.map((d) => (d.assignedVehicleId === id ? { ...d, assignedVehicleId: null } : d)))
    setVehicles((vs) => vs.filter((x) => x.id !== id))
    try {
      await fetch(`${API_URL}/vehicles/${id}`, { method: 'DELETE', headers })
    } catch (err) {
      console.error('Failed to delete vehicle', err)
    }
  }

  // Drivers CRUD
  async function addDriver(d: Omit<Driver, 'id' | 'status' | 'assignedVehicleId' | 'safetyRating' | 'tripCompletionPct' | 'joinedDate' | 'certifications' | 'violationsCount' | 'attendancePct'>) {
    const tempId = `drv-new-${Date.now()}`
    const newDriver: Driver = {
      ...d,
      id: tempId,
      status: 'AVAILABLE',
      assignedVehicleId: null,
      safetyRating: 4.5,
      tripCompletionPct: 100,
      joinedDate: new Date().toISOString(),
      certifications: [],
      violationsCount: 0,
      attendancePct: 100,
    }
    setDrivers((ds) => [newDriver, ...ds])

    try {
      const res = await fetch(`${API_URL}/drivers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newDriver)
      })
      if (!res.ok) throw new Error('Failed to create driver')
      const created = await res.json()
      setDrivers((ds) => ds.map((x) => (x.id === tempId ? created : x)))
    } catch (err) {
      console.error(err)
      setDrivers((ds) => ds.filter((x) => x.id !== tempId))
    }
  }

  function updateDriver(d: Driver) {
    setDrivers((ds) => ds.map((x) => (x.id === d.id ? d : x)))
  }

  async function deleteDriver(id: string) {
    // Unbind vehicle ref if driver is deleted
    setVehicles((vs) => vs.map((v) => (v.assignedDriverId === id ? { ...v, assignedDriverId: null } : v)))
    setDrivers((ds) => ds.filter((x) => x.id !== id))
    try {
      await fetch(`${API_URL}/drivers/${id}`, { method: 'DELETE', headers })
    } catch (err) {
      console.error('Failed to delete driver', err)
    }
  }

  // Assign driver to vehicle (mutual logic)
  function assignDriverToVehicle(vehicleId: string, driverId: string | null) {
    setVehicles((vs) =>
      vs.map((v) => {
        if (v.id === vehicleId) {
          return { ...v, assignedDriverId: driverId }
        }
        // If driver was assigned to another vehicle, unassign it
        if (driverId && v.assignedDriverId === driverId) {
          return { ...v, assignedDriverId: null }
        }
        return v
      })
    )

    setDrivers((ds) =>
      ds.map((d) => {
        if (driverId && d.id === driverId) {
          return { ...d, assignedVehicleId: vehicleId }
        }
        // Unbind previous driver's vehicle reference
        if (!driverId && d.assignedVehicleId === vehicleId) {
          return { ...d, assignedVehicleId: null }
        }
        // Also ensure driver cannot be bound to two vehicles
        if (driverId && d.assignedVehicleId === vehicleId && d.id !== driverId) {
          return { ...d, assignedVehicleId: null }
        }
        return d
      })
    )
  }

  // Trips CRUD & lifecycle
  async function createTrip(t: Omit<Trip, 'id' | 'tripCode' | 'status' | 'actualArrival'>) {
    const tempId = `trip-new-${Date.now()}`
    const newTrip: Trip = {
      ...t,
      id: tempId,
      tripCode: `TRP-${2400 + trips.length + 1}`,
      status: 'DRAFT',
      actualArrival: null,
    }
    setTrips((ts) => [newTrip, ...ts])

    try {
      const res = await fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newTrip)
      })
      if (!res.ok) throw new Error('Failed to create trip')
      const created = await res.json()
      setTrips((ts) => ts.map((x) => (x.id === tempId ? created : x)))
    } catch (err) {
      console.error(err)
      setTrips((ts) => ts.filter((x) => x.id !== tempId))
    }
  }

  function moveTrip(tripId: string, target: TripStatus) {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip || trip.status === target) return

    // If dispatched, mark vehicle & driver as ON_TRIP
    if (target === 'DISPATCHED') {
      if (trip.vehicleId) {
        setVehicles((vs) => vs.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'ON_TRIP' } : v)))
      }
      if (trip.driverId) {
        setDrivers((ds) => ds.map((d) => (d.id === trip.driverId ? { ...d, status: 'ON_TRIP' } : d)))
      }
    }

    // If completed, release vehicle & driver as AVAILABLE, update odometer & service date
    if (target === 'COMPLETED') {
      if (trip.vehicleId) {
        setVehicles((vs) =>
          vs.map((v) =>
            v.id === trip.vehicleId
              ? { ...v, status: 'AVAILABLE', odometerKm: v.odometerKm + trip.estDistanceKm }
              : v
          )
        )
      }
      if (trip.driverId) {
        setDrivers((ds) =>
          ds.map((d) => (d.id === trip.driverId ? { ...d, status: 'AVAILABLE' } : d))
        )
      }
    }

    // If cancelled, release if they were ON_TRIP
    if (target === 'CANCELLED' && (trip.status === 'DISPATCHED' || trip.status === 'IN_PROGRESS')) {
      if (trip.vehicleId) {
        setVehicles((vs) => vs.map((v) => (v.id === trip.vehicleId ? { ...v, status: 'AVAILABLE' } : v)))
      }
      if (trip.driverId) {
        setDrivers((ds) => ds.map((d) => (d.id === trip.driverId ? { ...d, status: 'AVAILABLE' } : d)))
      }
    }

    setTrips((ts) => ts.map((t) => (t.id === tripId ? { ...t, status: target, actualArrival: target === 'COMPLETED' ? new Date().toISOString() : t.actualArrival } : t)))
  }

  // Maintenance lifecycle
  function scheduleMaintenance(log: Omit<MaintenanceLog, 'id' | 'mechanic' | 'mileageKm' | 'serviceDate' | 'completionDate' | 'partsUsed' | 'warranty' | 'approved' | 'status'> & { vehicleId: string; notes?: string }) {
    const vehicle = vehicleById(log.vehicleId)
    const newLog: MaintenanceLog = {
      ...log,
      id: `mnt-new-${Date.now()}`,
      mechanic: 'Unassigned',
      mileageKm: vehicle?.odometerKm ?? 0,
      serviceDate: new Date().toISOString(),
      completionDate: null,
      partsUsed: [],
      warranty: '—',
      status: 'SCHEDULED',
      approved: false,
      notes: log.notes ?? '',
    }
    setMaintenanceLogs((ls) => [newLog, ...ls])
    setVehicles((vs) => vs.map((v) => (v.id === log.vehicleId ? { ...v, status: 'IN_SHOP' } : v)))
  }

  function completeMaintenance(logId: string) {
    const log = maintenanceLogs.find((l) => l.id === logId)
    if (!log) return

    setMaintenanceLogs((ls) =>
      ls.map((l) =>
        l.id === logId
          ? { ...l, status: 'COMPLETED', completionDate: new Date().toISOString(), approved: true }
          : l
      )
    )
    setVehicles((vs) =>
      vs.map((v) =>
        v.id === log.vehicleId
          ? { ...v, status: 'AVAILABLE', lastServiceDate: new Date().toISOString() }
          : v
      )
    )
  }

  function cancelMaintenance(logId: string) {
    const log = maintenanceLogs.find((l) => l.id === logId)
    if (!log) return

    setMaintenanceLogs((ls) => ls.map((l) => (l.id === logId ? { ...l, status: 'CANCELLED' } : l)))
    setVehicles((vs) =>
      vs.map((v) => (v.id === log.vehicleId && v.status === 'IN_SHOP' ? { ...v, status: 'AVAILABLE' } : v))
    )
  }

  // Safety incidents
  function logIncident(incident: Omit<SafetyIncident, 'id' | 'status' | 'date' | 'correctiveAction'>) {
    const newIncident: SafetyIncident = {
      ...incident,
      id: `inc-new-${Date.now()}`,
      status: 'OPEN',
      date: new Date().toISOString(),
      correctiveAction: 'Pending review',
    }
    setSafetyIncidents((is) => [newIncident, ...is])
  }

  function resolveIncident(id: string) {
    setSafetyIncidents((is) => is.map((x) => (x.id === id ? { ...x, status: 'RESOLVED' } : x)))
  }

  // Expenses CRUD
  function addExpense(expense: Omit<Expense, 'id' | 'date' | 'approved'>) {
    const newExpense: Expense = {
      ...expense,
      id: `exp-new-${Date.now()}`,
      date: new Date().toISOString(),
      approved: false,
    }
    setExpenses((es) => [newExpense, ...es])
  }

  return (
    <DataContext.Provider
      value={{
        vehicles,
        drivers,
        trips,
        maintenanceLogs,
        safetyIncidents,
        fuelLogs,
        expenses,
        complianceDocuments,
        vehicleById,
        driverById,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        createTrip,
        moveTrip,
        scheduleMaintenance,
        completeMaintenance,
        cancelMaintenance,
        logIncident,
        resolveIncident,
        addExpense,
        assignDriverToVehicle,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within a DataProvider')
  return ctx
}
