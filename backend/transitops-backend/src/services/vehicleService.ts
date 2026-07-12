import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

interface VehicleFilters {
  type?: string;
  status?: string;
  region?: string;
  search?: string;
}

export async function listVehicles(filters: VehicleFilters) {
  return prisma.vehicle.findMany({
    where: {
      type: filters.type as any,
      status: filters.status as any,
      region: filters.region,
      OR: filters.search
        ? [
            { regNumber: { contains: filters.search, mode: 'insensitive' } },
            { model: { contains: filters.search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVehicle(id: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { trips: true, maintenanceLogs: true, fuelLogs: true, expenses: true },
  });
  if (!vehicle) throw new AppError('Vehicle not found', 404);
  return vehicle;
}

export async function createVehicle(data: any) {
  // Uniqueness of regNumber is enforced at the DB level (schema @unique);
  // Prisma will throw P2002 which the global error handler converts to a 409.
  return prisma.vehicle.create({ data });
}

export async function updateVehicle(id: string, data: any) {
  await getVehicle(id); // throws 404 if missing
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(id: string) {
  const vehicle = await getVehicle(id);
  if (vehicle.status === 'ON_TRIP') {
    throw new AppError('Cannot delete a vehicle that is currently on a trip', 400);
  }
  return prisma.vehicle.delete({ where: { id } });
}
