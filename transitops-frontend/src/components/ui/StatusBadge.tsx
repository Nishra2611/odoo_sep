import { Badge } from './Badge'
import {
  VEHICLE_STATUS_STYLES,
  DRIVER_STATUS_STYLES,
  TRIP_STATUS_STYLES,
  MAINTENANCE_STATUS_STYLES,
  SEVERITY_STYLES,
  PRIORITY_STYLES,
} from '@/lib/constants'

const MAPS: Record<string, Record<string, string>> = {
  vehicle: VEHICLE_STATUS_STYLES,
  driver: DRIVER_STATUS_STYLES,
  trip: TRIP_STATUS_STYLES,
  maintenance: MAINTENANCE_STATUS_STYLES,
  severity: SEVERITY_STYLES,
  priority: PRIORITY_STYLES,
}

interface StatusBadgeProps {
  status: string
  kind: keyof typeof MAPS
}

export function StatusBadge({ status, kind }: StatusBadgeProps) {
  const style = MAPS[kind]?.[status] ?? 'bg-slate-100 text-slate-500 border-slate-300'
  return <Badge className={style}>{status.replace(/_/g, ' ')}</Badge>
}
