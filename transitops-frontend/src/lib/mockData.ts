import type {
  Vehicle,
  Driver,
  Trip,
  MaintenanceLog,
  SafetyIncident,
  ComplianceDocument,
  FuelLog,
  Expense,
  AuditLogEntry,
  VehicleStatus,
  DriverStatus,
  TripStatus,
} from '@/types'

// Seeded PRNG so the demo dataset is stable across reloads (no backend yet).
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260712)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]
const int = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min
const daysFromNow = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

const CITIES = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Mumbai', 'Pune', 'Indore', 'Jaipur', 'Delhi NCR', 'Nagpur', 'Bhopal', 'Ludhiana']
const VEHICLE_NAMES = ['Tata Ace', 'Ashok Leyland Dost', 'Mahindra Bolero Pickup', 'Eicher Pro 2049', 'Tata 407', 'Force Traveller', 'Tata Signa 3118', 'Mahindra Furio 7', 'Bharat Benz 1215', 'Tata Ultra T.7']
const VEHICLE_TYPES: Vehicle['type'][] = ['Truck', 'Van', 'Trailer', 'Pickup']
const FIRST_NAMES = ['Rohit', 'Amit', 'Vijay', 'Suresh', 'Ramesh', 'Anil', 'Deepak', 'Manoj', 'Sanjay', 'Ravi', 'Ajay', 'Naveen', 'Pradeep', 'Sunil', 'Vikram', 'Arjun', 'Kiran', 'Nitin', 'Rajesh', 'Sandeep', 'Gaurav', 'Harish', 'Yogesh', 'Mahesh']
const LAST_NAMES = ['Sharma', 'Patel', 'Yadav', 'Verma', 'Singh', 'Kumar', 'Joshi', 'Mehta', 'Chauhan', 'Rathod', 'Desai', 'Solanki']
const WORKSHOPS = ['Shree Auto Works', 'City Motors Service', 'Highway Truck Care', 'Speedline Garage', 'Om Sai Repairs']
const VENDORS = ['Indian Oil', 'HP Petrol Pump', 'Bharat Petroleum', 'Reliance Fuel Station']

function regNumber(i: number) {
  const state = pick(['GJ01', 'GJ05', 'MH12', 'RJ14', 'MP09', 'DL08'])
  return `${state} ${String(int(10, 99))} ${pick(['AB', 'CD', 'GH', 'KL', 'PQ'])} ${String(int(1000, 9999))}` + (i === -1 ? '' : '')
}

const VEHICLE_STATUS_POOL: VehicleStatus[] = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'ON_TRIP', 'ON_TRIP', 'IN_SHOP', 'RETIRED']
const DRIVER_STATUS_POOL: DriverStatus[] = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'ON_TRIP', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED', 'LEAVE', 'EXPIRED_LICENSE']

export const VEHICLES: Vehicle[] = Array.from({ length: 22 }).map((_, i) => {
  const status = VEHICLE_STATUS_POOL[i % VEHICLE_STATUS_POOL.length]
  const insuranceOffset = int(-10, 75)
  const registrationOffset = int(-6, 120)
  return {
    id: `veh-${i + 1}`,
    regNumber: regNumber(i),
    name: pick(VEHICLE_NAMES),
    type: pick(VEHICLE_TYPES),
    capacityKg: pick([750, 1250, 1500, 3000, 5000, 9000, 16000]),
    odometerKm: int(8000, 210000),
    acquisitionCost: int(450000, 3200000),
    status,
    assignedDriverId: null,
    lastServiceDate: daysFromNow(-int(5, 160)),
    insuranceExpiry: daysFromNow(insuranceOffset),
    registrationExpiry: daysFromNow(registrationOffset),
    gpsStatus: pick(['ONLINE', 'ONLINE', 'OFFLINE', 'NOT_FITTED']),
    riskScore: status === 'RETIRED' ? 0 : int(5, 95),
  }
})

export const DRIVERS: Driver[] = Array.from({ length: 24 }).map((_, i) => {
  const status = DRIVER_STATUS_POOL[i % DRIVER_STATUS_POOL.length]
  const licenseOffset = status === 'EXPIRED_LICENSE' ? -int(2, 45) : int(-5, 400)
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
  return {
    id: `drv-${i + 1}`,
    name,
    phone: `+91 9${int(100000000, 999999999)}`,
    email: `${name.toLowerCase().replace(' ', '.')}@transitops-demo.io`,
    licenseNumber: `${pick(['GJ', 'MH', 'RJ', 'MP'])}${int(10, 99)}${int(100000000000, 999999999999)}`,
    licenseExpiry: daysFromNow(licenseOffset),
    status,
    assignedVehicleId: null,
    safetyRating: Number((3 + rng() * 2).toFixed(1)),
    tripCompletionPct: int(78, 100),
    joinedDate: daysFromNow(-int(60, 1400)),
    emergencyContact: `+91 9${int(100000000, 999999999)}`,
    certifications: pick([['Hazmat'], ['Defensive Driving'], ['Hazmat', 'First Aid'], ['Heavy Vehicle License'], []]),
    violationsCount: int(0, 4),
    attendancePct: int(82, 100),
  }
})

// Assign drivers <-> vehicles for ON_TRIP pairs to keep referential integrity sensible.
const onTripVehicles = VEHICLES.filter((v) => v.status === 'ON_TRIP')
const onTripDrivers = DRIVERS.filter((d) => d.status === 'ON_TRIP')
onTripVehicles.forEach((v, i) => {
  const d = onTripDrivers[i % onTripDrivers.length]
  if (d) {
    v.assignedDriverId = d.id
    d.assignedVehicleId = v.id
  }
})

const TRIP_STATUS_POOL: TripStatus[] = ['DRAFT', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'DELAYED']

export const TRIPS: Trip[] = Array.from({ length: 42 }).map((_, i) => {
  const status = TRIP_STATUS_POOL[i % TRIP_STATUS_POOL.length]
  const pickup = pick(CITIES)
  let destination = pick(CITIES)
  while (destination === pickup) destination = pick(CITIES)
  const distance = int(80, 950)
  const vehicle = status === 'DRAFT' || status === 'CANCELLED' ? null : pick(VEHICLES.filter((v) => v.status !== 'RETIRED'))
  const driver = vehicle ? pick(DRIVERS.filter((d) => d.status !== 'SUSPENDED' && d.status !== 'EXPIRED_LICENSE')) : null
  return {
    id: `trip-${i + 1}`,
    tripCode: `TRP-${String(2400 + i)}`,
    route: `${pickup} → ${destination}`,
    pickup,
    destination,
    stops: rng() > 0.6 ? [pick(CITIES)] : [],
    driverId: driver?.id ?? null,
    vehicleId: vehicle?.id ?? null,
    estDistanceKm: distance,
    estDurationMin: Math.round(distance / 45 * 60),
    departureTime: daysFromNow(int(-6, 10)),
    eta: daysFromNow(int(-5, 11)),
    actualArrival: status === 'COMPLETED' ? daysFromNow(-int(0, 5)) : null,
    cargoDetails: pick(['General Merchandise', 'FMCG Cartons', 'Steel Coils', 'Textiles', 'Electronics', 'Agri Produce', 'Cement Bags']),
    cargoWeightKg: int(200, 15000),
    passengerCount: 0,
    priority: pick(['LOW', 'NORMAL', 'NORMAL', 'HIGH', 'URGENT']),
    notes: rng() > 0.7 ? 'Customer requested morning delivery slot.' : '',
    fuelEstimateL: Number((distance / 4.2).toFixed(1)),
    status,
  }
})

const SERVICE_TYPES: MaintenanceLog['serviceType'][] = ['Preventive', 'Corrective', 'Inspection', 'Tyre', 'Engine', 'Electrical']
const MAINT_STATUS_POOL: MaintenanceLog['status'][] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'COMPLETED', 'AWAITING_APPROVAL', 'CANCELLED']

export const MAINTENANCE_LOGS: MaintenanceLog[] = Array.from({ length: 28 }).map((_, i) => {
  const vehicle = pick(VEHICLES)
  const status = MAINT_STATUS_POOL[i % MAINT_STATUS_POOL.length]
  return {
    id: `mnt-${i + 1}`,
    vehicleId: vehicle.id,
    serviceType: pick(SERVICE_TYPES),
    mechanic: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    workshop: pick(WORKSHOPS),
    cost: int(1200, 85000),
    mileageKm: vehicle.odometerKm - int(0, 5000),
    serviceDate: daysFromNow(-int(0, 90)),
    completionDate: status === 'COMPLETED' ? daysFromNow(-int(0, 60)) : null,
    partsUsed: pick([['Brake Pads'], ['Engine Oil', 'Oil Filter'], ['Clutch Plate'], ['Tyres x2'], ['Battery'], []]),
    warranty: pick(['6 months', '1 year', 'No warranty', '3 months']),
    status,
    approved: status === 'COMPLETED' || status === 'IN_PROGRESS',
    notes: '',
  }
})

const INCIDENT_TYPES: SafetyIncident['type'][] = ['Accident', 'Violation', 'Near Miss', 'Inspection Failure']
const SEVERITIES: SafetyIncident['severity'][] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
const INCIDENT_STATUS_POOL: SafetyIncident['status'][] = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED']

export const SAFETY_INCIDENTS: SafetyIncident[] = Array.from({ length: 16 }).map((_, i) => {
  const vehicle = pick(VEHICLES)
  const driver = pick(DRIVERS)
  return {
    id: `inc-${i + 1}`,
    vehicleId: vehicle.id,
    driverId: driver.id,
    type: pick(INCIDENT_TYPES),
    severity: SEVERITIES[i % SEVERITIES.length],
    status: INCIDENT_STATUS_POOL[i % INCIDENT_STATUS_POOL.length],
    date: daysFromNow(-int(0, 120)),
    location: pick(CITIES),
    description: pick([
      'Minor collision while reversing at loading dock.',
      'Driver exceeded speed limit on national highway.',
      'Vehicle failed brake inspection during routine check.',
      'Near-miss with pedestrian at signal crossing.',
      'Cargo shifted during transit causing partial spillage.',
    ]),
    correctiveAction: pick(['Driver counselling scheduled', 'Vehicle sent for inspection', 'Written warning issued', 'Pending review']),
  }
})

function complianceStatus(expiry: string): ComplianceDocument['status'] {
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'EXPIRED'
  if (days <= 30) return 'EXPIRING_SOON'
  return 'VALID'
}

export const COMPLIANCE_DOCUMENTS: ComplianceDocument[] = [
  ...VEHICLES.map((v) => ({
    id: `cmp-veh-ins-${v.id}`,
    entityType: 'VEHICLE' as const,
    entityId: v.id,
    entityLabel: `${v.regNumber} · ${v.name}`,
    type: 'INSURANCE' as const,
    expiryDate: v.insuranceExpiry,
    status: complianceStatus(v.insuranceExpiry),
  })),
  ...VEHICLES.map((v) => ({
    id: `cmp-veh-reg-${v.id}`,
    entityType: 'VEHICLE' as const,
    entityId: v.id,
    entityLabel: `${v.regNumber} · ${v.name}`,
    type: 'REGISTRATION' as const,
    expiryDate: v.registrationExpiry,
    status: complianceStatus(v.registrationExpiry),
  })),
  ...VEHICLES.slice(0, 14).map((v, i) => ({
    id: `cmp-veh-puc-${v.id}`,
    entityType: 'VEHICLE' as const,
    entityId: v.id,
    entityLabel: `${v.regNumber} · ${v.name}`,
    type: 'PUC' as const,
    expiryDate: daysFromNow(int(-15, 100)),
    status: 'VALID' as const,
  })).map((d) => ({ ...d, status: complianceStatus(d.expiryDate) })),
  ...DRIVERS.map((d) => ({
    id: `cmp-drv-lic-${d.id}`,
    entityType: 'DRIVER' as const,
    entityId: d.id,
    entityLabel: `${d.name} · ${d.licenseNumber}`,
    type: 'LICENSE' as const,
    expiryDate: d.licenseExpiry,
    status: complianceStatus(d.licenseExpiry),
  })),
]

export const FUEL_LOGS: FuelLog[] = Array.from({ length: 60 }).map((_, i) => {
  const vehicle = pick(VEHICLES)
  const liters = int(20, 220)
  const costPerLiter = Number((94 + rng() * 8).toFixed(2))
  const efficiency = Number((3.2 + rng() * 3.5).toFixed(2))
  const anomaly = rng() > 0.88
  return {
    id: `fuel-${i + 1}`,
    vehicleId: vehicle.id,
    date: daysFromNow(-int(0, 90)),
    liters,
    costPerLiter,
    totalCost: Math.round(liters * costPerLiter),
    odometerKm: vehicle.odometerKm - int(0, 8000),
    vendor: pick(VENDORS),
    efficiencyKmPerL: anomaly ? Number((efficiency * 0.55).toFixed(2)) : efficiency,
    anomaly,
  }
})

const EXPENSE_CATEGORIES: Expense['category'][] = ['Fuel', 'Toll', 'Repair', 'Insurance', 'Permit', 'Misc']

export const EXPENSES: Expense[] = Array.from({ length: 50 }).map((_, i) => {
  const category = pick(EXPENSE_CATEGORIES)
  return {
    id: `exp-${i + 1}`,
    vehicleId: rng() > 0.1 ? pick(VEHICLES).id : null,
    category,
    amount: category === 'Insurance' ? int(8000, 45000) : category === 'Repair' ? int(1500, 60000) : int(200, 8000),
    date: daysFromNow(-int(0, 90)),
    vendor: category === 'Fuel' ? pick(VENDORS) : pick(WORKSHOPS),
    approved: rng() > 0.15,
    notes: '',
  }
})

const AUDIT_ACTIONS = ['DISPATCH_SUCCESS', 'DISPATCH_REJECTED', 'TRIP_COMPLETED', 'TRIP_CANCELLED', 'STATUS_CHANGE', 'MAINTENANCE_STARTED', 'MAINTENANCE_COMPLETED']

export const AUDIT_LOGS: AuditLogEntry[] = Array.from({ length: 34 }).map((_, i) => {
  const action = pick(AUDIT_ACTIONS)
  const isRejection = action === 'DISPATCH_REJECTED'
  return {
    id: `aud-${i + 1}`,
    entityType: pick(['Trip', 'Vehicle', 'Driver']),
    entityId: pick(TRIPS).id,
    action,
    reason: isRejection
      ? pick(['Driver license expired', 'Vehicle under maintenance', 'Cargo weight exceeds capacity', 'Driver already assigned to another trip', 'Vehicle marked retired'])
      : null,
    performedBy: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    createdAt: daysFromNow(-int(0, 30)),
  }
})

export function vehicleById(id: string | null) {
  return VEHICLES.find((v) => v.id === id) ?? null
}
export function driverById(id: string | null) {
  return DRIVERS.find((d) => d.id === id) ?? null
}
