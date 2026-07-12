import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

interface RecordLocationInput {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
}

/**
 * GeoJSON-flavored shape that maps directly onto a React Leaflet
 * <Marker position={[lat, lng]}> without any client-side reshaping.
 */
interface LeafletPoint {
  vehicleId: string;
  position: [number, number]; // [lat, lng]
  timestamp: string;
}

async function recordLocation(input: RecordLocationInput) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  const location = await prisma.vehicleLocation.create({
    data: {
      vehicleId: input.vehicleId,
      latitude: input.latitude,
      longitude: input.longitude,
      timestamp: input.timestamp ? new Date(input.timestamp) : new Date(),
    },
  });

  return toLeafletPoint(location);
}

/**
 * Latest known position for each vehicle (or a filtered subset), suitable
 * for rendering all fleet markers on a single Leaflet map.
 */
async function getLatestLocations(vehicleIds?: string[]): Promise<LeafletPoint[]> {
  const where = vehicleIds && vehicleIds.length > 0 ? { vehicleId: { in: vehicleIds } } : {};

  // Prisma doesn't have a native "latest per group" query, so we pull
  // ordered rows and dedupe in memory. Fine at fleet scale; if this ever
  // needs to scale to tens of thousands of vehicles, replace with a
  // DISTINCT ON raw query.
  const rows = await prisma.vehicleLocation.findMany({
    where,
    orderBy: { timestamp: 'desc' },
  });

  const seen = new Set<string>();
  const latest: LeafletPoint[] = [];

  for (const row of rows) {
    if (seen.has(row.vehicleId)) continue;
    seen.add(row.vehicleId);
    latest.push(toLeafletPoint(row));
  }

  return latest;
}

/**
 * Location history for a single vehicle (e.g. to draw a Leaflet <Polyline>
 * of its route over a time window). NOT live tracking — just stored pings.
 */
async function getVehicleLocationHistory(
  vehicleId: string,
  options: { from?: string; to?: string; limit?: number } = {}
): Promise<LeafletPoint[]> {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  const rows = await prisma.vehicleLocation.findMany({
    where: {
      vehicleId,
      timestamp: {
        gte: options.from ? new Date(options.from) : undefined,
        lte: options.to ? new Date(options.to) : undefined,
      },
    },
    orderBy: { timestamp: 'asc' },
    take: options.limit ?? 500,
  });

  return rows.map(toLeafletPoint);
}

function toLeafletPoint(row: {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}): LeafletPoint {
  return {
    vehicleId: row.vehicleId,
    position: [row.latitude, row.longitude],
    timestamp: row.timestamp.toISOString(),
  };
}

export const locationService = {
  recordLocation,
  getLatestLocations,
  getVehicleLocationHistory,
};
