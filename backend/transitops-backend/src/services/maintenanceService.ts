import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

export async function listMaintenanceLogs(vehicleId?: string) {
  return prisma.maintenanceLog.findMany({
    where: { vehicleId },
    include: { vehicle: true },
    orderBy: { startedAt: 'desc' },
  });
}

/**
 * Logging maintenance automatically moves the vehicle to IN_SHOP, which
 * removes it from every dispatch-eligible dropdown immediately.
 */
export async function startMaintenance(vehicleId: string, description: string, cost: number) {
  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    if (vehicle.status === 'ON_TRIP') {
      throw new AppError('Cannot start maintenance on a vehicle currently on a trip', 400);
    }

    await tx.vehicle.update({ where: { id: vehicleId }, data: { status: 'IN_SHOP' } });

    return tx.maintenanceLog.create({
      data: { vehicleId, description, cost },
    });
  });
}

export async function completeMaintenance(logId: string) {
  return prisma.$transaction(async (tx) => {
    const log = await tx.maintenanceLog.findUnique({ where: { id: logId } });
    if (!log) throw new AppError('Maintenance log not found', 404);
    if (log.completedAt) throw new AppError('Maintenance already marked complete', 400);

    await tx.vehicle.update({ where: { id: log.vehicleId }, data: { status: 'AVAILABLE' } });

    return tx.maintenanceLog.update({
      where: { id: logId },
      data: { completedAt: new Date() },
    });
  });
}
