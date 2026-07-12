import type { Role } from '@/types'

export const ROLE_LABELS: Record<Role, string> = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
}

export interface NavItem {
  key: string
  label: string
  path: string
  icon: string
  roles: Role[]
}

// Central nav config — single source of truth for sidebar + route guarding.
export const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  },
  {
    key: 'fleet',
    label: 'Fleet',
    path: '/fleet',
    icon: 'Truck',
    roles: ['FLEET_MANAGER', 'DISPATCHER'],
  },
  {
    key: 'drivers',
    label: 'Drivers',
    path: '/drivers',
    icon: 'Users',
    roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER'],
  },
  {
    key: 'trips',
    label: 'Trips',
    path: '/trips',
    icon: 'Route',
    roles: ['FLEET_MANAGER', 'DISPATCHER'],
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    path: '/maintenance',
    icon: 'Wrench',
    roles: ['FLEET_MANAGER', 'SAFETY_OFFICER', 'DISPATCHER'],
  },
  {
    key: 'safety',
    label: 'Safety & Compliance',
    path: '/safety',
    icon: 'ShieldAlert',
    roles: ['FLEET_MANAGER', 'SAFETY_OFFICER'],
  },
  {
    key: 'finance',
    label: 'Fuel & Expenses',
    path: '/finance',
    icon: 'Wallet',
    roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST'],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
    roles: ['FLEET_MANAGER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER'],
  },
  {
    key: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    roles: ['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'],
  },
]

export const VEHICLE_STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-go-soft text-go border-go/30',
  ON_TRIP: 'bg-route-soft text-route border-route/30',
  IN_SHOP: 'bg-signal-soft text-signal-dim border-signal/30',
  RETIRED: 'bg-slate-100 text-slate-500 border-slate-300',
}

export const DRIVER_STATUS_STYLES: Record<string, string> = {
  AVAILABLE: 'bg-go-soft text-go border-go/30',
  ON_TRIP: 'bg-route-soft text-route border-route/30',
  OFF_DUTY: 'bg-slate-100 text-slate-500 border-slate-300',
  SUSPENDED: 'bg-alert-soft text-alert border-alert/30',
  LEAVE: 'bg-signal-soft text-signal-dim border-signal/30',
  EXPIRED_LICENSE: 'bg-alert-soft text-alert border-alert/30',
}

export const TRIP_STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-500 border-slate-300',
  DISPATCHED: 'bg-route-soft text-route border-route/30',
  IN_PROGRESS: 'bg-signal-soft text-signal-dim border-signal/30',
  COMPLETED: 'bg-go-soft text-go border-go/30',
  CANCELLED: 'bg-slate-100 text-slate-500 border-slate-300',
  DELAYED: 'bg-alert-soft text-alert border-alert/30',
}

export const MAINTENANCE_STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-route-soft text-route border-route/30',
  IN_PROGRESS: 'bg-signal-soft text-signal-dim border-signal/30',
  COMPLETED: 'bg-go-soft text-go border-go/30',
  AWAITING_APPROVAL: 'bg-slate-100 text-slate-500 border-slate-300',
  CANCELLED: 'bg-alert-soft text-alert border-alert/30',
}

export const SEVERITY_STYLES: Record<string, string> = {
  LOW: 'bg-go-soft text-go border-go/30',
  MODERATE: 'bg-signal-soft text-signal-dim border-signal/30',
  HIGH: 'bg-alert-soft text-alert border-alert/30',
  CRITICAL: 'bg-alert text-white border-alert',
}

export const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-500 border-slate-300',
  NORMAL: 'bg-route-soft text-route border-route/30',
  HIGH: 'bg-signal-soft text-signal-dim border-signal/30',
  URGENT: 'bg-alert text-white border-alert',
}

export const DEMO_ACCOUNTS: { role: Role; email: string; password: string; name: string }[] = [
  { role: 'FLEET_MANAGER', email: 'manager@transitops.io', password: 'demo1234', name: 'Ananya Kapoor' },
  { role: 'DISPATCHER', email: 'dispatcher@transitops.io', password: 'demo1234', name: 'Rohit Sharma' },
  { role: 'SAFETY_OFFICER', email: 'safety@transitops.io', password: 'demo1234', name: 'Meera Iyer' },
  { role: 'FINANCIAL_ANALYST', email: 'finance@transitops.io', password: 'demo1234', name: 'Devika Rao' },
]
