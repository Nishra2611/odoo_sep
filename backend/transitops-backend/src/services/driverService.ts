import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

interface DriverFilters {
  status?: string;
  search?: string;
}

export async function listDrivers(filters: DriverFilters) {
  return prisma.driver.findMany({
    where: {
      status: filters.status as any,
      OR: filters.search
        ? [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { licenseNumber: { contains: filters.search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDriver(id: string) {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: { trips: true },
  });
  if (!driver) throw new AppError('Driver not found', 404);
  return driver;
}

export async function createDriver(data: any) {
  return prisma.driver.create({ data });
}

export async function updateDriver(id: string, data: any) {
  await getDriver(id);
  return prisma.driver.update({ where: { id }, data });
}
