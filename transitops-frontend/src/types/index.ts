export type Role = 'FLEET_MANAGER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatarInitials: string
}

export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED'

export interface Vehicle {
  id: string
  regNumber: string
  name: string
  type: 'Truck' | 'Van' | 'Trailer' | 'Pickup'
  capacityKg: number
  odometerKm: number
  acquisitionCost: number
  status: VehicleStatus
  assignedDriverId: string | null
  lastServiceDate: string
  insuranceExpiry: string
  registrationExpiry: string
  gpsStatus: 'ONLINE' | 'OFFLINE' | 'NOT_FITTED'
  riskScore: number
}

export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED' | 'LEAVE' | 'EXPIRED_LICENSE'

export interface Driver {
  id: string
  name: string
  phone: string
  email: string
  licenseNumber: string
  licenseExpiry: string
  status: DriverStatus
  assignedVehicleId: string | null
  safetyRating: number
  tripCompletionPct: number
  joinedDate: string
  emergencyContact: string
  certifications: string[]
  violationsCount: number
  attendancePct: number
}

export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED'

export interface Trip {
  id: string
  tripCode: string
  route: string
  pickup: string
  destination: string
  stops: string[]
  driverId: string | null
  vehicleId: string | null
  estDistanceKm: number
  estDurationMin: number
  departureTime: string
  eta: string
  actualArrival: string | null
  cargoDetails: string
  cargoWeightKg: number
  passengerCount: number
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  notes: string
  fuelEstimateL: number
  status: TripStatus
}

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'AWAITING_APPROVAL' | 'CANCELLED'

export interface MaintenanceLog {
  id: string
  vehicleId: string
  serviceType: 'Preventive' | 'Corrective' | 'Inspection' | 'Tyre' | 'Engine' | 'Electrical'
  mechanic: string
  workshop: string
  cost: number
  mileageKm: number
  serviceDate: string
  completionDate: string | null
  partsUsed: string[]
  warranty: string
  status: MaintenanceStatus
  approved: boolean
  notes: string
}

export type IncidentSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'

export interface SafetyIncident {
  id: string
  vehicleId: string | null
  driverId: string | null
  type: 'Accident' | 'Violation' | 'Near Miss' | 'Inspection Failure'
  severity: IncidentSeverity
  status: IncidentStatus
  date: string
  location: string
  description: string
  correctiveAction: string
}

export type DocumentType = 'INSURANCE' | 'PUC' | 'PERMIT' | 'FITNESS' | 'LICENSE' | 'REGISTRATION'

export interface ComplianceDocument {
  id: string
  entityType: 'VEHICLE' | 'DRIVER'
  entityId: string
  entityLabel: string
  type: DocumentType
  expiryDate: string
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED'
}

export interface FuelLog {
  id: string
  vehicleId: string
  date: string
  liters: number
  costPerLiter: number
  totalCost: number
  odometerKm: number
  vendor: string
  efficiencyKmPerL: number
  anomaly: boolean
}

export type ExpenseCategory = 'Fuel' | 'Toll' | 'Repair' | 'Insurance' | 'Permit' | 'Misc'

export interface Expense {
  id: string
  vehicleId: string | null
  category: ExpenseCategory
  amount: number
  date: string
  vendor: string
  approved: boolean
  notes: string
}

export interface AuditLogEntry {
  id: string
  entityType: string
  entityId: string
  action: string
  reason: string | null
  performedBy: string
  createdAt: string
}

export interface KPI {
  label: string
  value: string | number
  delta?: number
  trend?: 'up' | 'down' | 'flat'
}
